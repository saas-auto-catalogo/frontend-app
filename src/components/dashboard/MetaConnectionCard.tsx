import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { CheckCircle2, RefreshCw, Copy, Check, AlertTriangle, Rss } from 'lucide-react';
import { type CatalogStatus, type MetaCatalogSummary } from '../../services/api/dashboardService.js';
import { metaService } from '../../services/api/metaService.js';
import { formatRelativeTime, formatSyncStatus } from '../../utils/format.js';
import { DataFetchError } from '../ui/DataFetchError.js';

export interface MetaConnectionCardProps {
  workspaceId: string;
  catalogStatus?: CatalogStatus;
  activeFeedId?: string;
  onTriggerSync?: () => void | Promise<void>;
  isSyncing?: boolean;
}

function getConnectionBadge(status?: CatalogStatus, exportStatus?: string | null) {
  if (exportStatus === 'FAILED') {
    return { label: 'Erro na Exportação', variant: 'error' as const };
  }
  if (status === 'CRITICAL') {
    return { label: 'Atenção Crítica', variant: 'error' as const };
  }
  if (status === 'WARNING') {
    return { label: 'Atenção', variant: 'syncing' as const };
  }
  return { label: 'Conectado & Ativo', variant: 'available' as const };
}

export function MetaConnectionCard({
  workspaceId,
  catalogStatus,
  activeFeedId,
  onTriggerSync,
  isSyncing: externalIsSyncing,
}: MetaConnectionCardProps) {
  const [catalog, setCatalog] = useState<MetaCatalogSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [internalIsSyncing, setInternalIsSyncing] = useState<boolean>(false);
  const prevExternalSyncing = useRef<boolean | undefined>(externalIsSyncing);

  const isSyncing = externalIsSyncing !== undefined ? externalIsSyncing : internalIsSyncing;
  const canSync = Boolean(activeFeedId);

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await metaService.getCatalogHealth(workspaceId);
      setCatalog(result.catalog);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar catálogo Meta';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalogData();
  }, [workspaceId]);

  useEffect(() => {
    if (prevExternalSyncing.current && externalIsSyncing === false) {
      void loadCatalogData();
    }
    prevExternalSyncing.current = externalIsSyncing;
  }, [externalIsSyncing]);

  const handleTriggerSync = async () => {
    setSyncError(null);

    if (onTriggerSync) {
      await onTriggerSync();
      return;
    }

    if (!activeFeedId) {
      setSyncError('Configure um feed DMS antes de sincronizar o catálogo Meta.');
      return;
    }

    try {
      setInternalIsSyncing(true);
      const result = await metaService.triggerFeedSync(workspaceId, activeFeedId);
      if (!result.success) {
        setSyncError(result.message);
        return;
      }
      await loadCatalogData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao sincronizar o feed DMS.';
      setSyncError(message);
    } finally {
      setInternalIsSyncing(false);
    }
  };

  const feedUrl = metaService.getPublicFeedUrl(catalog) ?? '';
  const eligible = catalog?.eligibleVehiclesCount ?? 0;
  const total = catalog?.totalVehiclesCount ?? 0;
  const healthPercentage = catalog?.healthScore ?? (total > 0 ? Math.round((eligible / total) * 100) : 0);
  const badge = getConnectionBadge(catalogStatus, catalog?.lastExportStatus);

  const handleCopyUrl = () => {
    if (!feedUrl) return;
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error && !catalog) {
    return (
      <Card className="overflow-hidden border-slate-200">
        <CardContent className="p-6">
          <DataFetchError message={error} onRetry={() => void loadCatalogData()} />
        </CardContent>
      </Card>
    );
  }

  if (!loading && !catalog) {
    return (
      <Card className="overflow-hidden border-slate-200">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center mx-auto">
            <Rss className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-typography-heading">
              Catálogo Meta não configurado
            </h3>
            <p className="text-sm text-typography-muted max-w-md mx-auto">
              Configure um feed DMS e sincronize seu estoque para gerar o catálogo Meta Ads com URL
              pública, contagem de veículos e health score reais.
            </p>
          </div>
          {!canSync ? (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
              Nenhum feed DMS ativo encontrado neste workspace.
            </p>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-slate-200">
      <CardHeader className="bg-gradient-to-r from-blue-50/70 via-white to-white flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
            f
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-typography-heading">
                Meta Commerce Manager & Automotive Ads
              </h3>
              <Badge variant={badge.variant} size="sm" dot>
                {badge.label}
              </Badge>
            </div>
            <p className="text-xs text-typography-muted">
              Sincronização programada direta com a Meta Graph API v21.0
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
          onClick={() => void handleTriggerSync()}
          loading={isSyncing}
          disabled={!canSync && !onTriggerSync}
        >
          Disparar Sync Meta
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {syncError ? (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {syncError}
          </p>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-surface-muted/60 border border-surface-border">
          <div>
            <span className="text-[11px] font-semibold text-typography-muted uppercase tracking-wider">
              Catálogo Meta
            </span>
            <p className="text-sm font-bold text-typography-heading mt-0.5 truncate">
              {loading ? 'Carregando...' : catalog?.catalogName ?? 'Nenhum catálogo configurado'}
            </p>
            <p className="text-[11px] font-mono text-typography-subtle">
              {catalog?.metaCatalogId ? `ID: ${catalog.metaCatalogId}` : 'ID: —'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-typography-muted uppercase tracking-wider">
                Saúde do Catálogo
              </span>
              <span className="text-xs font-bold text-brand-accent">
                {loading ? 'Calculando...' : `${healthPercentage}% Saudável`}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-brand-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-typography-muted mt-1">
              <strong>{eligible}</strong> de <strong>{total}</strong> veículos em conformidade
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-typography-muted uppercase tracking-wider">
              Última Exportação
            </span>
            <p className="text-xs font-medium text-typography-heading mt-0.5 flex items-center gap-1">
              {catalog?.lastExportStatus === 'FAILED' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-brand-primary" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />
              )}
              <span>
                {loading
                  ? 'Carregando...'
                  : formatRelativeTime(catalog?.lastExportAt ?? null)}
              </span>
            </p>
            <p className="text-[11px] text-typography-subtle">
              {catalog?.feedFormat
                ? `${catalog.feedFormat} · ${formatSyncStatus(catalog.lastExportStatus)}`
                : '—'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-900 rounded-lg text-white">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-blue-300 font-semibold uppercase">
                Feed XML Atom DAA
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                Cache Redis 15m
              </span>
            </div>
            <p className="text-xs font-mono text-slate-300 truncate mt-0.5">
              {feedUrl || 'URL do feed não configurada'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyUrl}
              disabled={!feedUrl}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-brand-accent" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? 'Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
