import { AlertTriangle, Car, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Badge } from '../../ui/Badge.js';

export type StockSelectionMode = 'ALL' | 'CUSTOM_FILTER';

export interface Step3InventoryFilterProps {
  mode: StockSelectionMode;
  onModeChange: (mode: StockSelectionMode) => void;
  selectedMakes: string[];
  onMakesChange: (makes: string[]) => void;
  selectedBodyStyles: string[];
  onBodyStylesChange: (bodyStyles: string[]) => void;
  maxPrice?: number;
  onMaxPriceChange: (price: number | undefined) => void;
  availableMakes: string[];
  availableBodyStyles: string[];
  eligibleCount: number | null;
  loadingEligibleCount?: boolean;
}

export const BODY_STYLES_DEFAULT = ['SUV', 'Sedan', 'Hatch', 'Picape', 'Coupé', 'Perua'];

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function Step3InventoryFilter({
  mode,
  onModeChange,
  selectedMakes,
  onMakesChange,
  selectedBodyStyles,
  onBodyStylesChange,
  maxPrice,
  onMaxPriceChange,
  availableMakes,
  availableBodyStyles,
  eligibleCount,
  loadingEligibleCount,
}: Step3InventoryFilterProps) {
  const bodyStyles =
    availableBodyStyles.length > 0 ? availableBodyStyles : BODY_STYLES_DEFAULT;

  const showZeroAlert = mode === 'CUSTOM_FILTER' && eligibleCount !== null && eligibleCount === 0;

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onModeChange('ALL')}
          className={twMerge(
            clsx(
              'p-4 rounded-xl border-2 text-left transition-all',
              mode === 'ALL'
                ? 'border-brand-primary bg-brand-primaryLight/40'
                : 'border-surface-border bg-surface-card hover:border-brand-primary/40',
            ),
          )}
        >
          <p className="text-sm font-bold text-typography-heading">Todo o Estoque Elegível</p>
          <p className="mt-1 text-xs text-typography-muted">
            Anuncia automaticamente todos os veículos que atendem aos critérios do catálogo Meta.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('CUSTOM_FILTER')}
          className={twMerge(
            clsx(
              'p-4 rounded-xl border-2 text-left transition-all',
              mode === 'CUSTOM_FILTER'
                ? 'border-brand-primary bg-brand-primaryLight/40'
                : 'border-surface-border bg-surface-card hover:border-brand-primary/40',
            ),
          )}
        >
          <p className="text-sm font-bold text-typography-heading">Filtro Específico</p>
          <p className="mt-1 text-xs text-typography-muted">
            Seleciona apenas veículos que atendem aos critérios abaixo.
          </p>
        </button>
      </div>

      {mode === 'CUSTOM_FILTER' && (
        <div className="space-y-5">
          {/* Makes */}
          <section className="space-y-2.5">
            <h4 className="text-sm font-bold text-typography-heading">Marcas</h4>
            {availableMakes.length === 0 ? (
              <p className="text-xs text-typography-muted">Carregando marcas do estoque...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableMakes.map((make) => {
                  const selected = selectedMakes.includes(make);
                  return (
                    <button
                      key={make}
                      type="button"
                      onClick={() => onMakesChange(toggleItem(selectedMakes, make))}
                      className={twMerge(
                        clsx(
                          'px-3 py-1.5 rounded-full border text-xs font-semibold transition-all',
                          selected
                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                            : 'bg-white text-typography-body border-surface-border hover:border-brand-primary/50',
                        ),
                      )}
                    >
                      {make}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Body styles */}
          <section className="space-y-2.5">
            <h4 className="text-sm font-bold text-typography-heading">Carroceria</h4>
            <div className="flex flex-wrap gap-2">
              {bodyStyles.map((style) => {
                const selected = selectedBodyStyles.includes(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => onBodyStylesChange(toggleItem(selectedBodyStyles, style))}
                    className={twMerge(
                      clsx(
                        'px-3 py-1.5 rounded-full border text-xs font-semibold transition-all',
                        selected
                          ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                          : 'bg-white text-typography-body border-surface-border hover:border-brand-primary/50',
                      ),
                    )}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Max price */}
          <section className="space-y-2.5">
            <h4 className="text-sm font-bold text-typography-heading">Preço Máximo</h4>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                placeholder="Sem limite"
                value={maxPrice ?? ''}
                onChange={(event) => {
                  const value = event.target.value;
                  onMaxPriceChange(value === '' ? undefined : Number(value));
                }}
                className="w-full max-w-xs px-3.5 py-2.5 rounded-lg border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
              <div className="flex items-center text-sm text-typography-muted gap-1.5">
                <span>R$</span>
                <button
                  type="button"
                  onClick={() => onMaxPriceChange(undefined)}
                  className="text-brand-primary font-semibold text-xs hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Counter */}
      <div
        className={twMerge(
          clsx(
            'flex items-center justify-between p-4 rounded-lg border',
            showZeroAlert ? 'border-status-error-border bg-status-error-bg' : 'border-surface-border bg-surface-muted',
          ),
        )}
      >
        <div className="flex items-center gap-2.5">
          <Car className="w-5 h-5 text-brand-primary" />
          <div>
            <p className="text-sm font-bold text-typography-heading">
              {loadingEligibleCount ? (
                'Calculando veículos elegíveis...'
              ) : (
                <>
                  {eligibleCount ?? 0} veículo{eligibleCount === 1 ? '' : 's'} selecionado
                  {eligibleCount === 1 ? '' : 's'}
                </>
              )}
            </p>
            <p className="text-xs text-typography-muted">
              {mode === 'ALL'
                ? 'Todo o estoque elegível do catálogo Meta.'
                : 'Baseado nos filtros de marca, carroceria e preço.'}
            </p>
          </div>
        </div>

        {showZeroAlert ? (
          <Badge variant="error" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
            Nenhum veículo
          </Badge>
        ) : (
          <Badge variant="available" icon={<Check className="w-3.5 h-3.5" />}>
            Pronto para anunciar
          </Badge>
        )}
      </div>

      {showZeroAlert && (
        <p className="text-xs text-status-error-text">
          Ajuste os filtros para incluir ao menos um veículo elegível antes de continuar.
        </p>
      )}
    </div>
  );
}