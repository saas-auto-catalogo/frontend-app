import { httpClient } from './httpClient.js';
import { env } from '../../config/env.js';
import type {
  LoginResponse,
  MeResponse,
  MessageResponse,
  RefreshResponse,
  RegisterPayload,
  UpdateOnboardingPayload,
} from '../../types/auth.js';

export interface RegisterOptions {
  plan?: 'trial';
}

const MOCK_USER = {
  id: 'mock-owner-001',
  email: 'admin@autocatalogo.com.br',
  name: 'Revenda Auto Shopping Motors',
  avatarUrl: null,
  isSuperAdmin: false,
  role: 'OWNER',
  workspaceId: 'mock-ws-001',
  onboardingCompleted: true,
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      return await httpClient.post<LoginResponse>('/auth/login', { email, password }, { skipAuthRefresh: true });
    } catch (error) {
      if (env.enableMockFallback) {
        return {
          accessToken: 'mock_jwt_access_token',
          expiresIn: 3600,
          tokenType: 'Bearer',
          user: {
            ...MOCK_USER,
            email: email || MOCK_USER.email,
          },
        };
      }
      throw error;
    }
  },

  async register(payload: RegisterPayload, options?: RegisterOptions): Promise<LoginResponse> {
    try {
      return await httpClient.post<LoginResponse>('/auth/register', payload, {
        skipAuthRefresh: true,
        params: options?.plan ? { plan: options.plan } : undefined,
      });
    } catch (error) {
      if (env.enableMockFallback) {
        return {
          accessToken: 'mock_jwt_access_token',
          expiresIn: 3600,
          tokenType: 'Bearer',
          user: {
            ...MOCK_USER,
            email: payload.email,
            name: payload.name,
          },
        };
      }
      throw error;
    }
  },

  async refresh(): Promise<RefreshResponse> {
    return httpClient.post<RefreshResponse>('/auth/refresh', undefined, { skipAuthRefresh: true });
  },

  async logout(): Promise<MessageResponse> {
    try {
      return await httpClient.post<MessageResponse>('/auth/logout');
    } catch (error) {
      if (env.enableMockFallback) {
        return { message: 'Logout realizado' };
      }
      throw error;
    }
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
    try {
      return await httpClient.get<MeResponse>('/auth/me');
    } catch (error) {
      if (env.enableMockFallback) {
        return { user: MOCK_USER };
      }
      throw error;
    }
  },

  async patchOnboarding(payload: UpdateOnboardingPayload): Promise<MeResponse> {
    return httpClient.patch<MeResponse>('/auth/me/onboarding', payload);
  },

  async patchMe(payload: { name?: string; avatarUrl?: string | null }): Promise<MeResponse> {
    return httpClient.patch<MeResponse>('/auth/me', payload);
  },
};
