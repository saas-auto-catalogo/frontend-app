import { httpClient } from './httpClient.js';

export interface MetaAuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface MetaCallbackPayload {
  code: string;
  state: string;
  redirectUri: string;
  catalogName?: string;
}

export interface MetaCatalogItem {
  id: string;
  name: string;
  vertical?: string;
  productCount?: number;
  feedCount?: number;
}

export interface MetaCallbackResponse {
  success: boolean;
  workspaceId: string;
  tokenType: string;
  expiresInSeconds?: number;
  businessAccountsCount: number;
  catalogsFound: number;
  catalogs: MetaCatalogItem[];
}

export function getMetaOAuthRedirectUri(): string {
  return `${window.location.origin}/meta/callback`;
}

export const metaIntegrationService = {
  async getAuthUrl(workspaceId: string, redirectUri?: string): Promise<MetaAuthUrlResponse> {
    const resolvedRedirectUri = redirectUri ?? getMetaOAuthRedirectUri();
    return httpClient.get<MetaAuthUrlResponse>('/integrations/meta/auth-url', {
      params: {
        workspaceId,
        redirectUri: resolvedRedirectUri,
      },
    });
  },

  async completeCallback(payload: MetaCallbackPayload): Promise<MetaCallbackResponse> {
    return httpClient.post<MetaCallbackResponse>('/integrations/meta/callback', payload);
  },
};
