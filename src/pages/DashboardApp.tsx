import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar.js';
import { Header } from '../components/layout/Header.js';
import { MetricCard } from '../components/ui/MetricCard.js';
import { MetricCardSkeleton } from '../components/ui/MetricCardSkeleton.js';
import { DataFetchError } from '../components/ui/DataFetchError.js';
import { MetaConnectionCard } from '../components/dashboard/MetaConnectionCard.js';
import { PendingIssuesTable } from '../components/dashboard/PendingIssuesTable.js';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline.js';
import { Button } from '../components/ui/Button.js';
import {
  Car,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

import { XmlMapperStudio } from '../components/xml-mapper/XmlMapperStudio.js';
import { InventoryManager } from '../components/inventory/InventoryManager.js';
import { useAuth } from '../context/AuthContext.js';
import { useWorkspace } from '../hooks/useWorkspace.js';
import { dashboardService, DashboardStats } from '../services/api/dashboardService.js';
import { feedService, FeedConfigSummary } from '../services/api/feedService.js';
import { metaService } from '../services/api/metaService.js';
import { formatDurationMs, formatRelativeTime, formatSyncStatus } from '../utils/format.js';

const POLL_INTERVAL_MS = 60_000;

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function DashboardApp() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { workspaceId, workspaceName } = useWorkspace();
  const [activeTab, setActiveTab] = useState<string>(
    (location.state as { tab?: string } | null)?.tab ?? 'dashboard',
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [feeds, setFeeds] = useState<FeedConfigSummary[]>([]);
  const [publicFeedUrl, setPublicFeedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dealershipName = workspaceName ?? 'Minha Revenda';

  useEffect(() => {
    const tabFromState = (location.state as { tab?: string } | null)?.tab;
    if (tabFromState) {
      setActiveTab(tabFromState);
    }
  }, [location.state]);

  const loadDashboard = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [statsData, feedsData, catalogHealth] = await Promise.all([
        dashboardService.getStats(workspaceId),
        feedService.listFeeds(workspaceId),
        metaService.getCatalogHealth(workspaceId),
      ]);
      setStats(statsData);
      setFeeds(feedsData);
      setPublicFeedUrl(catalogHealth.catalog?.publicFeedUrl ?? null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    setLoading(true);
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!workspaceId) return;

    const intervalId = setInterval(() => {
      void loadDashboard();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [workspaceId, loadDashboard]);

  const handleTriggerSync = async () => {
    if (!workspaceId) return;

    setSyncError(null);

    try {
      setIsSyncing(true);

      const activeFeed = feeds.find((feed) => feed.isActive) ?? feeds[0];
      if (!activeFeed) {
        setSyncError('Configure um feed DMS antes de sincronizar o catálogo Meta.');
        return;
      }

      const result = await metaService.triggerFeedSync(workspaceId, activeFeed.id);
      if (!result.success) {
        setSyncError(result.message);
        return;
      }

      await loadDashboard();
      setInventoryRefreshKey((prev) => prev + 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao sincronizar o feed DMS.';
      setSyncError(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const primaryFeed = feeds.find((f) => f.isActive) ?? feeds[0];
  const lastSyncAt = stats?.lastDmsSync.at ?? primaryFeed?.lastSyncAt ?? null;
  const lastSyncSource = stats?.lastDmsSync.sourceName ?? primaryFeed?.sourceType ?? 'DMS';
  const lastSyncDuration = stats?.lastDmsSync.durationMs;
  const lastSyncStatus = stats?.lastDmsSync.status ?? primaryFeed?.lastSyncStatus;

  return (
    <div className="min-h-screen flex bg-surface-canvas text-typography-body">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingIssuesCount={stats?.pendingIssuesCount ?? 0}
        totalVehicles={stats?.totalVehicles}
        eligibleForMetaAds={stats?.eligibleForMetaAds}
        healthScore={stats?.healthScore}
        workspaceName={workspaceName}
        isLoading={loading && !stats}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          dealershipName={dealershipName}
          workspaceId={workspaceId}
          publicFeedUrl={publicFeedUrl}
          userName={user?.name}
          userInitials={user ? getUserInitials(user.name) : undefined}
          onRefreshSync={handleTriggerSync}
          isSyncing={isSyncing}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {syncError ? (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {syncError}
            </p>
          ) : null}

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {error && !stats && (
                <DataFetchError message={error} onRetry={loadDashboard} />
              )}

              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading && !stats ? (
                  <>
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                  </>
                ) : stats ? (
                  <>
                    <MetricCard
                      title="Total no Estoque"
                      value={`${stats.totalVehicles} veículos`}
                      subtitle="Inventário ativo multi-loja"
                      icon={<Car className="w-5 h-5 text-brand-primary" />}
                      trend={{
                        value: `+${stats.newVehiclesThisMonth} novos este mês`,
                        isPositive: stats.newVehiclesThisMonth > 0,
                      }}
                    />

                    <MetricCard
                      title="Elegíveis no Meta DAA"
                      value={`${stats.eligibleForMetaAds} veículos`}
                      subtitle="Fotos e preços válidos"
                      icon={<CheckCircle2 className="w-5 h-5" />}
                      trend={{
                        value: `${stats.healthScore}% aprovados`,
                        isPositive: stats.healthScore >= 95,
                      }}
                      variant="accent"
                    />

                    <MetricCard
                      title="Pendências de Dados"
                      value={`${stats.pendingIssuesCount} veículos`}
                      subtitle="Requerem correção rápida"
                      icon={<AlertTriangle className="w-5 h-5 text-brand-price" />}
                      trend={{
                        value: `${stats.blockingIssuesCount} erros críticos`,
                        isPositive: stats.blockingIssuesCount === 0,
                      }}
                      variant="primary"
                    />

                    <MetricCard
                      title="Última Sincronização"
                      value={formatRelativeTime(lastSyncAt)}
                      subtitle={`${lastSyncSource}${lastSyncDuration != null ? ` (${formatDurationMs(lastSyncDuration)})` : ''}`}
                      icon={<RefreshCw className="w-5 h-5 text-brand-primary" />}
                      trend={{
                        value: `Status: ${formatSyncStatus(lastSyncStatus)}`,
                        isPositive: lastSyncStatus === 'SUCCESS',
                      }}
                    />
                  </>
                ) : null}
              </section>

              {workspaceId && (
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <MetaConnectionCard
                      workspaceId={workspaceId}
                      catalogStatus={stats?.catalogStatus}
                      activeFeedId={primaryFeed?.id}
                      onTriggerSync={handleTriggerSync}
                      isSyncing={isSyncing}
                    />
                  </div>
                  <div>
                    <ActivityTimeline workspaceId={workspaceId} />
                  </div>
                </section>
              )}

              {workspaceId && (
                <section>
                  <PendingIssuesTable workspaceId={workspaceId} />
                </section>
              )}
            </div>
          )}

          {activeTab === 'inventory' && workspaceId && (
            <div className="space-y-6">
              <InventoryManager workspaceId={workspaceId} refreshKey={inventoryRefreshKey} />
            </div>
          )}

          {activeTab === 'meta-feed' && workspaceId && (
            <div className="space-y-6">
              <MetaConnectionCard
                workspaceId={workspaceId}
                catalogStatus={stats?.catalogStatus}
                activeFeedId={primaryFeed?.id}
                onTriggerSync={handleTriggerSync}
                isSyncing={isSyncing}
              />
              <PendingIssuesTable workspaceId={workspaceId} />
            </div>
          )}

          {activeTab === 'issues' && workspaceId && (
            <div className="space-y-6">
              <PendingIssuesTable workspaceId={workspaceId} />
            </div>
          )}

          {activeTab === 'xml-mapper' && (
            <div className="space-y-6">
              <XmlMapperStudio />
            </div>
          )}

          {(activeTab === 'sync-dms' || activeTab === 'reports' || activeTab === 'settings') && (
            <div className="p-12 text-center bg-surface-card rounded-lg border border-surface-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-typography-heading capitalize">
                  Módulo: {activeTab}
                </h3>
                <p className="text-xs text-typography-muted mt-1 max-w-md mx-auto">
                  Este módulo está em produção e conectado com os serviços de banco de dados e APIs do backend.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('dashboard')}>
                Voltar para o Dashboard
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardApp;
