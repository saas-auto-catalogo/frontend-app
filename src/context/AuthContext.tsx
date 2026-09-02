import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '../services/api/authService.js';
import { authTokenStore } from '../services/auth/authTokenStore.js';
import type { AuthUser, RegisterPayload, UpdateOnboardingPayload } from '../types/auth.js';
import { ApiError } from '../types/api.js';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateOnboarding: (payload: UpdateOnboardingPayload) => Promise<AuthUser>;
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

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    authTokenStore.setAccessToken(result.accessToken);
    setAccessToken(result.accessToken);

    const meResult = await authService.getMe();
    const normalized = normalizeUser(meResult.user);
    setUser(normalized);
    return normalized;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await authService.register(payload);
    authTokenStore.setAccessToken(result.accessToken);
    setAccessToken(result.accessToken);

    const meResult = await authService.getMe();
    const normalized = normalizeUser(meResult.user);
    setUser(normalized);
    return normalized;
  }, []);

  const updateOnboarding = useCallback(async (payload: UpdateOnboardingPayload) => {
    const meResult = await authService.patchOnboarding(payload);
    const normalized = normalizeUser(meResult.user);
    setUser(normalized);
    return normalized;
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
    }),
    [user, accessToken, isLoading, login, register, logout, updateOnboarding],
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
