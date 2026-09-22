import { MessageCircle, ClipboardList } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CampaignDestinationType } from '../../../types/campaign.js';

export interface Step1ObjectiveProps {
  value: CampaignDestinationType | null;
  onChange: (value: CampaignDestinationType) => void;
}

const OPTIONS: Array<{
  id: CampaignDestinationType;
  title: string;
  description: string;
  bullets: string[];
}> = [
  {
    id: 'WHATSAPP_MESSAGE',
    title: 'Receber Mensagens no WhatsApp',
    description:
      'O clique do comprador abre uma conversa direta no WhatsApp do vendedor, acelerando a negociação.',
    bullets: [
      'Conversa em tempo real com seu time',
      'Qualificação imediata do interessado',
      'Ideal para ofertas e negociação rápida',
    ],
  },
  {
    id: 'INSTANT_LEAD_FORM',
    title: 'Receber Cadastros (Formulários Meta)',
    description:
      'O comprador preenche um formulário instantâneo nativo da Meta, já pré-populado com seus dados.',
    bullets: [
      'Captura de leads com formulário nativo',
      'Meta pré-preenche nome, e-mail e telefone',
      'Mais conversões em qualquer dispositivo',
    ],
  },
];

export function Step1Objective({ value, onChange }: Step1ObjectiveProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {OPTIONS.map((option) => {
        const isSelected = value === option.id;
        const Icon = option.id === 'WHATSAPP_MESSAGE' ? MessageCircle : ClipboardList;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={twMerge(
              clsx(
                'relative p-5 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-brand-primary bg-brand-primaryLight/30 shadow-md'
                  : 'border-surface-border bg-surface-card hover:border-brand-primary/40 hover:shadow-sm',
              ),
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={twMerge(
                  clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                    option.id === 'WHATSAPP_MESSAGE' ? 'bg-brand-accent text-white' : 'bg-brand-primary text-white',
                  ),
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span
                className={twMerge(
                  clsx(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1',
                    isSelected ? 'border-brand-primary bg-brand-primary' : 'border-surface-border bg-white',
                  ),
                )}
              >
                {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
              </span>
            </div>

            <h3 className="mt-4 text-base font-bold text-typography-heading">{option.title}</h3>
            <p className="mt-1.5 text-sm text-typography-muted leading-relaxed">
              {option.description}
            </p>

            <ul className="mt-4 space-y-1.5">
              {option.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2 text-xs text-typography-body"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1 shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}