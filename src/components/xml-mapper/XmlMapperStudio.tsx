import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { DmsPresetSelector, DMS_PRESETS, DmsPreset } from './DmsPresetSelector.js';
import { XmlPreviewPanel } from './XmlPreviewPanel.js';
import { OnboardingXmlWizard } from './OnboardingXmlWizard.js';
import {
  Sparkles,
  Save,
  RotateCcw,
  Compass,
  Sliders
} from 'lucide-react';
import { xmlMapperService, MappingRuleDto } from '../../services/api/xmlMapperService.js';

export interface FieldMappingRule {
  id: string;
  metaField: string;
  metaLabel: string;
  sourceTag: string;
  isRequired: boolean;
  transformType: string;
  confidence: number;
}

const INITIAL_MAPPINGS: Record<string, FieldMappingRule[]> = {
  autocerto: [
    { id: '1', metaField: 'g:vehicle_id', metaLabel: 'ID Único do Veículo', sourceTag: 'codigo_veiculo', isRequired: true, transformType: 'DIRECT', confidence: 99.9 },
    { id: '2', metaField: 'g:price', metaLabel: 'Preço de Tabela (BRL)', sourceTag: 'preco_venda', isRequired: true, transformType: 'BRL_CURRENCY', confidence: 99.8 },
    { id: '3', metaField: 'g:sale_price', metaLabel: 'Preço Promocional', sourceTag: 'preco_promocional', isRequired: false, transformType: 'BRL_CURRENCY', confidence: 98.5 },
    { id: '4', metaField: 'g:image_link', metaLabel: 'Foto Principal (Hero)', sourceTag: 'foto_principal', isRequired: true, transformType: 'HTTPS_IMAGE', confidence: 99.7 },
    { id: '5', metaField: 'g:make', metaLabel: 'Marca / Fabricante', sourceTag: 'marca', isRequired: true, transformType: 'DIRECT', confidence: 99.9 },
    { id: '6', metaField: 'g:model', metaLabel: 'Modelo do Veículo', sourceTag: 'modelo', isRequired: true, transformType: 'DIRECT', confidence: 99.5 },
    { id: '7', metaField: 'g:year', metaLabel: 'Ano / Modelo', sourceTag: 'ano_modelo', isRequired: true, transformType: 'COMPUTED_YEAR', confidence: 99.2 },
    { id: '8', metaField: 'g:mileage', metaLabel: 'Quilometragem (KM)', sourceTag: 'quilometragem', isRequired: true, transformType: 'INT_KM', confidence: 99.4 },
    { id: '9', metaField: 'g:vin', metaLabel: 'Chassi / VIN / Placa', sourceTag: 'chassi', isRequired: true, transformType: 'DIRECT', confidence: 98.9 },
    { id: '10', metaField: 'g:fuel_type', metaLabel: 'Tipo de Combustível', sourceTag: 'combustivel', isRequired: false, transformType: 'ENUM_PROPULSION', confidence: 97.8 },
    { id: '11', metaField: 'g:transmission', metaLabel: 'Câmbio / Transmissão', sourceTag: 'cambio', isRequired: false, transformType: 'ENUM_TRANSMISSION', confidence: 98.2 }
  ],
  altimus: [
    { id: '1', metaField: 'g:vehicle_id', metaLabel: 'ID Único do Veículo', sourceTag: 'cod_carro', isRequired: true, transformType: 'DIRECT', confidence: 99.8 },
    { id: '2', metaField: 'g:price', metaLabel: 'Preço de Tabela (BRL)', sourceTag: 'valor', isRequired: true, transformType: 'BRL_CURRENCY', confidence: 99.7 },
    { id: '3', metaField: 'g:image_link', metaLabel: 'Foto Principal (Hero)', sourceTag: 'url_foto', isRequired: true, transformType: 'HTTPS_IMAGE', confidence: 99.6 },
    { id: '4', metaField: 'g:make', metaLabel: 'Marca / Fabricante', sourceTag: 'marca_nome', isRequired: true, transformType: 'DIRECT', confidence: 99.9 },
    { id: '5', metaField: 'g:model', metaLabel: 'Modelo do Veículo', sourceTag: 'modelo_nome', isRequired: true, transformType: 'DIRECT', confidence: 99.4 },
    { id: '6', metaField: 'g:year', metaLabel: 'Ano / Modelo', sourceTag: 'ano_mod', isRequired: true, transformType: 'COMPUTED_YEAR', confidence: 99.1 },
    { id: '7', metaField: 'g:mileage', metaLabel: 'Quilometragem (KM)', sourceTag: 'km', isRequired: true, transformType: 'INT_KM', confidence: 99.5 },
    { id: '8', metaField: 'g:vin', metaLabel: 'Chassi / VIN / Placa', sourceTag: 'placa', isRequired: true, transformType: 'DIRECT', confidence: 98.6 }
  ]
};

