import { useMemo } from 'react';
import { Car, Wand2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CampaignDestinationType } from '../../../types/campaign.js';
import type { VehicleAdData } from '../../inventory/MetaAdSimulator.js';
import { MetaAdSimulator } from '../../inventory/MetaAdSimulator.js';
import { applyHeadlineTemplate, applyMessageTemplate } from '../../../services/api/campaignService.js';

export interface Step5CreativeProps {
  destinationType: CampaignDestinationType;
  campaignName: string;
  onCampaignNameChange: (name: string) => void;
  headlineTemplate: string;
  onHeadlineTemplateChange: (template: string) => void;
  messageTemplate: string;
  onMessageTemplateChange: (template: string) => void;
  whatsappGreeting: string;
  onWhatsappGreetingChange: (greeting: string) => void;
  whatsappNumber?: string;
  sampleVehicle: VehicleAdData;
}

export const HEADLINE_DEFAULT = '{{make}} {{model}} com oferta especial!';
export const MESSAGE_DEFAULT =
  'Olá! Vi o {{make}} {{model}} no anúncio e gostaria de agendar um test-drive.';
export const GREETING_DEFAULT = 'Olá {first_name}! Gostaria de saber mais sobre o veículo?';

export function Step5Creative({
  destinationType,
  campaignName,
  onCampaignNameChange,
  headlineTemplate,
  onHeadlineTemplateChange,
  messageTemplate,
  onMessageTemplateChange,
  whatsappGreeting,
  onWhatsappGreetingChange,
  whatsappNumber,
  sampleVehicle,
}: Step5CreativeProps) {
  const renderedHeadline = useMemo(
    () => applyHeadlineTemplate(headlineTemplate, sampleVehicle),
    [headlineTemplate, sampleVehicle],
  );

  const renderedMessage = useMemo(
    () => applyMessageTemplate(messageTemplate, sampleVehicle),
    [messageTemplate, sampleVehicle],
  );

  const charCount = (value: string) => value.length;
  const headlineCount = charCount(renderedHeadline);
  const messageCount = charCount(renderedMessage);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Configuração de copy */}
      <div className="space-y-5">
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-typography-heading">Nome da Campanha</h3>
          <input
            type="text"
            value={campaignName}
            onChange={(event) => onCampaignNameChange(event.target.value)}
            placeholder="Ex.: WhatsApp - GLC 300 Coupé - Maio"
            className="w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-white text-sm text-typography-heading focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-typography-heading">Título do Anúncio</h3>
            <span
              className={twMerge(
                clsx(
                  'text-[10px] font-semibold font-mono',
                  headlineCount > 125 ? 'text-status-error-text' : 'text-typography-muted',
                ),
              )}
            >
              {headlineCount}/125
            </span>
          </div>
          <textarea
            value={headlineTemplate}
            onChange={(event) => onHeadlineTemplateChange(event.target.value)}
            rows={2}
            maxLength={200}
            placeholder="Use variáveis: {{make}}, {{model}}, {{price}}, {{dealership}}"
            className="w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-white text-sm text-typography-heading focus:outline-none focus:ring-2 focus:ring-brand-primary/40 resize-none"
          />
          <p className="text-xs text-typography-muted flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-brand-primary" />
            Dica: use variáveis para personalizar por veículo.
          </p>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-typography-heading">Mensagem Principal</h3>
            <span
              className={twMerge(
                clsx(
                  'text-[10px] font-semibold font-mono',
                  messageCount > 125 ? 'text-status-error-text' : 'text-typography-muted',
                ),
              )}
            >
              {messageCount}/125
            </span>
          </div>
          <textarea
            value={messageTemplate}
            onChange={(event) => onMessageTemplateChange(event.target.value)}
            rows={3}
            maxLength={200}
            placeholder="Mensagem exibida abaixo do título no anúncio."
            className="w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-white text-sm text-typography-heading focus:outline-none focus:ring-2 focus:ring-brand-primary/40 resize-none"
          />
        </section>

        {destinationType === 'WHATSAPP_MESSAGE' && (
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-typography-heading">Saudação Inicial no WhatsApp</h3>
            <textarea
              value={whatsappGreeting}
              onChange={(event) => onWhatsappGreetingChange(event.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Mensagem automática enviada ao abrir a conversa."
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-white text-sm text-typography-heading focus:outline-none focus:ring-2 focus:ring-brand-primary/40 resize-none"
            />
            <p className="text-xs text-typography-muted">
              Use variáveis comuns do WhatsApp: {'{first_name}, {last_name}, {phone_number}'}.
            </p>
          </section>
        )}
      </div>

      {/* Simulador */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold text-typography-heading">Prévia do Anúncio</h3>
        </div>
        <MetaAdSimulator
          vehicle={sampleVehicle}
          customHeadline={renderedHeadline}
          customMessage={renderedMessage}
          ctaType={destinationType === 'WHATSAPP_MESSAGE' ? 'WHATSAPP' : 'LEAD_FORM'}
          dealershipWhatsApp={whatsappNumber}
        />
        <p className="text-xs text-typography-muted">
          Prévia gerada com o veículo de melhor desempenho do seu estoque. O anúncio real será
          personalizado para cada veículo.
        </p>
      </section>
    </div>
  );
}