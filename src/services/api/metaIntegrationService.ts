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

export interface MetaBusinessAccount {
  id: string;
  name: string;
  verificationStatus?: string;
}

export interface MetaCatalogItem {
  id: string;
  name: string;
  vertical?: string;
  productCount?: number;
  feedCount?: number;
  businessId?: string;
  businessName?: string;
}

export interface MetaCallbackResponse {
  success: boolean;
  workspaceId: string;
  businesses: MetaBusinessAccount[];
  catalogs: MetaCatalogItem[];
  suggestedCatalogName: string;
  metaSessionToken: string;
}

export interface SelectCatalogPayload {
  workspaceId: string;
  metaSessionToken: string;
  catalogId?: string;
  catalogName?: string;
  createNew?: boolean;
  businessId?: string;
}

export interface SelectCatalogResponse {
  success: boolean;
  workspaceId: string;
  catalogId: string;
  catalogName: string;
  created: boolean;
  businessId?: string | null;
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

  async selectCatalog(payload: SelectCatalogPayload): Promise<SelectCatalogResponse> {
    return httpClient.post<SelectCatalogResponse>('/integrations/meta/select-catalog', payload);
  },
};