export function XmlMapperStudio() {
  const [isWizardMode, setIsWizardMode] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<DmsPreset>(DMS_PRESETS[0]);
  const [mappings, setMappings] = useState<FieldMappingRule[]>(INITIAL_MAPPINGS['autocerto']);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectPreset = async (preset: DmsPreset) => {
    setSelectedPreset(preset);
    try {
      const apiRules = await xmlMapperService.getMappings(preset.id);
      if (apiRules && apiRules.length > 0) {
        setMappings(
          apiRules.map((r: MappingRuleDto) => ({
            id: r.id,
            metaField: r.metaField,
            metaLabel: r.metaDescription || r.metaField,
            sourceTag: r.sourceTag,
            isRequired: r.required,
            transformType: r.transformType,
            confidence: r.confidence,
          }))
        );
        return;
      }
    } catch {
      // Fallback local
    }
    const rules = INITIAL_MAPPINGS[preset.id] || INITIAL_MAPPINGS['autocerto'];
    setMappings(rules);
  };

  const handleSourceTagChange = (ruleId: string, newTag: string) => {
    setMappings((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, sourceTag: newTag } : r))
    );
  };

  const handleSaveMapping = async () => {
    try {
      setIsSaving(true);
      const payload: MappingRuleDto[] = mappings.map((m) => ({
        id: m.id,
        metaField: m.metaField,
        metaDescription: m.metaLabel,
        sourceTag: m.sourceTag,
        transformType: m.transformType,
        required: m.isRequired,
        confidence: m.confidence,
        sampleValue: '',
      }));

      const res = await xmlMapperService.saveMappings(selectedPreset.id, payload);
      alert(`✅ ${res.message}`);
    } catch (err: any) {
      alert(`❌ Erro ao salvar mapeamento: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isWizardMode) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            icon={<Sliders className="w-3.5 h-3.5" />}
            onClick={() => setIsWizardMode(false)}
          >
            Abrir Estúdio Avançado
          </Button>
        </div>
        <OnboardingXmlWizard
          onComplete={(url) => {
            alert(`🎉 Onboarding finalizado! Feed ativo em: ${url}`);
            setIsWizardMode(false);
          }}
          onCancel={() => setIsWizardMode(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de Acesso Rápido ao Wizard Guiado de Onboarding */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Novo Integrador?
            </span>
            <span className="text-xs text-blue-100">Configuração Guiada em 3 Passos</span>
          </div>
          <h3 className="text-base font-bold">Wizard de Conexão XML da Revenda</h3>
          <p className="text-xs text-blue-100 max-w-xl">
            Insira o link XML do seu estoque e deixe a inteligência do Auto Catálogo mapear automaticamente todas as tags para o Meta Automotive Ads.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Compass className="w-4 h-4" />}
          className="bg-white text-blue-700 hover:bg-blue-50 font-bold shrink-0 shadow"
          onClick={() => setIsWizardMode(true)}
        >
          Iniciar Wizard de Onboarding
        </Button>
      </div>

      {/* 1. Card do Gestor de Estoque Conectado */}
      <DmsPresetSelector
        selectedPresetId={selectedPreset.id}
        onSelectPreset={handleSelectPreset}
      />

      {/* 2. Grid de Conteúdo: Matriz De/Para (7 cols) + Preview Lado a Lado (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Matriz de Mapeamento (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="flex items-center justify-between py-4 bg-surface-muted/30">
              <div>
                <h3 className="text-sm font-bold text-typography-heading flex items-center gap-2">
                  <span>Matriz de Correspondência De/Para</span>
                  <Badge variant="available" size="sm" dot>
                    Schema Meta DAA
                  </Badge>
                </h3>
                <p className="text-xs text-typography-muted mt-0.5">
                  Regras de transformação aplicadas em tempo real durante a ingestão do XML.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => handleSelectPreset(selectedPreset)}
                >
                  Restaurar
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Save className="w-3.5 h-3.5" />}
                  onClick={handleSaveMapping}
                  loading={isSaving}
                >
                  Salvar Mapeamento
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-muted/60 border-b border-surface-border text-[11px] font-bold text-typography-muted uppercase tracking-wider">
                      <th className="py-3 px-4">Campo Meta Automotive DAA</th>
                      <th className="py-3 px-4">Tag Origem ({selectedPreset.name})</th>
                      <th className="py-3 px-4">Transformação</th>
                      <th className="py-3 px-4">Confiança IA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border text-xs">
                    {mappings.map((rule) => (
                      <tr key={rule.id} className="hover:bg-surface-muted/30 transition-colors">
                        {/* Campo Canônico Meta */}
                        <td className="py-3 px-4">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-brand-primary">
                                &lt;{rule.metaField}&gt;
                              </span>
                              {rule.isRequired && (
                                <span className="text-[9px] bg-red-50 text-brand-price border border-red-200 font-bold px-1.5 py-0.2 rounded">
                                  Obrigatório
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-typography-muted mt-0.5">{rule.metaLabel}</p>
                          </div>
                        </td>

                        {/* Tag Origem do DMS (Editável) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-typography-subtle font-mono">&lt;</span>
                            <input
                              type="text"
                              value={rule.sourceTag}
                              onChange={(e) => handleSourceTagChange(rule.id, e.target.value)}
                              className="font-mono text-xs px-2 py-1 bg-surface-muted/60 border border-surface-border rounded focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary w-36 text-typography-heading font-semibold"
                            />
                            <span className="text-typography-subtle font-mono">&gt;</span>
                          </div>
                        </td>

                        {/* Tipo de Transformação */}
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-mono text-typography-muted bg-surface-muted px-2 py-0.5 rounded">
                            {rule.transformType}
                          </span>
                        </td>

                        {/* Taxa de Confiança da IA */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge variant="available" size="sm" icon={<Sparkles className="w-2.5 h-2.5 text-brand-accent" />}>
                            {rule.confidence}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Preview Visual Amigável do Veículo Transformado (5 cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <XmlPreviewPanel />
        </div>
      </div>
    </div>
  );
}
