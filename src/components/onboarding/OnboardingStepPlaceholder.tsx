import { Card } from '../ui/Card.js';
import { Sparkles } from 'lucide-react';

const STEP_ISSUES: Record<number, string> = {
  1: '#34 — Dados da Revenda',
  2: '#35 — Conexão do Feed DMS',
  3: '#36 — Meta Ads',
  4: '#37 — Resumo e conclusão',
};

const STEP_TITLES: Record<number, string> = {
  1: 'Dados da Revenda e logotipo',
  2: 'Conexão do primeiro Feed DMS',
  3: 'Conexão Meta Ads',
  4: 'Resumo e conclusão',
};

export interface OnboardingStepPlaceholderProps {
  step: number;
}

export function OnboardingStepPlaceholder({ step }: OnboardingStepPlaceholderProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <span className="p-2 rounded-lg bg-blue-50 text-brand-primary shrink-0">
          <Sparkles className="w-5 h-5" />
        </span>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-typography-heading">
            {STEP_TITLES[step]}
          </h3>
          <p className="text-sm text-typography-muted">
            O conteúdo deste passo será implementado na issue {STEP_ISSUES[step]}.
            Por enquanto, use os botões abaixo para navegar e validar o fluxo do wizard.
          </p>
        </div>
      </div>
    </Card>
  );
}
