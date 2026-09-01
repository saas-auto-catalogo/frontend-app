import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ScrollText,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { DataFetchError } from '../ui/DataFetchError.js';
import {
  AuditLog,
  dashboardService,
} from '../../services/api/dashboardService.js';
import { ApiError } from '../../types/api.js';
import { formatRelativeTime } from '../../utils/format.js';

export interface AuditLogFilters {
  page: number;
  limit: number;
  action?: string;
  entityName?: string;
  from?: string;
  to?: string;
}

export interface AuditLogsViewProps {
  workspaceId: string;
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
}

const ENTITY_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'Vehicle', label: 'Vehicle' },
  { value: 'Feed', label: 'Feed' },
  { value: 'Workspace', label: 'Workspace' },
];

function isoToDateInput(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateInputToIsoStart(dateValue: string): string | undefined {
  if (!dateValue) return undefined;
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function dateInputToIsoEnd(dateValue: string): string | undefined {
  if (!dateValue) return undefined;
  const date = new Date(`${dateValue}T23:59:59.999`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function formatAbsoluteDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateId(id: string | null, maxLength = 12): string {
  if (!id) return '—';
  if (id.length <= maxLength) return id;
  return `${id.slice(0, maxLength)}…`;
}

function getActionBadge(action: string) {
  if (action.startsWith('VEHICLE_') || action === 'PRICE_CHANGED') {
    return (
      <Badge variant="primary" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
        {action}
      </Badge>
    );
  }

  if (action.startsWith('FEED_SYNC') || action === 'FEED_SYNC_COMPLETED') {
    return (
      <Badge variant="syncing" size="sm" icon={<RefreshCw className="w-3 h-3" />}>
        {action}
      </Badge>
    );
  }

  if (action.includes('FAILED') || action.includes('ERROR')) {
    return (
      <Badge variant="error" size="sm" icon={<AlertCircle className="w-3 h-3" />}>
        {action}
      </Badge>
    );
  }

  return <Badge variant="neutral" size="sm">{action}</Badge>;
}

export function AuditLogsView({ workspaceId, filters, onFiltersChange }: AuditLogsViewProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const [draftAction, setDraftAction] = useState(filters.action ?? '');
  const [draftEntityName, setDraftEntityName] = useState(filters.entityName ?? '');
  const [draftFrom, setDraftFrom] = useState(isoToDateInput(filters.from));
  const [draftTo, setDraftTo] = useState(isoToDateInput(filters.to));

  useEffect(() => {
    setDraftAction(filters.action ?? '');
    setDraftEntityName(filters.entityName ?? '');
    setDraftFrom(isoToDateInput(filters.from));
    setDraftTo(isoToDateInput(filters.to));
  }, [filters.action, filters.entityName, filters.from, filters.to]);

  const loadLogs = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setForbidden(false);

      const result = await dashboardService.listAuditLogs(workspaceId, {
        page: filters.page,
        limit: filters.limit,
        action: filters.action || undefined,
        entityName: filters.entityName || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      });

      setLogs(result.items);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
      setHasNextPage(result.pagination.hasNextPage);
      setHasPrevPage(result.pagination.hasPrevPage);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 403) {
        setForbidden(true);
        setLogs([]);
        return;
      }

      const message = err instanceof Error ? err.message : 'Erro ao carregar log de auditoria';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, filters]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const handleApplyFilters = (event: FormEvent) => {
    event.preventDefault();
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      action: draftAction.trim() || undefined,
      entityName: draftEntityName || undefined,
      from: dateInputToIsoStart(draftFrom),
      to: dateInputToIsoEnd(draftTo),
    });
  };

  const handleClearFilters = () => {
    setDraftAction('');
    setDraftEntityName('');
    setDraftFrom('');
    setDraftTo('');
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  if (forbidden) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <p className="text-sm text-typography-muted max-w-md">
              Acesso restrito. Apenas gestores podem visualizar o log de auditoria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <DataFetchError message={error} onRetry={loadLogs} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-typography-heading">Log de Auditoria</h3>
              <span className="bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs px-2 py-0.5 rounded-full">
                {loading ? 'Carregando...' : `${total} registros`}
              </span>
            </div>
            <p className="text-xs text-typography-muted mt-0.5">
              Trilha imutável de ações sensíveis no workspace.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadLogs()}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <form
          onSubmit={handleApplyFilters}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-typography-muted uppercase tracking-wide">
              Ação
            </span>
            <input
              type="text"
              value={draftAction}
              onChange={(e) => setDraftAction(e.target.value)}
              placeholder="Ex: VEHICLE_UPDATED"
              className="text-xs border border-surface-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-typography-muted uppercase tracking-wide">
              Entidade
            </span>
            <select
              value={draftEntityName}
              onChange={(e) => setDraftEntityName(e.target.value)}
              className="text-xs border border-surface-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              {ENTITY_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-typography-muted uppercase tracking-wide">
              De
            </span>
            <input
              type="date"
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
              className="text-xs border border-surface-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-typography-muted uppercase tracking-wide">
              Até
            </span>
            <input
              type="date"
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
              className="text-xs border border-surface-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </label>

          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">
              Filtrar
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleClearFilters}>
              Limpar
            </Button>
          </div>
        </form>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted/60 border-b border-surface-border text-[11px] font-bold text-typography-muted uppercase tracking-wider">
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Ação</th>
                <th className="py-3 px-4">Entidade</th>
                <th className="py-3 px-4">Ator</th>
                <th className="py-3 px-4">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-typography-muted">
                    Carregando registros de auditoria...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-typography-muted">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span title={formatAbsoluteDateTime(log.createdAt)}>
                        {formatRelativeTime(log.createdAt)}
                      </span>
                      <p className="text-[10px] text-typography-muted font-mono mt-0.5">
                        {formatAbsoluteDateTime(log.createdAt)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-typography-heading">{log.entityName}</p>
                      <p className="text-[10px] text-typography-muted font-mono">
                        {truncateId(log.entityId)}
                      </p>
                      {log.metadata && typeof log.metadata.message === 'string' ? (
                        <p className="text-[11px] text-typography-muted mt-0.5">
                          {log.metadata.message}
                        </p>
                      ) : null}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-mono text-typography-body">{log.actorEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-typography-muted">
                      {log.ipAddress ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-surface-border bg-surface-muted/30">
          <p className="text-xs text-typography-muted">
            Página {filters.page} de {Math.max(totalPages, 1)} · {total} registros
          </p>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-typography-muted">
              Por página
              <select
                value={filters.limit}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    page: 1,
                    limit: Number(e.target.value),
                  })
                }
                className="border border-surface-border rounded-md px-2 py-1 bg-white text-typography-body"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrevPage || loading}
                onClick={() => onFiltersChange({ ...filters, page: filters.page - 1 })}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage || loading}
                onClick={() => onFiltersChange({ ...filters, page: filters.page + 1 })}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
