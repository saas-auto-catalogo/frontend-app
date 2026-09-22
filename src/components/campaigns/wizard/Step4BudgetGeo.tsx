import { Crosshair, Info, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MIN_DAILY_BUDGET_REAIS } from '../../../services/api/campaignService.js';

export interface Step4BudgetGeoProps {
  radiusKm: number;
  onRadiusChange: (radiusKm: number) => void;
  dailyBudgetReais: number;
  onBudgetChange: (dailyBudgetReais: number) => void;
  continuousPacing: boolean;
  onPacingChange: (continuous: boolean) => void;
  endDate?: string;
  onEndDateChange: (date?: string) => void;
}

export const RADIUS_OPTIONS = [10, 25, 50, 100, 250, 500];
export const BUDGET_PRESETS = [
  { value: 15, label: 'R$ 15' },
  { value: 30, label: 'R$ 30' },
  { value: 50, label: 'R$ 50' },
  { value: 100, label: 'R$ 100' },
  { value: 250, label: 'R$ 250' },
];

export function Step4BudgetGeo({
  radiusKm,
  onRadiusChange,
  dailyBudgetReais,
  onBudgetChange,
  continuousPacing,
  onPacingChange,
  endDate,
  onEndDateChange,
}: Step4BudgetGeoProps) {
  const budgetBelowMin = dailyBudgetReais < MIN_DAILY_BUDGET_REAIS;

  return (
    <div className="space-y-6">
      {/* Budget */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold text-typography-heading">Orçamento Diário</h3>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {BUDGET_PRESETS.map((preset) => {
            const selected = dailyBudgetReais === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => onBudgetChange(preset.value)}
                className={twMerge(
                  clsx(
                    'py-2.5 rounded-lg border text-sm font-bold transition-all',
                    selected
                      ? 'bg-brand-primary text-white border-brand-primary shadow-md'
                      : 'bg-white text-typography-body border-surface-border hover:border-brand-primary/50',
                  ),
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-typography-muted">Ou digite um valor:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-typography-heading">R$</span>
            <input
              type="number"
              min={MIN_DAILY_BUDGET_REAIS}
              value={dailyBudgetReais}
              onChange={(event) => {
                const value = event.target.value;
                onBudgetChange(value === '' ? 0 : Number(value));
              }}
              className="w-28 px-3 py-2 rounded-lg border border-surface-border bg-white text-sm text-typography-heading focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            />
          </div>
          <span className="text-xs text-typography-muted">por dia</span>
        </div>

        {budgetBelowMin && (
          <p className="text-xs text-status-error-text">
            O orçamento diário mínimo é de R$ {MIN_DAILY_BUDGET_REAIS.toLocaleString('pt-BR')},00.
          </p>
        )}
        {!budgetBelowMin && (
          <p className="text-xs text-typography-muted">
            Valor mínimo de R$ {MIN_DAILY_BUDGET_REAIS.toLocaleString('pt-BR')},00/dia. Estimativa
            mensal:{' '}
            <strong className="text-typography-heading">
              ~R$ {Math.round(dailyBudgetReais * 30).toLocaleString('pt-BR')}
            </strong>
            .
          </p>
        )}
      </section>

      {/* Pacing */}
      <section className="space-y-2.5">
        <h3 className="text-sm font-bold text-typography-heading">Ritmo de Entrega</h3>
        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onPacingChange(true)}
            className={twMerge(
              clsx(
                'flex-1 p-3 rounded-lg border-2 text-left transition-all',
                continuousPacing
                  ? 'border-brand-primary bg-brand-primaryLight/40'
                  : 'border-surface-border bg-surface-card hover:border-brand-primary/40',
              ),
            )}
          >
            <p className="text-sm font-bold text-typography-heading">Distribuição Contínua</p>
            <p className="mt-0.5 text-xs text-typography-muted leading-relaxed">
              Gasta o orçamento de forma constante ao longo do dia. Gera conversões estáveis e
              previsíveis, ideal para WhatsApp e formulários.
            </p>
          </button>
          <button
            type="button"
            onClick={() => onPacingChange(false)}
            className={twMerge(
              clsx(
                'flex-1 p-3 rounded-lg border-2 text-left transition-all',
                !continuousPacing
                  ? 'border-brand-primary bg-brand-primaryLight/40'
                  : 'border-surface-border bg-surface-card hover:border-brand-primary/40',
              ),
            )}
          >
            <p className="text-sm font-bold text-typography-heading">Maior Volume</p>
            <p className="mt-0.5 text-xs text-typography-muted leading-relaxed">
              Concentra entregas nos momentos com maior chance de conversão. Pode esgotar o
              orçamento cedo no dia.
            </p>
          </button>
        </div>
      </section>

      {/* Radius */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold text-typography-heading">Raio de Alcance</h3>
        </div>
        <p className="text-xs text-typography-muted">
          A distribuição é baseada nas localizações configuradas no{' '}
          <span className="font-semibold text-typography-body">Mapeador de Agências</span>. O raio
          define a área ao redor de cada unidade.
        </p>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((radius) => {
            const selected = radiusKm === radius;
            return (
              <button
                key={radius}
                type="button"
                onClick={() => onRadiusChange(radius)}
                className={twMerge(
                  clsx(
                    'px-4 py-2 rounded-full border text-xs font-semibold transition-all',
                    selected
                      ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                      : 'bg-white text-typography-body border-surface-border hover:border-brand-primary/50',
                  ),
                )}
              >
                {radius} km
              </button>
            );
          })}
        </div>
      </section>

      {/* Schedule */}
      <section className="space-y-2.5">
        <h3 className="text-sm font-bold text-typography-heading">Agendamento</h3>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-typography-body cursor-pointer">
            <input
              type="checkbox"
              checked={continuousPacing}
              onChange={(event) => onPacingChange(event.target.checked)}
              className="w-4 h-4 rounded border-surface-border text-brand-primary accent-brand-primary"
            />
            Rodar continuamente (sem data final)
          </label>

          {!continuousPacing && (
            <input
              type="date"
              value={endDate ?? ''}
              onChange={(event) => onEndDateChange(event.target.value || undefined)}
              className="px-3 py-2 rounded-lg border border-surface-border bg-white text-sm text-typography-heading focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            />
          )}

          {continuousPacing && (
            <span className="flex items-center gap-1.5 text-xs text-typography-muted">
              <Crosshair className="w-3.5 h-3.5" /> Sem data de término definida
            </span>
          )}
        </div>
      </section>
    </div>
  );
}