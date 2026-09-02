import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, LogOut, ExternalLink } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useSubscription } from '../context/SubscriptionContext.js';
import { env } from '../config/env.js';
import { getPostAuthPath } from '../utils/auth.js';
import { isActiveSubscription } from '../utils/subscription.js';

export function SubscribePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { billing, refetchBilling } = useSubscription();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user && billing && isActiveSubscription(billing.status)) {
      navigate(getPostAuthPath(user, billing), { replace: true });
    }
  }, [user, billing, navigate]);

  const handleChoosePlan = () => {
    if (env.marketingCheckoutUrl) {
      window.open(env.marketingCheckoutUrl, '_blank', 'noopener,noreferrer');
      return;
    }
  };

  const handleRefresh = async () => {
    const latest = await refetchBilling();
    if (user && latest && isActiveSubscription(latest.status)) {
      navigate(getPostAuthPath(user, latest), { replace: true });
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
    <AuthLayout
      title="Contrate um plano para continuar"
      subtitle="Escolha um plano para liberar o onboarding e o painel da sua revenda."
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-surface-border bg-surface-muted/40 p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-brand-primary shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-typography-heading">
              Assinatura necessária
            </p>
            <p className="text-sm text-typography-muted">
              Seu workspace ainda não possui um plano ativo. Após concluir o pagamento, volte
              aqui e clique em &quot;Já paguei&quot; para continuar.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="md"
            icon={<ExternalLink className="w-4 h-4" />}
            onClick={handleChoosePlan}
            disabled={!env.marketingCheckoutUrl}
          >
            Escolher plano
          </Button>

          {!env.marketingCheckoutUrl ? (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Configure `VITE_MARKETING_CHECKOUT_URL` no ambiente para habilitar o checkout
              externo.
            </p>
          ) : null}

          <Button variant="outline" size="md" onClick={() => void handleRefresh()}>
            Já paguei — verificar assinatura
          </Button>

          <Button
            variant="ghost"
            size="md"
            icon={<LogOut className="w-4 h-4" />}
            onClick={() => void handleLogout()}
            loading={isLoggingOut}
          >
            Sair
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
