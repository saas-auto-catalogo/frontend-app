import { httpClient } from './httpClient.js';
import type { SyncStatus } from './dashboardService.js';

export interface FeedConfigSummary {
  id: string;
  sourceType: string;
  feedUrl: string;
  isActive: boolean;
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
const SYNC_POLL_TIMEOUT_MS = 60_000;

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
    timeoutMs = SYNC_POLL_TIMEOUT_MS,
  ): Promise<SyncJobStatusResponse> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const status = await this.getSyncJobStatus(workspaceId, feedId, jobId);

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      await sleep(SYNC_POLL_INTERVAL_MS);
    }

    throw new Error('Tempo esgotado aguardando a sincronização do feed.');
  },
};
