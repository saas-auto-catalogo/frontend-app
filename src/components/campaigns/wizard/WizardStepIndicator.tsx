import { CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface WizardStepConfig {
  label: string;
  description: string;
}

export interface WizardStepIndicatorProps {
  currentStep: number; // 1..6
  steps: WizardStepConfig[];
  onStepClick?: (step: number) => void;
}

export function WizardStepIndicator({ currentStep, steps, onStepClick }: WizardStepIndicatorProps) {
  return (
    <nav className="space-y-1" aria-label="Progresso do assistente">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isComplete = currentStep > stepNumber;
        const isClickable = isComplete || isActive;

        return (
          <div key={step.label}>
            <button
              type="button"
              onClick={() => isClickable && onStepClick?.(stepNumber)}
              disabled={!isClickable || !onStepClick}
              className={twMerge(
                clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all',
                  isActive && 'bg-brand-primaryLight/50 border border-brand-primary/30',
                  !isActive && 'hover:bg-surface-muted',
                  !isClickable && 'opacity-60 cursor-not-allowed',
                ),
              )}
            >
              <span
                className={twMerge(
                  clsx(
                    'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all',
                    isActive && 'bg-brand-primary text-white shadow-md',
                    isComplete && 'bg-brand-accent text-white',
                    !isActive && !isComplete && 'bg-surface-muted text-typography-muted border border-surface-border',
                  ),
                )}
              >
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : stepNumber}
              </span>
              <span className="min-w-0">
                <span
                  className={twMerge(
                    clsx(
                      'block text-xs font-bold truncate',
                      isActive ? 'text-typography-heading' : 'text-typography-body',
                    ),
                  )}
                >
                  {stepNumber}. {step.label}
                </span>
                <span className="block text-[10px] text-typography-muted truncate">
                  {step.description}
                </span>
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={twMerge(
                  clsx(
                    'ml-[17.5px] h-5 w-px my-0.5',
                    isComplete ? 'bg-brand-accent/60' : 'bg-surface-border',
                  ),
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}