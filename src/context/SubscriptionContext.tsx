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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setBilling = useCallback((nextBilling: WorkspaceBilling | null) => {
    setBillingState(nextBilling);
    setError(null);
  }, []);

  const refetchBilling = useCallback(async (): Promise<WorkspaceBilling | null> => {
    if (!isAuthenticated || !user) {
      setBilling(null);
      setError(null);
      setIsLoading(false);
      return null;
    }

    if (!workspaceId) {
      setBilling(null);
      setError(null);
      setIsLoading(false);
      return null;
    }

    if (user.isSuperAdmin) {
      const synthetic = createSuperAdminBilling(workspaceId);
      setBilling(synthetic);
      setError(null);
      setIsLoading(false);
      return synthetic;
    }

    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [isAuthenticated, user, workspaceId, setBilling]);

  useEffect(() => {
    void refetchBilling();
  }, [refetchBilling]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      billing,
      isLoading,
      error,
      refetchBilling,
      setBilling,
    }),
    [billing, isLoading, error, refetchBilling, setBilling],
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
