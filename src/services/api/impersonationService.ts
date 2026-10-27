import { httpClient } from './httpClient.js';

export interface EndImpersonationResponse {
  message: string;
}

export const impersonationService = {
  /**
   * Encerra a sessão de suporte ativa no backend.
   */
  async endImpersonation(): Promise<EndImpersonationResponse> {
    return httpClient.post<EndImpersonationResponse>('/auth/impersonate/end', {});
  },
};
