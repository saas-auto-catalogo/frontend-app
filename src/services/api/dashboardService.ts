import { PaginatedResponse } from '../../types/api.js';
import { httpClient } from './httpClient.js';
import { env } from '../../config/env.js';

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

export interface AuditLog {
  id: string;
  action: string;
  entityName: string;
  entityId: string | null;
  actorEmail: string;
  actorUserId: string;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  action?: string;
  entityName?: string;
  from?: string;
  to?: string;
}

const FALLBACK_STATS: DashboardStats = {
  totalVehicles: 48,
  availableVehicles: 42,
  eligibleForMetaAds: 39,
  pendingIssuesCount: 3,
  blockingIssuesCount: 0,
  newVehiclesThisMonth: 12,
  healthScore: 98,
  catalogStatus: 'HEALTHY',
  lastDmsSync: {
    at: new Date().toISOString(),
    durationMs: 320,
    sourceName: 'AutoCerto XML',
    status: 'SUCCESS',
  },
  lastMetaExport: {
    at: new Date().toISOString(),
    status: 'SUCCESS',
    catalogName: 'Catálogo Meta Ads DAA',
  },
};

const FALLBACK_CATALOGS: MetaCatalogSummary[] = [
  {
    id: 'cat-1',
    catalogName: 'Estoque Seminovos Meta DAA',
    metaCatalogId: 'cat_meta_98231',
    feedFormat: 'XML',
    publicFeedUrl: 'https://api.drivesync.me/feeds/demo-token/meta-vehicles.xml',
    totalVehiclesCount: 48,
    eligibleVehiclesCount: 39,
    lastExportAt: new Date().toISOString(),
    lastExportStatus: 'SUCCESS',
    healthScore: 98,
    dealershipId: 'dealership-1',
  },
];

const FALLBACK_ISSUES: CatalogIssueItem[] = [
  {
    id: 'issue-1',
    vehicleId: 'veh-1',
    make: 'JEEP',
    model: 'COMPASS',
    licensePlate: 'ABC-1D23',
    issueType: 'MISSING_IMAGES',
    severity: 'WARNING',
    description: 'Veículo com menos de 3 fotos cadastradas',
    recommendation: 'Adicione pelo menos 3 imagens de alta resolução para melhor desempenho no Meta Ads',
    detectedAt: new Date().toISOString(),
  },
];

const FALLBACK_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'SYNC',
    title: 'Sincronização DMS concluída',
    description: '48 veículos importados com sucesso',
    occurredAt: new Date().toISOString(),
  },
  {
    id: 'act-2',
    type: 'CATALOG_EXPORT',
    title: 'Feed Meta DAA atualizado',
    description: '39 veículos indexados no Commerce Manager',
    occurredAt: new Date().toISOString(),
  },
];

function buildAuditLogQueryParams(params: AuditLogListParams = {}) {
  return {
    page: params.page,
    limit: params.limit,
    action: params.action,
    entityName: params.entityName,
    from: params.from,
    to: params.to,
  };
}

export const dashboardService = {
  async getStats(workspaceId: string): Promise<DashboardStats> {
    try {
      return await httpClient.get<DashboardStats>(`/workspaces/${workspaceId}/dashboard/stats`);
    } catch (err) {
      if (env.enableMockFallback) {
        return FALLBACK_STATS;
      }
      throw err;
    }
  },

  async listMetaCatalogs(workspaceId: string): Promise<MetaCatalogSummary[]> {
    try {
      const response = await httpClient.get<MetaCatalogsResponse>(
        `/workspaces/${workspaceId}/meta-catalogs`,
      );
      return response.catalogs;
    } catch (err) {
      if (env.enableMockFallback) {
        return FALLBACK_CATALOGS;
      }
      throw err;
    }
  },

  async getDashboardIssues(workspaceId: string): Promise<CatalogIssueItem[]> {
    try {
      const response = await httpClient.get<DashboardIssuesResponse>(
        `/workspaces/${workspaceId}/dashboard/issues`,
      );
      return response.items;
    } catch (err) {
      if (env.enableMockFallback) {
        return FALLBACK_ISSUES;
      }
      throw err;
    }
  },

  async getDashboardActivity(workspaceId: string, limit = 20): Promise<ActivityEvent[]> {
    try {
      const response = await httpClient.get<DashboardActivityResponse>(
        `/workspaces/${workspaceId}/dashboard/activity`,
        { params: { limit } },
      );
      return response.events;
    } catch (err) {
      if (env.enableMockFallback) {
        return FALLBACK_ACTIVITY;
      }
      throw err;
    }
  },

  async listAuditLogs(
    workspaceId: string,
    params: AuditLogListParams = {},
  ): Promise<PaginatedResponse<AuditLog>> {
    return httpClient.get<PaginatedResponse<AuditLog>>(
      `/workspaces/${workspaceId}/audit-logs`,
      { params: buildAuditLogQueryParams(params) },
    );
  },
};
