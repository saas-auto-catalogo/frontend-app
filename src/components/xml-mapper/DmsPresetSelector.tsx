import { useState } from 'react';
import { Sparkles, Server, ChevronDown, Check, ArrowLeftRight } from 'lucide-react';
import { Badge } from '../ui/Badge.js';

export interface DmsPreset {
  id: string;
  name: string;
  provider: string;
  confidenceRate: number;
  detectedRootTag: string;
  endpointExample: string;
}

export const DMS_PRESETS: DmsPreset[] = [
  {
    id: 'autocerto',
    name: 'AutoCerto XML',
    provider: 'AutoCerto Sistemas',
    confidenceRate: 99.8,
    detectedRootTag: '<veiculos><veiculo>',
    endpointExample: 'https://integrador.autocerto.com/feed/loja123/estoque.xml',
  },
  {
    id: 'altimus',
    name: 'Altimus Hub',
    provider: 'Altimus Software',
    confidenceRate: 99.4,
    detectedRootTag: '<estoque><carro>',
    endpointExample: 'https://api.altimus.com.br/v2/feed/loja.xml',
  },
  {
    id: 'sisvag',
    name: 'Sisvag DMS',
    provider: 'Sisvag Informática',
    confidenceRate: 98.9,
    detectedRootTag: '<catalogo><item>',
    endpointExample: 'https://integrador.sisvag.com.br/export/catalogo.xml',
  },
  {
    id: 'bomcontrole',
    name: 'BomControle ERP',
    provider: 'BomControle Tech',
    confidenceRate: 97.5,
    detectedRootTag: '<produtos><produto>',
    endpointExample: 'https://app.bomcontrole.com.br/integracao/produtos.xml',
  },
  {
    id: 'webmotors',
    name: 'Webmotors Integra',
    provider: 'Webmotors API/XML',
    confidenceRate: 99.9,
    detectedRootTag: '<anuncios><anuncio>',
    endpointExample: 'https://integra.webmotors.com.br/feeds/anuncios.xml',
  },
  {
    id: 'custom',
    name: 'Customizado (Manual)',
    provider: 'XML Próprio da Loja',
    confidenceRate: 92.0,
    detectedRootTag: '<raiz><item>',
    endpointExample: 'https://suaconcessionaria.com.br/feed/estoque.xml',
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
  const [isChangingDms, setIsChangingDms] = useState(false);
  const currentPreset = DMS_PRESETS.find((p) => p.id === selectedPresetId) || DMS_PRESETS[0];

  return (
    <div className="bg-surface-card rounded-xl border border-surface-border p-5 shadow-subtle space-y-4">
      {/* Visual Principal: O Único Gestor de Estoque Conectado da Loja */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center border border-blue-200/70 shadow-sm shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-typography-muted">
                Gestor de Estoque Conectado (DMS)
              </span>
              <Badge variant="available" size="sm" dot>
                Conexão Ativa
              </Badge>
            </div>
            <h3 className="text-base font-bold text-typography-heading flex items-center gap-2 mt-0.5">
              <span>{currentPreset.name}</span>
              <span className="text-xs font-normal text-typography-muted">({currentPreset.provider})</span>
            </h3>
            <p className="text-xs font-mono text-typography-subtle mt-0.5 truncate max-w-md">
              {currentPreset.endpointExample}
            </p>
          </div>
        </div>

        {/* Status de Confiança & Botão de Troca */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-brand-accent flex items-center justify-end gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentPreset.confidenceRate}% de Precisão</span>
            </div>
            <p className="text-[11px] text-typography-muted">142 veículos mapeados</p>
          </div>

          <button
            onClick={() => setIsChangingDms(!isChangingDms)}
            className="px-3 py-1.5 bg-surface-muted hover:bg-surface-muted/80 text-typography-heading text-xs font-semibold rounded-lg border border-surface-border transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-brand-primary" />
            <span>Alterar Sistema DMS</span>
            <ChevronDown className={`w-3 h-3 text-typography-muted transition-transform ${isChangingDms ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Menu Retrátil para caso a loja troque de sistema DMS */}
      {isChangingDms && (
        <div className="pt-3 border-t border-surface-border space-y-2 animate-fadeIn">
          <p className="text-xs font-semibold text-typography-muted">
            Selecione o novo sistema DMS da sua concessionária para carregar o modelo de De/Para correspondente:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {DMS_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset);
                    setIsChangingDms(false);
                  }}
                  className={`p-2.5 rounded-lg text-left border transition-all text-xs ${
                    isSelected
                      ? 'bg-blue-50/80 border-brand-primary font-bold text-brand-primary ring-1 ring-brand-primary/30'
                      : 'bg-surface-muted/40 border-surface-border text-typography-body hover:bg-surface-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{preset.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-brand-primary shrink-0" />}
                  </div>
                  <p className="text-[10px] text-typography-muted truncate mt-0.5">{preset.provider}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
