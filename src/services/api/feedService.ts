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

export interface ValidateFeedUrlResult {
  valid: boolean;
  vehicleCount?: number;
  contentType?: string;
  detectedFormat?: 'xml' | 'json' | 'unknown';
  suggestedPresetId?: string;
  error?: string;
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
};
