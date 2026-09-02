import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { OnboardingStepper } from '../components/onboarding/OnboardingStepper.js';
import { OnboardingStepPlaceholder } from '../components/onboarding/OnboardingStepPlaceholder.js';
import { OnboardingSummaryStep } from '../components/onboarding/OnboardingSummaryStep.js';
import {
  OnboardingDealershipStep,
  type OnboardingDealershipStepHandle,
} from '../components/onboarding/OnboardingDealershipStep.js';
import {
  OnboardingFeedStep,
  type OnboardingFeedStepHandle,
} from '../components/onboarding/OnboardingFeedStep.js';
import { useAuth } from '../context/AuthContext.js';
import { ApiError } from '../types/api.js';

const ONBOARDING_STEPS = [
  { label: 'Revenda', description: 'Dados e logotipo' },
  { label: 'Feed DMS', description: 'Conexão do estoque' },
  { label: 'Meta Ads', description: 'Integração opcional' },
  { label: 'Resumo', description: 'Conclusão' },
];

const TOTAL_STEPS = ONBOARDING_STEPS.length;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateOnboarding, logout } = useAuth();
  const step1Ref = useRef<OnboardingDealershipStepHandle>(null);
  const step2Ref = useRef<OnboardingFeedStepHandle>(null);
  const [currentStep, setCurrentStep] = useState(user?.onboardingStep ?? 1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.onboardingStep) {
      setCurrentStep(user.onboardingStep);
    }
  }, [user?.onboardingStep]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
    }
  };

  const handleFinish = async (tab?: string) => {
    setError(null);

    try {
      setIsSaving(true);
      await updateOnboarding({ onboardingCompleted: true });
      navigate('/', {
        replace: true,
        state: tab ? { tab } : undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível concluir o onboarding.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipStep = async () => {
    if (currentStep !== 2) return;

    setError(null);

    try {
      setIsSaving(true);
      await updateOnboarding({ onboardingStep: 3 });
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível pular esta etapa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = async () => {
    setError(null);

    if (currentStep < TOTAL_STEPS) {
      try {
        setIsSaving(true);

        if (currentStep === 1) {
          const saved = await step1Ref.current?.saveAndValidate();
          if (!saved) return;
        }

        if (currentStep === 2) {
          const connected = await step2Ref.current?.connectAndValidate();
          if (!connected) return;
        }

        const nextStep = currentStep + 1;
        await updateOnboarding({ onboardingStep: nextStep });
        setCurrentStep(nextStep);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Não foi possível salvar o progresso.');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    await handleFinish();
  };

  return (
    <div className="min-h-screen bg-surface-canvas">
      <header className="border-b border-surface-border bg-surface-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-blue-50 text-brand-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-sm font-bold text-typography-heading">Configuração inicial</h1>
              <p className="text-xs text-typography-muted">{user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void logout()}>
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-surface-card rounded-xl border border-surface-border p-6 shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
            <div>
              <h2 className="text-lg font-bold text-typography-heading">
                Assistente de Onboarding
              </h2>
              <p className="text-xs text-typography-muted mt-1">
                Configure sua revenda em {TOTAL_STEPS} etapas para começar a publicar no Meta Ads.
              </p>
            </div>
            <Badge variant="available" size="sm" dot>
              Passo {currentStep} de {TOTAL_STEPS}
            </Badge>
          </div>

          <OnboardingStepper currentStep={currentStep} steps={ONBOARDING_STEPS} />

          <div key={currentStep} className="transition-opacity duration-200">
            {currentStep === 1 ? (
              <OnboardingDealershipStep ref={step1Ref} disabled={isSaving} />
            ) : currentStep === 2 ? (
              <OnboardingFeedStep ref={step2Ref} disabled={isSaving} />
            ) : currentStep === TOTAL_STEPS ? (
              <OnboardingSummaryStep
                onFinish={(options) => void handleFinish(options?.tab)}
                isFinishing={isSaving}
              />
            ) : (
              <OnboardingStepPlaceholder step={currentStep} />
            )}
          </div>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <div>
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  size="md"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={handleBack}
                  disabled={isSaving}
                >
                  Voltar
                </Button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {currentStep === 2 ? (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => void handleSkipStep()}
                  disabled={isSaving}
                >
                  Pular por agora
                </Button>
              ) : null}
              <Button
                variant="primary"
                size="md"
                icon={
                  currentStep === TOTAL_STEPS ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )
                }
                onClick={() => void handleContinue()}
                loading={isSaving}
              >
                {currentStep === TOTAL_STEPS ? 'Concluir' : 'Continuar'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
