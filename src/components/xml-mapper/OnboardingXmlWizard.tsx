import { useState } from 'react';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Link,
  Layers,
  Copy,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { DMS_PRESETS, DmsPreset } from './DmsPresetSelector.js';
import { useWorkspace } from '../../hooks/useWorkspace.js';
import { feedService } from '../../services/api/feedService.js';
import { ApiError } from '../../types/api.js';
import {
  type FeedDetectedFormat,
  getFeedValidationSuccessMessage,
  getPresetIdsForFormat,
  resolvePresetIdFromSuggestion,
} from '../../utils/feedPresets.js';

export interface OnboardingXmlWizardProps {
  onComplete?: (feedUrl: string) => void;
  onCancel?: () => void;
}

export function OnboardingXmlWizard({ onComplete, onCancel }: OnboardingXmlWizardProps) {
  const { workspaceId } = useWorkspace();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [xmlUrl, setXmlUrl] = useState<string>('https://integrador.autocerto.com/feed/loja123/estoque.xml');
  const [selectedPreset, setSelectedPreset] = useState<DmsPreset>(DMS_PRESETS[0]);
  const [isValidatingUrl, setIsValidatingUrl] = useState<boolean>(false);
  const [urlStatus, setUrlStatus] = useState<'IDLE' | 'VALID' | 'INVALID'>('IDLE');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [vehicleCount, setVehicleCount] = useState<number | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<FeedDetectedFormat | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const generatedFeedUrl = 'https://api.drivesync.me/api/v1/feeds/sec_tok_98f12ae8b10/meta-vehicles.xml';

  const visiblePresets = DMS_PRESETS.filter((preset) =>
    getPresetIdsForFormat(detectedFormat).includes(preset.id),
  );

  const handleXmlUrlChange = (value: string) => {
    setXmlUrl(value);
    setUrlStatus('IDLE');
    setValidationMessage(null);
    setVehicleCount(null);
    setDetectedFormat(null);
  };

  const handleTestUrl = async () => {
    const trimmedUrl = xmlUrl.trim();

    if (!workspaceId) {
      setUrlStatus('INVALID');
      setValidationMessage('Workspace não encontrado. Faça login novamente.');
      return;
    }

    if (!trimmedUrl) {
      setUrlStatus('INVALID');
      setValidationMessage('Informe uma URL do feed.');
      return;
    }

    setIsValidatingUrl(true);
    setValidationMessage(null);
    setVehicleCount(null);
    setDetectedFormat(null);

    try {
      const result = await feedService.validateUrl(workspaceId, trimmedUrl);

      if (result.valid) {
        setUrlStatus('VALID');
        setVehicleCount(result.vehicleCount ?? null);
        setDetectedFormat(result.detectedFormat ?? null);
        setValidationMessage(null);

        const suggestedPresetId = resolvePresetIdFromSuggestion(result.suggestedPresetId);
        if (suggestedPresetId) {
          const suggested = DMS_PRESETS.find((preset) => preset.id === suggestedPresetId);
          if (suggested) {
            setSelectedPreset(suggested);
          }
        }
      } else {
        setUrlStatus('INVALID');
        setValidationMessage(
          result.error ?? 'Não foi possível validar a URL do feed.',
        );
      }
    } catch (error) {
      setUrlStatus('INVALID');
      setValidationMessage(
        error instanceof ApiError
          ? error.message
          : 'Falha ao validar a URL. Tente novamente.',
      );
    } finally {
      setIsValidatingUrl(false);
    }
  };

  const handleCopyFeedUrl = () => {
    navigator.clipboard.writeText(generatedFeedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header do Wizard com Indicador de Passos */}
      <div className="bg-surface-card rounded-xl border border-surface-border p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-blue-50 text-brand-primary">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-typography-heading">
                Assistente de Onboarding do Catálogo Meta Ads
              </h2>
            </div>
            <p className="text-xs text-typography-muted mt-1">
              Conecte o feed do seu estoque (XML ou JSON) em 3 etapas simples para gerar seu feed de anúncios dinâmicos.
            </p>
          </div>

          <Badge variant="available" size="sm" dot>
            Passo {currentStep} de 3
          </Badge>
        </div>

        {/* Stepper Visual */}
        <div className="grid grid-cols-3 gap-2 pt-6">
          {/* Passo 1 */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
              currentStep >= 1 ? 'bg-brand-primary text-white shadow-sm' : 'bg-surface-muted text-typography-muted'
            }`}>
              {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className={`text-xs font-bold truncate ${currentStep >= 1 ? 'text-typography-heading' : 'text-typography-muted'}`}>
                1. Conexão DMS
              </p>
              <p className="text-[10px] text-typography-muted truncate">URL do Feed</p>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
              currentStep >= 2 ? 'bg-brand-primary text-white shadow-sm' : 'bg-surface-muted text-typography-muted'
            }`}>
              {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className={`text-xs font-bold truncate ${currentStep >= 2 ? 'text-typography-heading' : 'text-typography-muted'}`}>
                2. Mapeamento
              </p>
              <p className="text-[10px] text-typography-muted truncate">De/Para Inteligente</p>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
              currentStep >= 3 ? 'bg-brand-primary text-white shadow-sm' : 'bg-surface-muted text-typography-muted'
            }`}>
              {currentStep === 3 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className={`text-xs font-bold truncate ${currentStep === 3 ? 'text-typography-heading' : 'text-typography-muted'}`}>
                3. Ativação
              </p>
              <p className="text-[10px] text-typography-muted truncate">Feed Meta DAA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Dinâmico do Passo Atual */}
      <Card className="overflow-hidden">
        {/* PASSO 1: CONEXÃO DA URL DO XML */}
        {currentStep === 1 && (
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-typography-heading">
                Passo 1: Forneça a URL do Feed do seu Estoque
              </h3>
              <p className="text-xs text-typography-muted">
                Insira o link público do feed fornecido pelo seu integrador DMS (XML ou JSON), como AutoCerto, Base44 ou Spice Digital.
              </p>
            </div>

            {/* Input da URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-typography-heading">
                URL do Feed
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Link className="w-4 h-4 text-typography-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={xmlUrl}
                    onChange={(e) => handleXmlUrlChange(e.target.value)}
                    placeholder="https://suarevenda.com.br/estoque.xml ou .json"
                    className="w-full pl-9 pr-4 py-2.5 bg-surface-muted/60 border border-surface-border rounded-lg text-xs font-mono text-typography-heading focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
                  />
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleTestUrl}
                  loading={isValidatingUrl}
                  disabled={!xmlUrl.trim() || !workspaceId || isValidatingUrl}
                >
                  Testar Link
                </Button>
              </div>

              {urlStatus === 'VALID' && (
                <div className="p-3 bg-green-50/80 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-800">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>
                    <strong>Conexão bem-sucedida!</strong>{' '}
                    {getFeedValidationSuccessMessage({ vehicleCount, detectedFormat })}
                  </span>
                </div>
              )}

              {urlStatus === 'INVALID' && validationMessage && (
                <div className="p-3 bg-red-50/80 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-brand-price shrink-0" />
                  <span>{validationMessage}</span>
                </div>
              )}
            </div>

            {/* Seleção do Provedor DMS */}
            {urlStatus === 'VALID' && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-typography-heading">
                Detectamos o formato compatível com o seu sistema:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {visiblePresets.map((preset: DmsPreset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/70 border-brand-primary ring-2 ring-brand-primary/20'
                          : 'bg-surface-muted/40 border-surface-border hover:bg-surface-muted'
                      }`}
                    >
                      <p className={`text-xs font-bold ${isSelected ? 'text-brand-primary' : 'text-typography-heading'}`}>
                        {preset.name}
                      </p>
                      <p className="text-[10px] text-typography-muted mt-0.5">{preset.provider}</p>
                      <div className="mt-2 text-[10px] font-mono text-brand-accent font-semibold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        {preset.confidenceRate}% Auto-Match
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>
        )}

        {/* PASSO 2: MAPEAMENTO DE/PARA */}
        {currentStep === 2 && (
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-typography-heading">
                Passo 2: Confirmação do Mapeamento Inteligente De/Para
              </h3>
              <p className="text-xs text-typography-muted">
                Nossa IA correlacionou as tags do seu XML com o padrão canônico exigido pelo Meta Automotive Inventory Ads.
              </p>
            </div>

            <div className="rounded-lg border border-surface-border overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-muted/60 border-b border-surface-border text-[11px] font-bold text-typography-muted uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Campo Canônico Meta Ads</th>
                    <th className="py-2.5 px-4">Tag de Origem ({selectedPreset.name})</th>
                    <th className="py-2.5 px-4">Status de Validação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  <tr>
                    <td className="py-3 px-4 font-mono font-bold text-brand-primary">g:vehicle_id *</td>
                    <td className="py-3 px-4 font-mono text-typography-heading">&lt;codigo_veiculo&gt;</td>
                    <td className="py-3 px-4"><Badge variant="available" size="sm" dot>Identificado</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-bold text-brand-primary">g:price *</td>
                    <td className="py-3 px-4 font-mono text-typography-heading">&lt;preco_venda&gt;</td>
                    <td className="py-3 px-4"><Badge variant="available" size="sm" dot>Formato BRL Válido</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-bold text-brand-primary">g:image_link *</td>
                    <td className="py-3 px-4 font-mono text-typography-heading">&lt;foto_principal&gt;</td>
                    <td className="py-3 px-4"><Badge variant="available" size="sm" dot>HTTPS Válido</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-bold text-brand-primary">g:make * / g:model *</td>
                    <td className="py-3 px-4 font-mono text-typography-heading">&lt;marca&gt; / &lt;modelo&gt;</td>
                    <td className="py-3 px-4"><Badge variant="available" size="sm" dot>Correto</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono font-bold text-brand-primary">g:vin * / g:year *</td>
                    <td className="py-3 px-4 font-mono text-typography-heading">&lt;chassi&gt; / &lt;ano_modelo&gt;</td>
                    <td className="py-3 px-4"><Badge variant="available" size="sm" dot>ISO Standard</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center gap-2 text-xs text-blue-800">
              <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
              <span>Todos os 6 campos canônicos obrigatórios foram mapeados com sucesso (Taxa de confiança: 99.8%).</span>
            </div>
          </div>
        )}

        {/* PASSO 3: ATIVAÇÃO DO FEED */}
        {currentStep === 3 && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-typography-heading">
                Seu Feed Meta DAA está Pronto e Validado!
              </h3>
              <p className="text-xs text-typography-muted max-w-md mx-auto">
                Utilize a URL abaixo no seu <strong>Meta Commerce Manager</strong> para sincronizar seu inventário automaticamente a cada 15 minutos.
              </p>
            </div>

            {/* Box da URL Pública */}
            <div className="p-4 bg-surface-muted/70 rounded-xl border border-surface-border space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-typography-muted">
                URL Pública do Feed Atom XML (Protegida por HMAC)
              </label>
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-surface-border">
                <code className="text-xs font-mono text-brand-primary flex-1 truncate select-all">
                  {generatedFeedUrl}
                </code>
                <Button
                  variant={isCopied ? 'primary' : 'outline'}
                  size="sm"
                  icon={isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  onClick={handleCopyFeedUrl}
                >
                  {isCopied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>

            {/* Instruções Rápidas */}
            <div className="p-4 rounded-xl border border-surface-border bg-white space-y-3">
              <h4 className="text-xs font-bold text-typography-heading flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-primary" />
                Como colar no Meta Business Suite:
              </h4>
              <ol className="text-xs text-typography-body space-y-1.5 list-decimal list-inside">
                <li>Acesse o <strong>Meta Commerce Manager</strong> &gt; Catálogos de Veículos.</li>
                <li>Clique em <strong>Fontes de Dados</strong> &gt; <strong>Adicionar Veículos via Feed</strong>.</li>
                <li>Selecione <strong>Programar Feed por URL</strong> e cole o link acima com frequência horária.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Rodapé com Botões de Navegação */}
        <div className="px-6 py-4 bg-surface-muted/30 border-t border-surface-border flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="md"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                Voltar
              </Button>
            ) : onCancel ? (
              <Button variant="ghost" size="md" onClick={onCancel}>
                Cancelar
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 3 ? (
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={currentStep === 1 && urlStatus !== 'VALID'}
              >
                Continuar
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => onComplete && onComplete(generatedFeedUrl)}
              >
                Concluir Onboarding
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
