import { CheckCircle2, Sparkles, Sliders } from 'lucide-react';
import { Badge } from '../ui/Badge.js';

export interface DmsPreset {
  id: string;
  name: string;
  provider: string;
  confidenceRate: number;
  detectedRootTag: string;
  isPopular?: boolean;
}

export const DMS_PRESETS: DmsPreset[] = [
  {
    id: 'autocerto',
    name: 'AutoCerto XML',
    provider: 'AutoCerto Sistemas',
    confidenceRate: 99.8,
    detectedRootTag: '<veiculos><veiculo>',
    isPopular: true,
  },
  {
    id: 'altimus',
    name: 'Altimus Hub',
    provider: 'Altimus Software',
    confidenceRate: 99.4,
    detectedRootTag: '<estoque><carro>',
    isPopular: true,
  },
  {
    id: 'sisvag',
    name: 'Sisvag DMS',
    provider: 'Sisvag Informática',
    confidenceRate: 98.9,
    detectedRootTag: '<catalogo><item>',
  },
  {
    id: 'bomcontrole',
    name: 'BomControle ERP',
    provider: 'BomControle Tech',
    confidenceRate: 97.5,
    detectedRootTag: '<produtos><produto>',
  },
  {
    id: 'webmotors',
    name: 'Webmotors Integra',
    provider: 'Webmotors API/XML',
    confidenceRate: 99.9,
    detectedRootTag: '<anuncios><anuncio>',
    isPopular: true,
  },
  {
    id: 'custom',
    name: 'Customizado (Manual)',
    provider: 'XML Próprio da Loja',
    confidenceRate: 92.0,
    detectedRootTag: '<raiz><item>',
  },
];

export interface DmsPresetSelectorProps {
  selectedPresetId: string;
  onSelectPreset: (preset: DmsPreset) => void;
}

export function DmsPresetSelector({
  selectedPresetId,
  onSelectPreset,
}: DmsPresetSelectorProps) {
  return (
    <div className="bg-surface-card rounded-lg border border-surface-border p-4 shadow-subtle space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-typography-muted flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-brand-primary" />
            <span>Preset de Ingestão DMS Parceiro</span>
          </h3>
          <p className="text-xs text-typography-body mt-0.5">
            Selecione o layout do seu provedor de estoque para carregar o De/Para automático inteligente.
          </p>
        </div>

        <Badge variant="available" size="sm" dot icon={<CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />}>
          Meta DAA Schema 100% Compatível
        </Badge>
      </div>

      {/* Tabs de Seleção de Presets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {DMS_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-3 rounded-lg text-left border transition-all duration-150 relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/70 border-brand-primary ring-2 ring-brand-primary/20 shadow-sm'
                  : 'bg-surface-muted/50 border-surface-border hover:bg-surface-muted hover:border-surface-borderHover'
              }`}
            >
              {preset.isPopular && (
                <span className="absolute top-2 right-2 text-[9px] bg-brand-primary text-white font-bold px-1.5 py-0.2 rounded-full">
                  Popular
                </span>
              )}

              <div>
                <p className={`text-xs font-bold truncate ${isSelected ? 'text-brand-primary' : 'text-typography-heading'}`}>
                  {preset.name}
                </p>
                <p className="text-[10px] text-typography-muted truncate mt-0.5">
                  {preset.provider}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-surface-border/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-typography-subtle truncate">
                  {preset.detectedRootTag}
                </span>
                <span className="text-[10px] font-bold text-brand-accent flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  {preset.confidenceRate}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
