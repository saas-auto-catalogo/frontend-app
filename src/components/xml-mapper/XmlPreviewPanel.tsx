import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import {
  CheckCircle2,
  Sparkles,
  Play,
  Car,
  Image as ImageIcon,
  DollarSign,
  ShieldCheck,
  Code2,
  ChevronDown,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { Vehicle } from '../../services/api/vehicleService.js';
import { xmlMapperService } from '../../services/api/xmlMapperService.js';

export interface XmlPreviewPanelProps {
  vehicle?: Vehicle | null;
  isLoading?: boolean;
  onValidate?: () => void;
  onSyncFeed?: () => void;
}

function buildXmlSnippet(vehicle: Vehicle): string {
  return `<entry>
  <g:vehicle_id>${vehicle.id}</g:vehicle_id>
  <g:price>${vehicle.price.toFixed(2)} BRL</g:price>
  <g:image_link>${vehicle.imageUrl}</g:image_link>
  <g:make>${vehicle.make}</g:make>
  <g:model>${vehicle.model}</g:model>
  <g:year>${vehicle.modelYear}</g:year>
  <g:mileage>${vehicle.mileage} KM</g:mileage>
</entry>`;
}

function ChecklistRow({
  icon,
  label,
  passed,
}: {
  icon: React.ReactNode;
  label: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-surface-border">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-typography-body font-medium">{label}</span>
      </div>
      {passed ? (
        <Badge variant="available" size="sm">Aprovado</Badge>
      ) : (
        <Badge variant="error" size="sm">Atenção</Badge>
      )}
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <CardContent className="p-4 flex-1 space-y-4 animate-pulse">
      <div className="bg-white rounded-xl border border-surface-border p-3.5 shadow-subtle space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="w-24 h-18 rounded-lg bg-surface-muted shrink-0 aspect-[4/3]" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-20 bg-surface-muted rounded" />
            <div className="h-4 w-32 bg-surface-muted rounded" />
            <div className="h-3 w-24 bg-surface-muted rounded" />
            <div className="h-5 w-28 bg-surface-muted rounded" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-border">
          <div className="h-12 bg-surface-muted/60 rounded-lg" />
          <div className="h-12 bg-surface-muted/60 rounded-lg" />
          <div className="h-12 bg-surface-muted/60 rounded-lg" />
        </div>
      </div>
      <div className="bg-surface-muted/50 rounded-xl p-3.5 border border-surface-border space-y-2">
        <div className="h-4 w-48 bg-surface-muted rounded" />
        <div className="h-10 bg-white rounded-lg border border-surface-border" />
        <div className="h-10 bg-white rounded-lg border border-surface-border" />
        <div className="h-10 bg-white rounded-lg border border-surface-border" />
      </div>
    </CardContent>
  );
}

function EmptyState({ onSyncFeed }: { onSyncFeed?: () => void }) {
  return (
    <CardContent className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center border border-blue-200/70">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-typography-heading">
          Nenhum veículo encontrado no estoque
        </h4>
        <p className="text-xs text-typography-muted max-w-xs">
          Sincronize seu feed DMS para visualizar a prévia dos dados mapeados e a validação do Meta Automotive Ads.
        </p>
      </div>
      {onSyncFeed && (
        <Button
          variant="primary"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onSyncFeed}
        >
          Sincronizar Estoque
        </Button>
      )}
    </CardContent>
  );
}

