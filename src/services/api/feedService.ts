import { httpClient } from './httpClient.js';
import type { SyncStatus } from './dashboardService.js';

export interface FeedConfigSummary {
  id: string;
  sourceType: string;
  feedUrl: string;
  isActive: boolean;
  activeTokenHash?: string;
  lastSyncAt: string | null;
  lastSyncStatus: SyncStatus | null;
  lastSyncMessage: string | null;
  _count?: { vehicles: number };
}

interface FeedsListResponse {
  feeds: FeedConfigSummary[];
}

interface CreateFeedResponse {
  feed: FeedConfigSummary;
}

export interface CreateFeedPayload {
  sourceType: string;
  feedUrl: string;
}

export interface UpdateFeedPayload {
  feedUrl?: string;
  sourceType?: string;
  isActive?: boolean;
}

export interface SyncTriggerResponse {
  jobId: string;
  status: string;
  feedConfigId: string;
  sourceType: string;
  estimatedTimeSeconds?: number;
}

export interface SyncJobStatusResponse {
  jobId: string;
  status: string;
  progress?: number;
  failedReason?: string;
  result?: {
    vehiclesProcessed?: number;
    totalIngested?: number;
    status?: string;
  };
}

export interface ValidateFeedUrlResult {
  valid: boolean;
  vehicleCount?: number;
  contentType?: string;
  detectedFormat?: 'xml' | 'json' | 'unknown';
  suggestedPresetId?: string;
  error?: string;
}

const SYNC_POLL_INTERVAL_MS = 2000;
const SYNC_POLL_TIMEOUT_MS = 120_000;

export interface WaitForSyncJobOptions {
  timeoutMs?: number;
  onProgress?: (job: SyncJobStatusResponse) => void;
}

export function computeSyncTimeout(estimatedTimeSeconds?: number): number {
  return Math.max(SYNC_POLL_TIMEOUT_MS, (estimatedTimeSeconds ?? 0) * 1000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const feedService = {
  async listFeeds(workspaceId: string): Promise<FeedConfigSummary[]> {
    const response = await httpClient.get<FeedsListResponse>(`/workspaces/${workspaceId}/feeds`);
    return response.feeds;
  },

  async validateUrl(workspaceId: string, url: string): Promise<ValidateFeedUrlResult> {
    return httpClient.post<ValidateFeedUrlResult>(
      `/workspaces/${workspaceId}/feeds/validate-url`,
      { url },
    );
  },

  async createFeed(workspaceId: string, payload: CreateFeedPayload): Promise<FeedConfigSummary> {
    const response = await httpClient.post<CreateFeedResponse>(
      `/workspaces/${workspaceId}/feeds`,
      payload,
    );
    return response.feed;
  },

  async updateFeed(
    workspaceId: string,
    feedId: string,
    payload: UpdateFeedPayload,
  ): Promise<FeedConfigSummary> {
    const response = await httpClient.put<CreateFeedResponse>(
      `/workspaces/${workspaceId}/feeds/${feedId}`,
      payload,
    );
    return response.feed;
  },

  async triggerSync(workspaceId: string, feedId: string): Promise<SyncTriggerResponse> {
    return httpClient.post<SyncTriggerResponse>(
      `/workspaces/${workspaceId}/feeds/${feedId}/sync`,
    );
  },

  async getSyncJobStatus(
    workspaceId: string,
    feedId: string,
    jobId: string,
  ): Promise<SyncJobStatusResponse> {
    return httpClient.get<SyncJobStatusResponse>(
      `/workspaces/${workspaceId}/feeds/${feedId}/sync/${jobId}`,
    );
  },

  async waitForSyncJob(
    workspaceId: string,
    feedId: string,
    jobId: string,
    options: WaitForSyncJobOptions = {},
  ): Promise<SyncJobStatusResponse> {
    const { timeoutMs = SYNC_POLL_TIMEOUT_MS, onProgress } = options;
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const status = await this.getSyncJobStatus(workspaceId, feedId, jobId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      await sleep(SYNC_POLL_INTERVAL_MS);
    }

    throw new Error(
      'A sincronização está demorando mais que o esperado. Verifique se o worker de processamento está ativo ou tente novamente.',
    );
  },
};
