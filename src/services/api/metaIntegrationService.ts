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

const OAUTH_RETURN_TO_KEY = 'ds_meta_oauth_return_to';

const INTERNAL_PATH_REGEX = /^\/(?!\/)/;

/**
 * Registra a rota de origem antes de disparar o OAuth da Meta para que o
 * callback (`/meta/callback`) devolva o usuário ao mesmo fluxo interrompido
 * (ex.: `/campaigns/new`).
 */
export function saveOAuthReturnTo(path: string): void {
  try {
    if (typeof path === 'string' && path.trim()) {
      window.sessionStorage.setItem(OAUTH_RETURN_TO_KEY, path);
    }
  } catch {
    // sessionStorage indisponível: o retorno cai no fallback padrão.
  }
}

/**
 * Lê (sem consumir) a rota de retorno registrada. Fallback para `fallback`.
 */
export function peekOAuthReturnTo(fallback = '/'): string {
  try {
    const value = window.sessionStorage.getItem(OAUTH_RETURN_TO_KEY);
    if (value && INTERNAL_PATH_REGEX.test(value)) {
      return value;
    }
  } catch {
    // sessionStorage indisponível.
  }
  return fallback;
}

/**
 * Lê e remove a rota de retorno registrada. Fallback para `fallback`.
 */
export function consumeOAuthReturnTo(fallback = '/'): string {
  const value = peekOAuthReturnTo(fallback);
  try {
    window.sessionStorage.removeItem(OAUTH_RETURN_TO_KEY);
  } catch {
    // sessionStorage indisponível.
  }
  return value;
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
