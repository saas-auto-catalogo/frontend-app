import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useSubscription } from '../context/SubscriptionContext.js';
import { useWorkspace } from '../hooks/useWorkspace.js';
import { billingService } from '../services/api/billingService.js';
import { ApiError } from '../types/api.js';
import type { BillingInterval, PlanTier } from '../types/billing.js';
import { PLAN_OPTIONS, parsePlanTier } from '../types/billing.js';
import { getPostAuthPath } from '../utils/auth.js';
import { isActiveSubscription } from '../utils/subscription.js';
import {
  SUBSCRIBE_LEGAL_DOCUMENT,
  SUBSCRIBE_LEGAL_REQUIRED_ERROR,
  legalDocumentUrl,
} from '../constants/legal.js';

export function SubscribePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { billing, refetchBilling, setBilling } = useSubscription();
  const { workspaceId } = useWorkspace();

  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(() =>
    parsePlanTier(searchParams.get('plan')),
  );
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('MONTHLY');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [acceptContract, setAcceptContract] = useState(false);
  const [legalError, setLegalError] = useState<string | null>(null);
  const [isResettingRegistration, setIsResettingRegistration] = useState(false);

  const isExpiredTrial = billing?.status === 'EXPIRED';

  useEffect(() => {
    if (isExpiredTrial) {
      setSelectedPlan('PRO');
    }
  }, [isExpiredTrial]);

  useEffect(() => {
    const planFromQuery = searchParams.get('plan');
    if (planFromQuery) {
      setSelectedPlan(parsePlanTier(planFromQuery));
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && billing && isActiveSubscription(billing.status)) {
      navigate(getPostAuthPath(user, billing), { replace: true });
    }
  }, [user, billing, navigate]);

  const handleSubscribe = async () => {
    if (!workspaceId) {
      setFormError('Workspace não encontrado. Faça login novamente.');
      return;
    }

    setFormError(null);

    if (!acceptContract) {
      setLegalError(SUBSCRIBE_LEGAL_REQUIRED_ERROR);
      return;
    }

    setLegalError(null);

    try {
      setIsSubmitting(true);
      const origin = window.location.origin;
      const session = await billingService.createWorkspaceCheckoutSession(workspaceId, {
        plan: selectedPlan,
        billingInterval,
        successUrl: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/subscribe?plan=${selectedPlan}`,
        legalAcceptances: [
          {
            slug: SUBSCRIBE_LEGAL_DOCUMENT.slug,
            version: SUBSCRIBE_LEGAL_DOCUMENT.version,
            contentHash: SUBSCRIBE_LEGAL_DOCUMENT.contentHash,
            acceptedAt: new Date().toISOString(),
          },
        ],
      });
      window.location.href = session.url;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 409) {
          const latest = await refetchBilling();
          if (user && latest) {
            navigate(getPostAuthPath(user, latest), { replace: true });
            return;
          }
        }
        setFormError(error.message);
      } else {
        setFormError('Não foi possível iniciar o checkout. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
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

  const handleRestartRegistration = async () => {
    try {
      setIsResettingRegistration(true);
      await logout();
      setBilling(null);
      navigate(`/register?plan=${encodeURIComponent(selectedPlan)}`, { replace: true });
    } finally {
      setIsResettingRegistration(false);
    }
  };

  return (
    <AuthLayout
      title={isExpiredTrial ? 'Seu teste grátis terminou' : 'Contrate um plano para continuar'}
      subtitle={
        isExpiredTrial
          ? 'Contrate um plano para continuar usando o catálogo.'
          : 'Escolha o plano ideal e conclua o pagamento para liberar o onboarding.'
      }
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-surface-border bg-surface-muted/40 p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-brand-primary shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-typography-heading">
              {isExpiredTrial ? 'Período de teste encerrado' : 'Assinatura necessária'}
            </p>
            <p className="text-sm text-typography-muted">
              {isExpiredTrial
                ? 'Seu acesso ao teste grátis expirou. Escolha um plano e conclua o pagamento no Stripe para retomar o uso.'
                : 'Seu workspace ainda não possui um plano ativo. Após o pagamento no Stripe, você será redirecionado automaticamente.'}
            </p>
          </div>
        </div>

        {formError ? (
          <div className="rounded-md border border-brand-price/30 bg-brand-priceLight px-3.5 py-2.5 text-sm text-brand-price">
            {formError}
          </div>
        ) : null}

        <div className="flex p-1 bg-surface-muted rounded-lg border border-surface-border">
          <button
            type="button"
            className={clsx(
              'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
              billingInterval === 'MONTHLY'
                ? 'bg-white text-typography-heading shadow-sm'
                : 'text-typography-muted hover:text-typography-heading',
            )}
            onClick={() => setBillingInterval('MONTHLY')}
          >
            Mensal
          </button>
          <button
            type="button"
            className={clsx(
              'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
              billingInterval === 'YEARLY'
                ? 'bg-white text-typography-heading shadow-sm'
                : 'text-typography-muted hover:text-typography-heading',
            )}
            onClick={() => setBillingInterval('YEARLY')}
          >
            Anual
          </button>
        </div>

        <div className="space-y-3">
          {PLAN_OPTIONS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={clsx(
                'w-full text-left rounded-lg border p-4 transition-colors',
                selectedPlan === plan.id
                  ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/30'
                  : 'border-surface-border bg-white hover:border-surface-borderHover',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-typography-heading">{plan.name}</p>
                  <p className="text-sm text-typography-muted mt-0.5">{plan.description}</p>
                </div>
                {plan.highlight ? (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">
                    Popular
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-2.5 text-sm text-typography-muted cursor-pointer">
            <input
              type="checkbox"
              checked={acceptContract}
              onChange={(event) => {
                setAcceptContract(event.target.checked);
                if (event.target.checked) {
                  setLegalError(null);
                }
              }}
              className="mt-0.5 h-4 w-4 rounded border-surface-border accent-brand-primary cursor-pointer"
            />
            <span>
              {SUBSCRIBE_LEGAL_DOCUMENT.prefix}
              <a
                href={legalDocumentUrl(SUBSCRIBE_LEGAL_DOCUMENT.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-primary underline-offset-2 hover:underline"
              >
                {SUBSCRIBE_LEGAL_DOCUMENT.anchor}
              </a>
              {SUBSCRIBE_LEGAL_DOCUMENT.suffix}
            </span>
          </label>
          {legalError ? (
            <p className="text-xs text-brand-price bg-brand-priceLight rounded-md px-3 py-2">
              {legalError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => void handleSubscribe()}
            loading={isSubmitting}
          >
            Contratar plano
          </Button>

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
          <Button
            variant="ghost"
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => void handleRestartRegistration()}
            loading={isResettingRegistration}
          >
            Errou algum dado? Sair e cadastrar outra revenda
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}

