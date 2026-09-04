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
import { authTokenStore } from '../services/auth/authTokenStore.js';
import type { AuthUser, AuthSession, RegisterPayload, UpdateOnboardingPayload } from '../types/auth.js';
import { ApiError } from '../types/api.js';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthSession>;
  register: (payload: RegisterPayload, options?: RegisterOptions) => Promise<AuthSession>;
  logout: () => Promise<void>;
  updateOnboarding: (payload: UpdateOnboardingPayload) => Promise<AuthUser>;
  updateProfile: (payload: { name?: string; avatarUrl?: string | null }) => Promise<AuthUser>;
  refreshUser: () => Promise<AuthUser | null>;
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
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    authTokenStore.setAccessToken(null);
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    authTokenStore.setRefreshFn(() => authService.refresh());
    authTokenStore.setOnUnauthorized(() => {
      setAccessToken(null);
      setUser(null);
    });

    const bootstrap = async () => {
      try {
        const refreshResult = await authService.refresh();
        authTokenStore.setAccessToken(refreshResult.accessToken);
        setAccessToken(refreshResult.accessToken);

        const meResult = await authService.getMe();
        setUser(normalizeUser(meResult.user));
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string): Promise<AuthSession> => {
    const result = await authService.login(email, password);
    authTokenStore.setAccessToken(result.accessToken);
    setAccessToken(result.accessToken);

    const meResult = await authService.getMe();
    const normalized = normalizeUser(meResult.user);
    setUser(normalized);
    return { user: normalized, billing: result.billing ?? null };
  }, []);

  const register = useCallback(async (payload: RegisterPayload, options?: RegisterOptions): Promise<AuthSession> => {
    const result = await authService.register(payload, options);
    authTokenStore.setAccessToken(result.accessToken);
    setAccessToken(result.accessToken);

    const meResult = await authService.getMe();
    const normalized = normalizeUser(meResult.user);
    setUser(normalized);
    return { user: normalized, billing: result.billing ?? null };
  }, []);

  const updateOnboarding = useCallback(async (payload: UpdateOnboardingPayload) => {
    const meResult = await authService.patchOnboarding(payload);
    const normalized = normalizeUser(meResult.user);
    setUser(normalized);
    return normalized;
  }, []);

  const updateProfile = useCallback(
    async (payload: { name?: string; avatarUrl?: string | null }): Promise<AuthUser> => {
      const meResult = await authService.patchMe(payload);
      const normalized = normalizeUser(meResult.user);
      setUser(normalized);
      return normalized;
    },
    [],
  );

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const meResult = await authService.getMe();
      const normalized = normalizeUser(meResult.user);
      setUser(normalized);
      return normalized;
    } catch {
      return null;
    }
  }, []);

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

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      login,
      register,
      logout,
      updateOnboarding,
      updateProfile,
      refreshUser,
    }),
    [user, accessToken, isLoading, login, register, logout, updateOnboarding, updateProfile, refreshUser],
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
