import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext.js';
import { useWorkspace } from '../hooks/useWorkspace.js';
import {
  billingService,
  type WorkspaceBilling,
  type SubscriptionStatus,
} from '../services/api/billingService.js';

interface SubscriptionContextValue {
  billing: WorkspaceBilling | null;
  isLoading: boolean;
  hasInitialized: boolean;
  error: string | null;
  refetchBilling: () => Promise<WorkspaceBilling | null>;
  setBilling: (billing: WorkspaceBilling | null) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

function createSuperAdminBilling(workspaceId: string): WorkspaceBilling {
  return {
    workspaceId,
    planTier: 'ENTERPRISE',
    status: 'ACTIVE',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    limits: null,
  };
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { workspaceId } = useWorkspace();
  const [billing, setBillingState] = useState<WorkspaceBilling | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enquanto houver um usuário autenticado e o primeiro carregamento de billing ainda não
  // tiver sido resolvido, mantém isLoading=true para que os guards de assinatura aguardem em
  // vez de redirecionar precocemente (ex.: retorno do OAuth Meta com full page reload).
  const isLoading = isAuthenticated && !hasInitialized ? true : isLoadingState;

  const setBilling = useCallback((nextBilling: WorkspaceBilling | null) => {
    setBillingState(nextBilling);
    setError(null);
  }, []);

  const refetchBilling = useCallback(async (): Promise<WorkspaceBilling | null> => {
    if (!isAuthenticated || !user) {
      setBilling(null);
      setError(null);
      setHasInitialized(true);
      setIsLoadingState(false);
      return null;
    }

    if (!workspaceId) {
      setBilling(null);
      setError(null);
      setHasInitialized(true);
      setIsLoadingState(false);
      return null;
    }

    if (user.isSuperAdmin) {
      const synthetic = createSuperAdminBilling(workspaceId);
      setBilling(synthetic);
      setError(null);
      setHasInitialized(true);
      setIsLoadingState(false);
      return synthetic;
    }

    try {
      setIsLoadingState(true);
      setError(null);
      const data = await billingService.getWorkspaceBilling(workspaceId);
      setBilling(data);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar assinatura';
      setError(message);
      setBilling(null);
      return null;
    } finally {
      setIsLoadingState(false);
      setHasInitialized(true);
    }
  }, [isAuthenticated, user, workspaceId, setBilling]);

  useEffect(() => {
    void refetchBilling();
  }, [refetchBilling]);

  useEffect(() => {
    if (isAuthenticated) {
      setHasInitialized(false);
      setIsLoadingState(false);
    }
  }, [isAuthenticated]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      billing,
      isLoading,
      hasInitialized,
      error,
      refetchBilling,
      setBilling,
    }),
    [billing, isLoading, hasInitialized, error, refetchBilling, setBilling],
  );

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription deve ser usado dentro de SubscriptionProvider');
  }
  return context;
}

export function useSubscriptionStatus(): SubscriptionStatus | null {
  const { billing } = useSubscription();
  return billing?.status ?? null;
}
