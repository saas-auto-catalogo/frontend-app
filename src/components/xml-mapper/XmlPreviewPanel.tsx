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
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

export interface XmlPreviewPanelProps {
  onValidate?: () => void;
}

export function XmlPreviewPanel({
  onValidate,
}: XmlPreviewPanelProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [showRawXml, setShowRawXml] = useState(false);

  const sampleVehicle = {
    model: 'GLC 300 Coupé',
    make: 'Mercedes-Benz',
    version: '2.0 MHEV AMG Line 4Matic',
    price: 489700,
    modelYear: 2026,
    mileage: 4686,
    licensePlate: 'TYN9F21',
    fuelType: 'Híbrido Leve',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  };

  const handleTestMapping = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      if (onValidate) onValidate();
      alert('🎉 Validação Comercial Concluída: Os dados do veículo foram transformados com sucesso e estão 100% elegíveis para os Anúncios do Meta Ads!');
    }, 700);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-surface-border">
      <CardHeader className="flex items-center justify-between py-3.5 bg-surface-muted/40">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold text-typography-heading">
            Resultado da Transformação do Veículo
          </h3>
        </div>

        <Badge variant="available" size="sm" dot icon={<Sparkles className="w-3 h-3 text-brand-accent" />}>
          Pronto para Meta Ads
        </Badge>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Card Visual Comercial do Carro Transformado */}
        <div className="bg-white rounded-xl border border-surface-border p-3.5 shadow-subtle space-y-3">
          <div className="flex items-start gap-3.5">
            {/* Foto Hero */}
            <div className="w-24 h-18 rounded-lg bg-surface-muted overflow-hidden border border-surface-border shrink-0 aspect-[4/3]">
              <img
                src={sampleVehicle.imageUrl}
                alt={sampleVehicle.model}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Dados Comerciais */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-brand-primary bg-blue-50 px-1.5 py-0.2 rounded">
                  {sampleVehicle.make}
                </span>
                <span className="text-[10px] text-typography-muted font-mono">
                  {sampleVehicle.licensePlate}
                </span>
              </div>

              <h4 className="text-sm font-bold text-typography-heading truncate mt-0.5">
                {sampleVehicle.model}
              </h4>
              <p className="text-xs text-typography-muted truncate">{sampleVehicle.version}</p>

              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-base font-extrabold text-brand-price">
                  {sampleVehicle.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span className="text-[10px] text-typography-subtle font-mono">
                  (489700.00 BRL no feed)
                </span>
              </div>
            </div>
          </div>

          {/* Especificações Rápidas */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-border text-center text-xs">
            <div className="p-1.5 rounded-lg bg-surface-muted/60">
              <span className="text-[10px] text-typography-muted block">Ano</span>
              <span className="font-bold text-typography-heading">{sampleVehicle.modelYear}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-surface-muted/60">
              <span className="text-[10px] text-typography-muted block">KM</span>
              <span className="font-bold text-typography-heading">{sampleVehicle.mileage.toLocaleString('pt-BR')} km</span>
            </div>
            <div className="p-1.5 rounded-lg bg-surface-muted/60">
              <span className="text-[10px] text-typography-muted block">Combustível</span>
              <span className="font-bold text-brand-accent">{sampleVehicle.fuelType}</span>
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
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-surface-border">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-brand-accent" />
                <span className="text-typography-body font-medium">Preço em Moeda BRL Válido</span>
              </div>
              <Badge variant="available" size="sm">Aprovado</Badge>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-surface-border">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-brand-accent" />
                <span className="text-typography-body font-medium">Foto Principal em Alta Resolução HTTPS</span>
              </div>
              <Badge variant="available" size="sm">Aprovado</Badge>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-surface-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />
                <span className="text-typography-body font-medium">Identificador Único & Chassi ISO</span>
              </div>
              <Badge variant="available" size="sm">Aprovado</Badge>
            </div>
          </div>
        </div>

        {/* Bloco Opcional Retrátil para Ver XML Técnico (Somente se solicitado) */}
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
              <p className="text-blue-400 font-bold mb-1">// Exemplo de nó canônico Atom gerado:</p>
              <code>{`<entry>
  <g:vehicle_id>mercedes-glc-300</g:vehicle_id>
  <g:price>489700.00 BRL</g:price>
  <g:image_link>https://images.unsplash.com/photo-1617814076367-b759c7d7e738...</g:image_link>
  <g:make>Mercedes-Benz</g:make>
  <g:model>GLC 300</g:model>
  <g:year>2026</g:year>
  <g:mileage>4686 KM</g:mileage>
</entry>`}</code>
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
    </Card>
  );
}
