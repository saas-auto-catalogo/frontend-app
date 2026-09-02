import { useCallback, useEffect, useState } from 'react';
import {
  Car,
  CheckCircle2,
  Package,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { MetricCard } from '../ui/MetricCard.js';
import { MetricCardSkeleton } from '../ui/MetricCardSkeleton.js';
import { DataFetchError } from '../ui/DataFetchError.js';
import { useWorkspace } from '../../hooks/useWorkspace.js';
import {
  dashboardService,
  DashboardStats,
  MetaCatalogSummary,
} from '../../services/api/dashboardService.js';
import { feedService, FeedConfigSummary } from '../../services/api/feedService.js';
import { formatRelativeTime, formatSyncStatus } from '../../utils/format.js';

export interface OnboardingFinishOptions {
  tab?: string;
}

export interface OnboardingSummaryStepProps {
  onFinish: (options?: OnboardingFinishOptions) => void;
  isFinishing?: boolean;
}

function getFeedStatusBadge(
  status: DashboardStats['lastDmsSync']['status'] | FeedConfigSummary['lastSyncStatus'],
) {
  if (!status) {
    return { label: 'Aguardando sync', variant: 'neutral' as const };
  }
  if (status === 'SUCCESS') {
    return { label: formatSyncStatus(status), variant: 'available' as const };
  }
  if (status === 'RUNNING') {
    return { label: formatSyncStatus(status), variant: 'syncing' as const };
  }
  if (status === 'FAILED') {
    return { label: formatSyncStatus(status), variant: 'error' as const };
  }
  return { label: formatSyncStatus(status), variant: 'syncing' as const };
}

function getMetaStatusBadge(catalog: MetaCatalogSummary | null) {
  if (!catalog?.metaCatalogId) {
    return { label: 'Não configurada (opcional)', variant: 'neutral' as const };
  }
  if (catalog.lastExportStatus === 'FAILED') {
    return { label: 'Erro na exportação', variant: 'error' as const };
  }
  if (catalog.lastExportStatus === 'SUCCESS') {
    return { label: 'Conectada', variant: 'available' as const };
  }
  return { label: 'Configurada', variant: 'primary' as const };
}

export function OnboardingSummaryStep({ onFinish, isFinishing = false }: OnboardingSummaryStepProps) {
  const { workspaceId } = useWorkspace();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [feeds, setFeeds] = useState<FeedConfigSummary[]>([]);
  const [catalog, setCatalog] = useState<MetaCatalogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [statsData, feedsData, catalogsData] = await Promise.all([
        dashboardService.getStats(workspaceId),
        feedService.listFeeds(workspaceId),
        dashboardService.listMetaCatalogs(workspaceId),
      ]);
      setStats(statsData);
      setFeeds(feedsData);
      setCatalog(catalogsData[0] ?? null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar resumo do catálogo';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const primaryFeed = feeds.find((f) => f.isActive) ?? feeds[0];
  const hasFeed = feeds.length > 0;
  const lastSyncAt = stats?.lastDmsSync.at ?? primaryFeed?.lastSyncAt ?? null;
  const lastSyncSource = stats?.lastDmsSync.sourceName ?? primaryFeed?.sourceType ?? null;
  const lastSyncStatus = stats?.lastDmsSync.status ?? primaryFeed?.lastSyncStatus ?? null;
  const feedBadge = getFeedStatusBadge(lastSyncStatus);
  const metaBadge = getMetaStatusBadge(catalog);

  if (!workspaceId) {
    return (
      <DataFetchError message="Workspace não encontrado. Faça login novamente." />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center gap-2 py-2">
          <div className="w-12 h-12 rounded-full bg-brand-accentLight text-brand-accent flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-typography-heading">Tudo pronto!</h3>
          <p className="text-sm text-typography-muted max-w-md">
            Carregando o resumo do seu catálogo...
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return <DataFetchError message={error} onRetry={() => void loadSummary()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center gap-2 py-2">
        <div className="w-12 h-12 rounded-full bg-brand-accentLight text-brand-accent flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-typography-heading">Tudo pronto!</h3>
        <p className="text-sm text-typography-muted max-w-md">
          Seu catálogo está configurado. Revise o resumo abaixo e conclua para acessar o dashboard.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Total no Estoque"
            value={`${stats.totalVehicles} veículos`}
            subtitle={
              stats.availableVehicles > 0
                ? `${stats.availableVehicles} disponíveis para venda`
                : 'Nenhum veículo disponível ainda'
            }
            icon={<Car className="w-5 h-5 text-brand-primary" />}
            variant="primary"
          />

          <MetricCard
            title="Feed DMS"
            value={hasFeed ? (lastSyncSource ?? 'Feed configurado') : 'Não configurado'}
            subtitle={
              hasFeed
                ? `Última sync: ${formatRelativeTime(lastSyncAt)}`
                : 'Configure o feed no passo 2'
            }
            icon={<RefreshCw className="w-5 h-5 text-brand-primary" />}
            trend={
              hasFeed
                ? {
                    value: feedBadge.label,
                    isPositive: lastSyncStatus === 'SUCCESS',
                  }
                : undefined
            }
          />

          <MetricCard
            title="Meta Ads"
            value={catalog?.metaCatalogId ? catalog.catalogName : 'Não conectada'}
            subtitle={
              catalog?.metaCatalogId
                ? `${catalog.eligibleVehiclesCount} veículos elegíveis`
                : 'Integração opcional — configure depois'
            }
            icon={<Share2 className="w-5 h-5 text-brand-accent" />}
            variant="accent"
          />
        </div>
      )}

      <Card className="p-4 space-y-3">
        <p className="text-xs font-semibold text-typography-muted uppercase tracking-wider">
          Status das integrações
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant={feedBadge.variant} dot>
            Feed: {hasFeed ? feedBadge.label : 'Não configurado'}
          </Badge>
          <Badge variant={metaBadge.variant} dot>
            Meta: {metaBadge.label}
          </Badge>
          {stats && stats.eligibleForMetaAds > 0 && (
            <Badge variant="available" dot>
              {stats.eligibleForMetaAds} elegíveis no Meta DAA
            </Badge>
          )}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="outline"
          size="md"
          icon={<Package className="w-4 h-4" />}
          onClick={() => onFinish({ tab: 'inventory' })}
          disabled={isFinishing}
          loading={isFinishing}
          className="flex-1"
        >
          Ver inventário
        </Button>
        <Button
          variant="outline"
          size="md"
          icon={<Share2 className="w-4 h-4" />}
          onClick={() => onFinish({ tab: 'meta-feed' })}
          disabled={isFinishing}
          loading={isFinishing}
          className="flex-1"
        >
          Configurar catálogo Meta
        </Button>
      </div>
    </div>
  );
}