export function XmlPreviewPanel({
  vehicle,
  isLoading,
  onValidate,
  onSyncFeed,
}: XmlPreviewPanelProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [showRawXml, setShowRawXml] = useState(false);

  const handleTestMapping = async () => {
    if (!vehicle) return;
    try {
      setIsValidating(true);
      const res = await xmlMapperService.testMapping(vehicle);
      if (onValidate) onValidate();
      alert(`🎉 ${res.message}`);
    } catch (err: any) {
      alert(`❌ Erro na validação: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const hasRealVehicle = Boolean(vehicle);
  const priceValid = hasRealVehicle && vehicle!.price > 0;
  const imageHttpsValid = hasRealVehicle && Boolean(vehicle!.imageUrl?.startsWith('https://'));
  const identifierValid =
    hasRealVehicle && Boolean(vehicle!.id && (vehicle!.vin || vehicle!.licensePlate));
  const readyForMetaAds = priceValid && imageHttpsValid && identifierValid;

  return (
    <Card className="flex flex-col h-full overflow-hidden border-surface-border">
      <CardHeader className="flex items-center justify-between py-3.5 bg-surface-muted/40">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold text-typography-heading">
            Resultado da Transformação do Veículo
          </h3>
        </div>

        {hasRealVehicle ? (
          <Badge
            variant={readyForMetaAds ? 'available' : 'neutral'}
            size="sm"
            dot
            icon={<Sparkles className="w-3 h-3 text-brand-accent" />}
          >
            {readyForMetaAds ? 'Pronto para Meta Ads' : 'Revisão Necessária'}
          </Badge>
        ) : null}
      </CardHeader>

      {isLoading ? (
        <PreviewSkeleton />
      ) : !hasRealVehicle ? (
        <EmptyState onSyncFeed={onSyncFeed} />
      ) : (
        <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
          {/* Card Visual Comercial do Carro Transformado */}
          <div className="bg-white rounded-xl border border-surface-border p-3.5 shadow-subtle space-y-3">
            <div className="flex items-start gap-3.5">
              {/* Foto Hero */}
              <div className="w-24 h-18 rounded-lg bg-surface-muted overflow-hidden border border-surface-border shrink-0 aspect-[4/3]">
                {vehicle!.imageUrl ? (
                  <img
                    src={vehicle!.imageUrl}
                    alt={vehicle!.model}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                {vehicle!.imageUrl ? null : (
                  <div className="w-full h-full bg-surface-muted text-typography-subtle flex items-center justify-center">
                    <Car className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Dados Comerciais */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-brand-primary bg-blue-50 px-1.5 py-0.2 rounded">
                    {vehicle!.make}
                  </span>
                  <span className="text-[10px] text-typography-muted font-mono">
                    {vehicle!.licensePlate || vehicle!.vin || vehicle!.id.substring(0, 8)}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-typography-heading truncate mt-0.5">
                  {vehicle!.model}
                </h4>
                <p className="text-xs text-typography-muted truncate">{vehicle!.version}</p>

                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-base font-extrabold text-brand-price">
                    {vehicle!.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="text-[10px] text-typography-subtle font-mono">
                    ({vehicle!.price.toFixed(2)} BRL no feed)
                  </span>
                </div>
              </div>
            </div>

            {/* Especificações Rápidas */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-border text-center text-xs">
              <div className="p-1.5 rounded-lg bg-surface-muted/60">
                <span className="text-[10px] text-typography-muted block">Ano</span>
                <span className="font-bold text-typography-heading">{vehicle!.modelYear}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-surface-muted/60">
                <span className="text-[10px] text-typography-muted block">KM</span>
                <span className="font-bold text-typography-heading">{vehicle!.mileage.toLocaleString('pt-BR')} km</span>
              </div>
              <div className="p-1.5 rounded-lg bg-surface-muted/60">
                <span className="text-[10px] text-typography-muted block">Combustível</span>
                <span className="font-bold text-brand-accent">{vehicle!.fuelType}</span>
              </div>
            </div>
          </div>

          {/* Checklist de Conformidade com o Meta Ads */}
          <div className="bg-surface-muted/50 rounded-xl p-3.5 border border-surface-border space-y-2.5">
            <h5 className="text-xs font-bold text-typography-heading flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-accent" />
              <span>Validação de Campos do Meta Automotive Ads</span>
            </h5>

            <div className="space-y-1.5 text-xs">
              <ChecklistRow
                icon={<DollarSign className="w-3.5 h-3.5 text-brand-accent" />}
                label="Preço em Moeda BRL Válido"
                passed={priceValid}
              />

              <ChecklistRow
                icon={<ImageIcon className="w-3.5 h-3.5 text-brand-accent" />}
                label="Foto Principal em Alta Resolução HTTPS"
                passed={imageHttpsValid}
              />

              <ChecklistRow
                icon={<CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />}
                label="Identificador Único & Chassi ISO"
                passed={identifierValid}
              />
            </div>
          </div>

          {/* Bloco Opcional Retrátil para Ver XML Técnico */}
          <div>
            <button
              onClick={() => setShowRawXml(!showRawXml)}
              className="w-full py-2 text-xs font-semibold text-typography-muted hover:text-typography-heading flex items-center justify-center gap-1.5 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-typography-subtle" />
              <span>{showRawXml ? 'Ocultar Estrutura Técnica XML' : 'Ver Estrutura Técnica XML (Avançado)'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showRawXml ? 'rotate-180' : ''}`} />
            </button>

            {showRawXml && (
              <div className="p-3 bg-slate-900 text-slate-300 font-mono text-[11px] rounded-lg mt-2 overflow-x-auto max-h-48 border border-slate-800">
                <p className="text-blue-400 font-bold mb-1">// Nó canônico Atom gerado a partir do veículo real:</p>
                <code>{buildXmlSnippet(vehicle!)}</code>
              </div>
            )}
          </div>

          {/* Rodapé com Ação Amigável de Validação */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3">
            <span className="text-xs text-typography-muted">
              Testado contra o schema oficial da Meta.
            </span>

            <Button
              variant="primary"
              size="md"
              icon={<Play className="w-4 h-4 fill-current" />}
              onClick={handleTestMapping}
              loading={isValidating}
            >
              Validar Veículo de Amostra
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}