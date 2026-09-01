import { httpClient } from './httpClient.js';

export type SyncStatus = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'RUNNING';
export type CatalogStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  eligibleForMetaAds: number;
  pendingIssuesCount: number;
  blockingIssuesCount: number;
  newVehiclesThisMonth: number;
  healthScore: number;
  catalogStatus: CatalogStatus;
  lastDmsSync: {
    at: string | null;
    durationMs: number | null;
    sourceName: string | null;
    status: SyncStatus | null;
  };
  lastMetaExport: {
    at: string | null;
    status: SyncStatus | null;
    catalogName: string | null;
  };
}

export interface MetaCatalogSummary {
  id: string;
  catalogName: string;
  metaCatalogId: string | null;
  feedFormat: string;
  publicFeedUrl: string | null;
  totalVehiclesCount: number;
  eligibleVehiclesCount: number;
  lastExportAt: string | null;
  lastExportStatus: SyncStatus | null;
  healthScore: number;
  dealershipId: string | null;
}

export interface MetaCatalogsResponse {
  catalogs: MetaCatalogSummary[];
}

export type CatalogIssueType = 'MISSING_IMAGES' | 'PRICE_ZERO' | 'INVALID_VIN' | 'YEAR_INVALID';
export type CatalogIssueSeverity = 'BLOCKING' | 'WARNING';

export interface CatalogIssueItem {
  id: string;
  vehicleId: string;
  make: string;
  model: string;
  licensePlate: string;
  issueType: CatalogIssueType;
  severity: CatalogIssueSeverity;
  description: string;
  recommendation: string;
  detectedAt: string;
  imageUrl?: string;
}

export interface DashboardIssuesResponse {
  items: CatalogIssueItem[];
}

export interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  occurredAt: string;
}

export interface DashboardActivityResponse {
  events: ActivityEvent[];
}

export const dashboardService = {
  async getStats(workspaceId: string): Promise<DashboardStats> {
    return httpClient.get<DashboardStats>(`/workspaces/${workspaceId}/dashboard/stats`);
  },

  async listMetaCatalogs(workspaceId: string): Promise<MetaCatalogSummary[]> {
    const response = await httpClient.get<MetaCatalogsResponse>(
      `/workspaces/${workspaceId}/meta-catalogs`,
    );
    return response.catalogs;
  },

  async getDashboardIssues(workspaceId: string): Promise<CatalogIssueItem[]> {
    const response = await httpClient.get<DashboardIssuesResponse>(
      `/workspaces/${workspaceId}/dashboard/issues`,
    );
    return response.items;
  },

  async getDashboardActivity(workspaceId: string, limit = 20): Promise<ActivityEvent[]> {
    const response = await httpClient.get<DashboardActivityResponse>(
      `/workspaces/${workspaceId}/dashboard/activity`,
      { params: { limit } },
    );
    return response.events;
  },
};
