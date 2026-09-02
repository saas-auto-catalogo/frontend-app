import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useSubscription } from '../context/SubscriptionContext.js';
import { getPostAuthPath } from '../utils/auth.js';
import { isActiveSubscription } from '../utils/subscription.js';

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 12;

export function SubscribeSuccessPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refetchBilling } = useSubscription();
  const [message, setMessage] = useState('Confirmando seu pagamento...');
  const [isPolling, setIsPolling] = useState(true);
  const [attempts, setAttempts] = useState(0);

  const checkBilling = useCallback(async (): Promise<boolean> => {
    const latest = await refetchBilling();
    if (user && latest && isActiveSubscription(latest.status)) {
      navigate(getPostAuthPath(user, latest), { replace: true });
      return true;
    }
    return false;
  }, [navigate, refetchBilling, user]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const poll = async (attempt: number) => {
      if (cancelled) return;

      const activated = await checkBilling();
      if (activated || cancelled) return;

      if (attempt >= MAX_POLL_ATTEMPTS) {
        setIsPolling(false);
        setMessage(
          'Ainda estamos aguardando a confirmação do pagamento. Isso pode levar alguns instantes.',
        );
        return;
      }

      setAttempts(attempt + 1);
      timeoutId = setTimeout(() => {
        void poll(attempt + 1);
      }, POLL_INTERVAL_MS);
    };

    void poll(0);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [checkBilling]);

  const handleManualCheck = async () => {
    setIsPolling(true);
    setMessage('Verificando assinatura...');
    const activated = await checkBilling();
    if (!activated) {
      setIsPolling(false);
      setMessage('Pagamento ainda não confirmado. Tente novamente em instantes.');
    }
  };

  return (
    <AuthLayout
      title="Pagamento recebido"
      subtitle="Estamos liberando seu acesso. Aguarde enquanto confirmamos a assinatura."
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3 py-4">
          {isPolling ? (
            <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          ) : null}
          <p className="text-sm text-typography-muted text-center">{message}</p>
          {isPolling && attempts > 0 ? (
            <p className="text-xs text-typography-subtle">Tentativa {attempts} de {MAX_POLL_ATTEMPTS}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="primary" size="md" onClick={() => void handleManualCheck()} loading={isPolling}>
            Verificar novamente
          </Button>
          <Button variant="outline" size="md" onClick={() => navigate('/subscribe', { replace: true })}>
            Voltar aos planos
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
