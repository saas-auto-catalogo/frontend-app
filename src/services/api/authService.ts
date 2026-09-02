import { httpClient } from './httpClient.js';
import type {
  LoginResponse,
  MeResponse,
  MessageResponse,
  RefreshResponse,
  RegisterPayload,
  UpdateOnboardingPayload,
} from '../../types/auth.js';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>('/auth/login', { email, password }, { skipAuthRefresh: true });
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>('/auth/register', payload, { skipAuthRefresh: true });
  },

  async refresh(): Promise<RefreshResponse> {
    return httpClient.post<RefreshResponse>('/auth/refresh', undefined, { skipAuthRefresh: true });
  },

  async logout(): Promise<MessageResponse> {
    return httpClient.post<MessageResponse>('/auth/logout');
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    return httpClient.post<MessageResponse>('/auth/forgot-password', { email }, { skipAuthRefresh: true });
  },

  async resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
    return httpClient.post<MessageResponse>(
      '/auth/reset-password',
      { token, newPassword },
      { skipAuthRefresh: true },
    );
  },

  async getMe(): Promise<MeResponse> {
    return httpClient.get<MeResponse>('/auth/me');
  },

  async patchOnboarding(payload: UpdateOnboardingPayload): Promise<MeResponse> {
    return httpClient.patch<MeResponse>('/auth/me/onboarding', payload);
  },
};
