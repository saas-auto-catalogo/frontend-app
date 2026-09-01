import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../ui/Card.js';
import {
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Tag,
  Check,
  AlertCircle,
} from 'lucide-react';
import { dashboardService, ActivityEvent } from '../../services/api/dashboardService.js';
import { formatRelativeTime } from '../../utils/format.js';
import { DataFetchError } from '../ui/DataFetchError.js';
import { useWorkspace } from '../../hooks/useWorkspace.js';

export interface ActivityTimelineProps {
  workspaceId: string;
}

const AUDIT_LOG_ROLES = new Set(['MANAGER', 'OWNER', 'SUPER_ADMIN']);

function getActivityVisual(type: string): { icon: JSX.Element; badgeBg: string } {
  switch (type) {
    case 'SYNC_DMS':
      return {
        icon: <RefreshCw className="w-3.5 h-3.5 text-brand-primary" />,
        badgeBg: 'bg-brand-primaryLight border-brand-primary/30',
      };
    case 'SYNC_FAILED':
      return {
        icon: <AlertCircle className="w-3.5 h-3.5 text-brand-price" />,
        badgeBg: 'bg-red-50 border-red-200',
      };
    case 'PRICE_CHANGED':
      return {
        icon: <Tag className="w-3.5 h-3.5 text-brand-price" />,
        badgeBg: 'bg-brand-priceLight border-brand-price/30',
      };
    case 'VEHICLE_UPDATED':
      return {
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />,
        badgeBg: 'bg-slate-100 border-slate-300',
      };
    default:
      return {
        icon: <Check className="w-3.5 h-3.5 text-brand-accent" />,
        badgeBg: 'bg-brand-accentLight border-brand-accent/30',
      };
  }
}

export function ActivityTimeline({ workspaceId }: ActivityTimelineProps) {
  const navigate = useNavigate();
  const { role } = useWorkspace();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const canViewAuditLog = role ? AUDIT_LOG_ROLES.has(role) : false;

  const loadActivity = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getDashboardActivity(workspaceId);
      setEvents(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar atividades recentes';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  if (error && events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <DataFetchError message={error} onRetry={loadActivity} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between py-4">
        <div>
          <h3 className="text-sm font-bold text-typography-heading">
            Atividades Recentes do Estoque
          </h3>
          <p className="text-xs text-typography-muted">
            Auditoria em tempo real de diffs e sincronizações
          </p>
        </div>
        {canViewAuditLog && (
          <button
            type="button"
            className="text-xs font-semibold text-brand-primary hover:text-brand-primaryHover flex items-center gap-1"
            onClick={() => navigate('/audit-logs')}
          >
            Ver Log Completo
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-xs text-typography-muted py-4 text-center">Carregando atividades...</p>
        ) : events.length === 0 ? (
          <p className="text-xs text-typography-muted py-8 text-center">
            Nenhuma atividade recente registrada.
          </p>
        ) : (
          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-border">
            {events.map((event) => {
              const { icon, badgeBg } = getActivityVisual(event.type);

              return (
                <div key={event.id} className="relative group">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center bg-white shadow-sm ${badgeBg}`}
                  >
                    {icon}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-typography-heading">{event.title}</p>
                      <span className="text-[10px] text-typography-subtle font-mono shrink-0">
                        {formatRelativeTime(event.occurredAt)}
                      </span>
                    </div>
                    <p className="text-xs text-typography-body mt-0.5 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
