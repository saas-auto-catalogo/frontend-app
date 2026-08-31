import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { DmsPresetSelector, DMS_PRESETS, DmsPreset } from './DmsPresetSelector.js';
import { XmlPreviewPanel } from './XmlPreviewPanel.js';
import {
  Sparkles,
  Save,
  RotateCcw,
} from 'lucide-react';

export interface FieldMappingRule {
  id: string;
  metaField: string;
  metaLabel: string;
  sourceTag: string;
  isRequired: boolean;
  transformType: 'DIRECT' | 'BRL_CURRENCY' | 'INT_KM' | 'HTTPS_IMAGE' | 'ENUM_PROPULSION' | 'ENUM_TRANSMISSION' | 'COMPUTED_YEAR';
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
  const [selectedPreset, setSelectedPreset] = useState<DmsPreset>(DMS_PRESETS[0]);
  const [mappings, setMappings] = useState<FieldMappingRule[]>(INITIAL_MAPPINGS['autocerto']);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectPreset = (preset: DmsPreset) => {
    setSelectedPreset(preset);
    const rules = INITIAL_MAPPINGS[preset.id] || INITIAL_MAPPINGS['autocerto'];
    setMappings(rules);
  };

  const handleSourceTagChange = (ruleId: string, newTag: string) => {
    setMappings((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, sourceTag: newTag } : r))
    );
  };

  const handleSaveMapping = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(`✅ Mapeamento De/Para para '${selectedPreset.name}' salvo com sucesso no banco de dados!`);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Presets do DMS */}
      <DmsPresetSelector
        selectedPresetId={selectedPreset.id}
        onSelectPreset={handleSelectPreset}
      />

      {/* Grade Principal: Mapeador De/Para + Preview Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Grid de Mapeamento (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="flex items-center justify-between py-3.5 bg-surface-muted/30">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-typography-heading">
                    Regras de Mapeamento De/Para
                  </h3>
                  <Badge variant="primary" size="sm">
                    {selectedPreset.name}
                  </Badge>
                </div>
                <p className="text-xs text-typography-muted mt-0.5">
                  Associação das tags do XML de entrada para as chaves canônicas do Meta Ads DAA.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={() => handleSelectPreset(selectedPreset)}>
                  Resetar
                </Button>
                <Button variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />} onClick={handleSaveMapping} loading={isSaving}>
                  Salvar
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-muted/60 border-b border-surface-border text-[11px] font-bold text-typography-muted uppercase tracking-wider">
                      <th className="py-2.5 px-4">Tag Canônica Meta Ads</th>
                      <th className="py-2.5 px-4">Tag de Origem DMS</th>
                      <th className="py-2.5 px-4">Transformação</th>
                      <th className="py-2.5 px-4">Match IA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border text-xs">
                    {mappings.map((rule) => (
                      <tr key={rule.id} className="hover:bg-blue-50/20 transition-colors">
                        {/* Campo Canônico Meta */}
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-mono text-xs font-bold text-brand-primary bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {rule.metaField}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs text-typography-body font-medium">{rule.metaLabel}</span>
                              {rule.isRequired ? (
                                <span className="text-[10px] text-brand-price font-bold">*Obrigatório</span>
                              ) : (
                                <span className="text-[10px] text-typography-subtle">Opcional</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Tag de Entrada DMS (Editável) */}
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

        {/* Coluna Direita: Preview Lado a Lado (5 cols) */}
        <div className="lg:col-span-5">
          <XmlPreviewPanel dmsName={selectedPreset.name} />
        </div>
      </div>
    </div>
  );
}
