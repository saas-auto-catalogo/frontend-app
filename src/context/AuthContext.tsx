import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService, type RegisterOptions } from '../services/api/authService.js';
import { impersonationService } from '../services/api/impersonationService.js';
import { authTokenStore } from '../services/auth/authTokenStore.js';
import { metaSessionStore } from '../services/auth/metaSessionStore.js';
import { decodeJwtPayload } from '../utils/jwt.js';
import { env } from '../config/env.js';
import type {
  AuthUser,
  AuthSession,
  RegisterPayload,
  UpdateOnboardingPayload,
  ImpersonationInfo,
} from '../types/auth.js';
import { ApiError } from '../types/api.js';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isImpersonated: boolean;
  impersonationInfo: ImpersonationInfo | null;
  login: (email: string, password: string) => Promise<AuthSession>;
  register: (payload: RegisterPayload, options?: RegisterOptions) => Promise<AuthSession>;
  logout: () => Promise<void>;
  updateOnboarding: (payload: UpdateOnboardingPayload) => Promise<AuthUser>;
  updateProfile: (payload: { name?: string; avatarUrl?: string | null }) => Promise<AuthUser>;
  refreshUser: () => Promise<AuthUser | null>;
  endImpersonation: () => Promise<void>;
  startMockImpersonation: (customInfo?: Partial<ImpersonationInfo>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeUser(user: AuthUser): AuthUser {
  const primary = user.memberships?.[0];
  return {
    ...user,
    workspaceId: user.workspaceId ?? primary?.workspaceId ?? null,
    role: user.role ?? primary?.role ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [impersonationInfo, setImpersonationInfo] = useState<ImpersonationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    authTokenStore.setAccessToken(null);
    setAccessToken(null);
    setUser(null);
    setImpersonationInfo(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('drivesync_impersonate_token');
      } catch {}
    }
    metaSessionStore.clearAllMetaSessionTokens();
  }, []);

  const commitUser = useCallback((next: AuthUser | null) => {
    setUser(next);
    metaSessionStore.setCurrentWorkspace(
      next?.workspaceId ?? next?.memberships?.[0]?.workspaceId ?? null,
    );
  }, []);

  useEffect(() => {
    authTokenStore.setRefreshFn(() => authService.refresh());
    authTokenStore.setOnUnauthorized(() => {
      setAccessToken(null);
      setUser(null);
      setImpersonationInfo(null);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('drivesync_impersonate_token');
        } catch {}
      }
    });

    const bootstrap = async () => {
      try {
        let initialToken: string | null = null;
        let initialImpersonation: ImpersonationInfo | null = null;

        if (typeof window !== 'undefined') {
          try {
            if (window.location?.search) {
              const urlParams = new URLSearchParams(window.location.search);
              const impToken = urlParams.get('impersonate_token');
              if (impToken) {
                initialToken = impToken;
                sessionStorage.setItem('drivesync_impersonate_token', impToken);
                urlParams.delete('impersonate_token');
                const newSearch = urlParams.toString();
                const cleanUrl =
                  (window.location.pathname || '/') +
                  (newSearch ? `?${newSearch}` : '') +
                  (window.location.hash || '');
                window.history.replaceState({}, document.title, cleanUrl);
              }
            }

            if (!initialToken) {
              initialToken = sessionStorage.getItem('drivesync_impersonate_token');
            }

            if (initialToken) {
              const decoded = decodeJwtPayload(initialToken);
              if (decoded?.isImpersonated) {
                initialImpersonation = {
                  isImpersonated: true,
                  impersonatedByUserId: decoded.impersonatedByUserId,
                  impersonationReason: decoded.impersonationReason,
                  impersonationSessionId: decoded.impersonationSessionId,
                };
              }
            }
          } catch (paramErr) {
            console.warn('Erro ao processar impersonate_token:', paramErr);
          }
        }

        if (initialToken) {
          authTokenStore.setAccessToken(initialToken);
          setAccessToken(initialToken);
          if (initialImpersonation) {
            setImpersonationInfo(initialImpersonation);
          }

          try {
            const meResult = await authService.getMe();
            const normalized = normalizeUser({
              ...meResult.user,
              ...(initialImpersonation
                ? {
                    isImpersonated: true,
                    impersonatedByUserId: initialImpersonation.impersonatedByUserId,
                    impersonationReason: initialImpersonation.impersonationReason,
                    impersonationSessionId: initialImpersonation.impersonationSessionId,
                  }
                : {}),
            });
            commitUser(normalized);
          } catch (meError) {
            if (initialImpersonation) {
              const decoded = decodeJwtPayload(initialToken);
              const fallbackUser: AuthUser = {
                id: decoded?.sub || 'mock-owner-uuid',
                email: decoded?.email || 'lojista@revenda-exemplo.com.br',
                name: decoded?.name || 'Auto Veículos Exemplo',
                avatarUrl: null,
                isSuperAdmin: false,
                role: 'OWNER',
                workspaceId: decoded?.workspaceId || 'mock-workspace-uuid',
                onboardingCompleted: true,
                isImpersonated: true,
                impersonatedByUserId: initialImpersonation.impersonatedByUserId,
                impersonationReason: initialImpersonation.impersonationReason,
                impersonationSessionId: initialImpersonation.impersonationSessionId,
              };
              commitUser(fallbackUser);
            } else {
              throw meError;
            }
          }
        } else {
          const refreshResult = await authService.refresh();
          authTokenStore.setAccessToken(refreshResult.accessToken);
          setAccessToken(refreshResult.accessToken);

          const meResult = await authService.getMe();
          const normalized = normalizeUser(meResult.user);
          if (normalized.isImpersonated) {
            setImpersonationInfo({
              isImpersonated: true,
              impersonatedByUserId: normalized.impersonatedByUserId,
              impersonationReason: normalized.impersonationReason,
              impersonationSessionId: normalized.impersonationSessionId,
            });
          }
          commitUser(normalized);
        }
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [clearSession, commitUser]);

  const login = useCallback(async (email: string, password: string): Promise<AuthSession> => {
    const result = await authService.login(email, password);
    authTokenStore.setAccessToken(result.accessToken);
    setAccessToken(result.accessToken);

    const meResult = await authService.getMe();
    const normalized = normalizeUser(meResult.user);
    commitUser(normalized);
    return { user: normalized, billing: result.billing ?? null };
  }, [commitUser]);

  const register = useCallback(async (payload: RegisterPayload, options?: RegisterOptions): Promise<AuthSession> => {
    const result = await authService.register(payload, options);
    authTokenStore.setAccessToken(result.accessToken);
    setAccessToken(result.accessToken);

    const meResult = await authService.getMe();
    const normalized = normalizeUser(meResult.user);
    commitUser(normalized);
    return { user: normalized, billing: result.billing ?? null };
  }, [commitUser]);

  const updateOnboarding = useCallback(async (payload: UpdateOnboardingPayload) => {
    const meResult = await authService.patchOnboarding(payload);
    const normalized = normalizeUser(meResult.user);
    commitUser(normalized);
    return normalized;
  }, [commitUser]);

  const updateProfile = useCallback(
    async (payload: { name?: string; avatarUrl?: string | null }): Promise<AuthUser> => {
      const meResult = await authService.patchMe(payload);
      const normalized = normalizeUser(meResult.user);
      commitUser(normalized);
      return normalized;
    },
    [commitUser],
  );

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const meResult = await authService.getMe();
      const normalized = normalizeUser(meResult.user);
      if (normalized.isImpersonated) {
        setImpersonationInfo({
          isImpersonated: true,
          impersonatedByUserId: normalized.impersonatedByUserId,
          impersonationReason: normalized.impersonationReason,
          impersonationSessionId: normalized.impersonationSessionId,
        });
      }
      commitUser(normalized);
      return normalized;
    } catch {
      return null;
    }
  }, [commitUser]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      if (!(error instanceof ApiError) || error.statusCode !== 401) {
        throw error;
      }
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const endImpersonation = useCallback(async () => {
    try {
      await impersonationService.endImpersonation();
    } catch (error) {
      console.warn('Erro ao encerrar impersonation no backend:', error);
    } finally {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('drivesync_impersonate_token');
        } catch {}
      }
      setImpersonationInfo(null);
      clearSession();
      if (typeof window !== 'undefined') {
        if (typeof window.location.assign === 'function') {
          window.location.assign(env.backofficeUrl);
        } else {
          window.location.href = env.backofficeUrl;
        }
      }
    }
  }, [clearSession]);

  const startMockImpersonation = useCallback(async (customInfo?: Partial<ImpersonationInfo>) => {
    const payload = {
      sub: 'user-owner-001',
      name: 'Revenda Auto Shopping Motors',
      email: 'contato@autoshoppingmotors.com.br',
      workspaceId: 'mock-ws-001',
      role: 'OWNER',
      isImpersonated: true,
      impersonatedByUserId: customInfo?.impersonatedByUserId || 'admin.suporte@drivesync.me',
      impersonationReason: customInfo?.impersonationReason || 'Diagnóstico de sincronização de catálogo Meta Automotive DAA',
      impersonationSessionId: customInfo?.impersonationSessionId || 'sess-imp-4029',
    };
    const json = JSON.stringify(payload);
    const utf8Bytes = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    );
    const body = btoa(utf8Bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const token = `eyJhbGciOiJIUzI1NiJ9.${body}.sig`;

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('drivesync_impersonate_token', token);
      } catch {}
    }

    authTokenStore.setAccessToken(token);
    setAccessToken(token);

    const info: ImpersonationInfo = {
      isImpersonated: true,
      impersonatedByUserId: payload.impersonatedByUserId,
      impersonationReason: payload.impersonationReason,
      impersonationSessionId: payload.impersonationSessionId,
    };
    setImpersonationInfo(info);

    const fallbackUser: AuthUser = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatarUrl: null,
      isSuperAdmin: false,
      role: 'OWNER',
      workspaceId: payload.workspaceId,
      onboardingCompleted: true,
      isImpersonated: true,
      impersonatedByUserId: info.impersonatedByUserId,
      impersonationReason: info.impersonationReason,
      impersonationSessionId: info.impersonationSessionId,
    };
    commitUser(fallbackUser);
  }, [commitUser]);

  const isImpersonated = Boolean(user?.isImpersonated || impersonationInfo?.isImpersonated);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      isImpersonated,
      impersonationInfo,
      login,
      register,
      logout,
      updateOnboarding,
      updateProfile,
      refreshUser,
      endImpersonation,
      startMockImpersonation,
    }),
    [
      user,
      accessToken,
      isLoading,
      isImpersonated,
      impersonationInfo,
      login,
      register,
      logout,
      updateOnboarding,
      updateProfile,
      refreshUser,
      endImpersonation,
      startMockImpersonation,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
