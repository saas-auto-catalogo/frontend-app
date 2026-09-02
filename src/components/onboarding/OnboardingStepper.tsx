import { CheckCircle2 } from 'lucide-react';

export interface OnboardingStepConfig {
  label: string;
  description: string;
}

export interface OnboardingStepperProps {
  currentStep: number;
  steps: OnboardingStepConfig[];
}

export function OnboardingStepper({ currentStep, steps }: OnboardingStepperProps) {
  return (
    <div className="grid gap-2 pt-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep >= stepNumber;
        const isComplete = currentStep > stepNumber;

        return (
          <div key={step.label} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                isActive ? 'bg-brand-primary text-white shadow-sm' : 'bg-surface-muted text-typography-muted'
              }`}
            >
              {isComplete ? <CheckCircle2 className="w-4 h-4" /> : stepNumber}
            </div>
            <div className="min-w-0 hidden sm:block">
              <p
                className={`text-xs font-bold truncate ${
                  isActive ? 'text-typography-heading' : 'text-typography-muted'
                }`}
              >
                {stepNumber}. {step.label}
              </p>
              <p className="text-[10px] text-typography-muted truncate">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
