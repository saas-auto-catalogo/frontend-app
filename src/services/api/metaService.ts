import {
  dashboardService,
  type CatalogStatus,
  type MetaCatalogSummary,
} from './dashboardService.js';
import { feedService } from './feedService.js';

export interface CatalogHealthData {
  healthScore: number;
  totalVehicles: number;
  eligibleVehicles: number;
  pendingIssuesCount: number;
  catalogStatus: CatalogStatus;
  lastSyncAt: string | null;
  graphApiStatus: 'CONNECTED' | 'RECONNECT_REQUIRED' | 'TOKEN_EXPIRED';
  feedUrl: string | null;
}

export interface MetaCatalogHealthResult {
  catalog: MetaCatalogSummary | null;
  health: CatalogHealthData | null;
}

export interface TriggerSyncResponse {
  success: boolean;
  jobId: string;
  status: string;
  message: string;
}

function mapCatalogToHealth(
  catalog: MetaCatalogSummary,
  catalogStatus: CatalogStatus,
  pendingIssuesCount: number,
): CatalogHealthData {
  return {
    healthScore: catalog.healthScore,
    totalVehicles: catalog.totalVehiclesCount,
    eligibleVehicles: catalog.eligibleVehiclesCount,
    pendingIssuesCount,
    catalogStatus,
    lastSyncAt: catalog.lastExportAt,
    graphApiStatus: catalog.metaCatalogId ? 'CONNECTED' : 'RECONNECT_REQUIRED',
    feedUrl: catalog.publicFeedUrl,
  };
}

export const metaService = {
  async getCatalogHealth(workspaceId: string): Promise<MetaCatalogHealthResult> {
    const [catalogs, stats] = await Promise.all([
      dashboardService.listMetaCatalogs(workspaceId),
      dashboardService.getStats(workspaceId),
    ]);

    const catalog = catalogs[0] ?? null;
    if (!catalog) {
      return { catalog: null, health: null };
    }

    return {
      catalog,
      health: mapCatalogToHealth(catalog, stats.catalogStatus, stats.pendingIssuesCount),
    };
  },

  async triggerFeedSync(workspaceId: string, feedId: string): Promise<TriggerSyncResponse> {
    const syncJob = await feedService.triggerSync(workspaceId, feedId);
    const result = await feedService.waitForSyncJob(workspaceId, feedId, syncJob.jobId);

    if (result.status === 'failed') {
      return {
        success: false,
        jobId: syncJob.jobId,
        status: result.status,
        message: result.failedReason ?? 'Falha ao sincronizar o feed DMS.',
      };
    }

    return {
      success: true,
      jobId: syncJob.jobId,
      status: result.status,
      message: 'Feed DMS sincronizado. Catálogo Meta atualizado.',
    };
  },

  getPublicFeedUrl(catalog: MetaCatalogSummary | null | undefined): string | null {
    return catalog?.publicFeedUrl ?? null;
  },
};
