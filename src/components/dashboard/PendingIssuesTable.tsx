import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { AlertCircle, AlertTriangle, ArrowUpRight, ImageOff, DollarSign, FileWarning, RefreshCw } from 'lucide-react';
import {
  dashboardService,
  CatalogIssueItem,
} from '../../services/api/dashboardService.js';
import { formatRelativeTime } from '../../utils/format.js';
import { DataFetchError } from '../ui/DataFetchError.js';

export interface PendingIssuesTableProps {
  workspaceId: string;
}

export function PendingIssuesTable({ workspaceId }: PendingIssuesTableProps) {
  const [issues, setIssues] = useState<CatalogIssueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadIssues = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getDashboardIssues(workspaceId);
      setIssues(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar pendências de estoque';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void loadIssues();
  }, [loadIssues]);

  const getIssueIcon = (type: CatalogIssueItem['issueType']) => {
    switch (type) {
      case 'MISSING_IMAGES':
        return <ImageOff className="w-4 h-4 text-brand-price" />;
      case 'PRICE_ZERO':
        return <DollarSign className="w-4 h-4 text-brand-price" />;
      case 'INVALID_VIN':
      case 'YEAR_INVALID':
        return <FileWarning className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-brand-primary" />;
    }
  };

  if (error && issues.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <DataFetchError message={error} onRetry={loadIssues} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-typography-heading">
              Diagnóstico de Pendências de Estoque
            </h3>
            <span className="bg-red-50 text-brand-price border border-red-200 font-bold text-xs px-2 py-0.5 rounded-full">
              {loading ? 'Verificando...' : `${issues.length} Veículos Requerem Atenção`}
            </span>
          </div>
          <p className="text-xs text-typography-muted mt-0.5">
            Veículos com dados incompletos são temporariamente desativados do Feed Meta DAA para proteger o orçamento de anúncios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />} onClick={() => void loadIssues()}>
            Atualizar
          </Button>
          <Button variant="outline" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />} onClick={() => alert('Exportando relatório CSV de pendências de estoque...')}>
            Exportar Relatório
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {!loading && issues.length === 0 ? (
          <div className="py-12 px-4 text-center text-sm text-typography-muted">
            Nenhuma pendência no estoque. Todos os veículos estão elegíveis para o Meta Ads DAA.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted/60 border-b border-surface-border text-[11px] font-bold text-typography-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Veículo</th>
                  <th className="py-3 px-4">Placa / ID</th>
                  <th className="py-3 px-4">Motivo da Pendência</th>
                  <th className="py-3 px-4">Severidade</th>
                  <th className="py-3 px-4">Detectado</th>
                  <th className="py-3 px-4 text-right">Ação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-xs">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-surface-muted border border-surface-border overflow-hidden shrink-0 flex items-center justify-center">
                          {issue.imageUrl ? (
                            <img src={issue.imageUrl} alt={issue.model} className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff className="w-4 h-4 text-typography-subtle" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-typography-heading">{issue.make} {issue.model}</p>
                          <p className="text-[11px] text-typography-muted line-clamp-1">{issue.vehicleId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold text-typography-body bg-surface-muted px-2 py-0.5 rounded border border-surface-border">
                        {issue.licensePlate}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2 max-w-sm">
                        <span className="mt-0.5 shrink-0">{getIssueIcon(issue.issueType)}</span>
                        <div>
                          <p className="text-typography-heading font-medium leading-tight">{issue.description}</p>
                          <p className="text-[11px] text-typography-muted mt-0.5">{issue.recommendation}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {issue.severity === 'BLOCKING' ? (
                        <Badge variant="error" size="sm" icon={<AlertCircle className="w-3 h-3 text-brand-price" />}>
                          Bloqueante
                        </Badge>
                      ) : (
                        <Badge variant="syncing" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-600" />}>
                          Alerta
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-typography-muted whitespace-nowrap">
                      {formatRelativeTime(issue.detectedAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Abrindo formulário de correção para o veículo ${issue.vehicleId} no DMS`)}
                      >
                        Corrigir no DMS
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
