import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useSubscription } from '../../context/SubscriptionContext.js';
import { getPostAuthPath } from '../../utils/auth.js';
import { getSubscriptionGatePath, isActiveSubscription } from '../../utils/subscription.js';
import { TrialBanner } from '../billing/TrialBanner.js';

function AuthLoadingSpinner({ message = 'Carregando sessão...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-canvas">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        <p className="text-sm text-typography-muted">{message}</p>
      </div>
    </div>
  );
}

export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RequireActiveSubscription() {
  const { user } = useAuth();
  const { billing, isLoading } = useSubscription();
  const location = useLocation();

  if (user?.isSuperAdmin) {
    return <Outlet />;
  }

  if (isLoading) {
    return <AuthLoadingSpinner message="Verificando assinatura..." />;
  }

  if (!billing) {
    return <Navigate to="/subscribe" replace />;
  }

  if (!isActiveSubscription(billing.status)) {
    const gatePath = getSubscriptionGatePath(billing.status);
    if (location.pathname !== gatePath) {
      return <Navigate to={gatePath} replace />;
    }
  }

  return (
    <>
      <TrialBanner />
      <Outlet />
    </>
  );
}

export function RequireOnboardingComplete() {
  const { user } = useAuth();

  if (user?.onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

export function PublicAuthRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { billing, isLoading: isBillingLoading, refetchBilling } = useSubscription();
  const location = useLocation();
  const isRegisterRoute = location.pathname === '/register';

  const canAccessRegisterWithoutActiveSubscription =
    isRegisterRoute && (!billing || billing.status === 'NONE');

  useEffect(() => {
    if (isAuthenticated && user && !billing && !isBillingLoading) {
      void refetchBilling();
    }
  }, [isAuthenticated, user, billing, isBillingLoading, refetchBilling]);

  if (isLoading || (isAuthenticated && isBillingLoading && !billing)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-canvas">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user && !canAccessRegisterWithoutActiveSubscription) {
    return <Navigate to={getPostAuthPath(user, billing)} replace />;
  }

  return <Outlet />;
}
