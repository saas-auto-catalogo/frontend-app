import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CreditCard, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useSubscription } from '../context/SubscriptionContext.js';
import { billingService } from '../services/api/billingService.js';
import { formatRelativeTime } from '../utils/format.js';
import { ApiError } from '../types/api.js';

function getStatusLabel(status: string): string {
  switch (status) {
    case 'PAST_DUE':
      return 'Pagamento em atraso';
    case 'CANCELED':
      return 'Assinatura cancelada';
    case 'SUSPENDED':
      return 'Assinatura suspensa';
    case 'NONE':
      return 'Sem assinatura';
    default:
      return status;
  }
}

export function BillingSettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { billing, refetchBilling } = useSubscription();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleOpenPortal = async () => {
    try {
      setIsOpeningPortal(true);
      setError(null);
      const returnUrl = `${window.location.origin}/settings/billing`;
      const session = await billingService.createPortalSession(returnUrl);
      window.location.href = session.url;
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível abrir o portal de faturamento.';
      setError(message);
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-typography-heading">Faturamento</h1>
            <p className="text-xs text-typography-muted mt-0.5">
              Regularize sua assinatura para voltar a usar o painel.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-typography-muted hover:text-typography-heading"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Link>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-typography-heading">
                  {billing ? getStatusLabel(billing.status) : 'Carregando assinatura...'}
                </p>
                {billing?.planTier ? (
                  <p className="text-sm text-typography-muted">Plano: {billing.planTier}</p>
                ) : null}
                {billing?.currentPeriodEnd ? (
                  <p className="text-xs text-typography-subtle">
                    Período atual até {formatRelativeTime(billing.currentPeriodEnd)}
                  </p>
                ) : null}
                <p className="text-sm text-typography-muted">
                  Acesse o portal Stripe para atualizar cartão, pagar faturas em aberto ou
                  reativar sua assinatura.
                </p>
              </div>
            </div>

            {error ? (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="sm"
                icon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={() => void handleOpenPortal()}
                loading={isOpeningPortal}
              >
                Gerenciar assinatura
              </Button>
              <Button variant="outline" size="sm" onClick={() => void refetchBilling()}>
                Atualizar status
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<CreditCard className="w-3.5 h-3.5" />}
                onClick={() => void handleLogout()}
                loading={isLoggingOut}
              >
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
