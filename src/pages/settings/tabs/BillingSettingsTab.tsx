import { useState } from 'react';
import { CreditCard, ExternalLink, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card.js';
import { Button } from '../../../components/ui/Button.js';
import { useWorkspace } from '../../../hooks/useWorkspace.js';
import { useSubscription } from '../../../context/SubscriptionContext.js';
import { billingService } from '../../../services/api/billingService.js';
import { formatRelativeTime } from '../../../utils/format.js';
import { ApiError } from '../../../types/api.js';

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'Ativa';
    case 'TRIALING': return 'Período de teste';
    case 'EXPIRED': return 'Teste expirado';
    case 'PAST_DUE': return 'Pagamento em atraso';
    case 'CANCELED': return 'Cancelada';
    case 'SUSPENDED': return 'Suspensa';
    case 'NONE': return 'Sem assinatura';
    default: return status;
  }
}

export function BillingSettingsTab() {
  const { role } = useWorkspace();
  const { billing, refetchBilling } = useSubscription();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwnerOrAdmin = role === 'OWNER' || role === 'SUPER_ADMIN';

  if (!isOwnerOrAdmin) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-typography-heading">Acesso Restrito</h3>
            <p className="text-sm text-typography-muted mt-1 max-w-md mx-auto">
              Somente o proprietário ({`OWNER`}) ou super administrador pode gerenciar o faturamento e a assinatura.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-primary/10">
              <CreditCard className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-typography-heading">Assinatura & Plano</h3>
              <p className="text-xs text-typography-muted">Detalhes da sua assinatura atual</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-typography-muted">Status</label>
              <p className="text-sm font-semibold text-typography-heading bg-surface-muted rounded-md px-3 py-2">
                {billing ? getStatusLabel(billing.status) : 'Carregando...'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-typography-muted">Plano</label>
              <p className="text-sm font-semibold text-typography-heading bg-surface-muted rounded-md px-3 py-2">
                {billing?.planTier ?? '—'}
              </p>
            </div>
            {billing?.currentPeriodEnd && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-typography-muted">Período atual até</label>
                <p className="text-sm font-semibold text-typography-heading bg-surface-muted rounded-md px-3 py-2">
                  {formatRelativeTime(billing.currentPeriodEnd)}
                </p>
              </div>
            )}
            {billing?.limits && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-typography-muted">Limite de veículos</label>
                <p className="text-sm font-semibold text-typography-heading bg-surface-muted rounded-md px-3 py-2">
                  {billing.limits.maxVehicles}
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="primary"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => void handleOpenPortal()}
              loading={isOpeningPortal}
            >
              Gerenciar assinatura (Stripe)
            </Button>
            <Button variant="outline" size="sm" onClick={() => void refetchBilling()}>
              Atualizar status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
