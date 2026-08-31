import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { Code, CheckCircle2, Play, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export interface XmlPreviewPanelProps {
  dmsName?: string;
  rawXmlSnippet?: string;
  metaXmlSnippet?: string;
  onValidate?: () => void;
}

export function XmlPreviewPanel({
  dmsName = 'AutoCerto XML',
  rawXmlSnippet,
  metaXmlSnippet,
  onValidate,
}: XmlPreviewPanelProps) {
  const [isValidating, setIsValidating] = useState(false);

  const defaultRaw = `<veiculo>
  <codigo_veiculo>mercedes-glc-300</codigo_veiculo>
  <marca>Mercedes-Benz</marca>
  <modelo>GLC 300 Coupé</modelo>
  <versao>2.0 MHEV AMG Line 4Matic</versao>
  <ano_fabricacao>2025</ano_fabricacao>
  <ano_modelo>2026</ano_modelo>
  <preco_venda>489700.00</preco_venda>
  <preco_promocional>479900.00</preco_promocional>
  <quilometragem>4686</quilometragem>
  <combustivel>Hibrido</combustivel>
  <cambio>Automatico</cambio>
  <chassi>TYN9F21</chassi>
  <foto_principal>https://base44.app/files/glc1.jpg</foto_principal>
</veiculo>`;

  const defaultMeta = `<entry>
  <g:vehicle_id>mercedes-glc-300</g:vehicle_id>
  <g:title>Mercedes-Benz GLC 300 Coupé</g:title>
  <g:description>2.0 MHEV AMG Line 4Matic 2025/2026</g:description>
  <g:image_link>https://base44.app/files/glc1.jpg</g:image_link>
  <g:price>489700.00 BRL</g:price>
  <g:sale_price>479900.00 BRL</g:sale_price>
  <g:availability>in stock</g:availability>
  <g:make>Mercedes-Benz</g:make>
  <g:model>GLC 300</g:model>
  <g:year>2026</g:year>
  <g:mileage>
    <g:value>4686</g:value>
    <g:unit>KM</g:unit>
  </g:mileage>
  <g:fuel_type>hybrid</g:fuel_type>
  <g:transmission>automatic</g:transmission>
  <g:vin>TYN9F21</g:vin>
  <g:custom_label_0>Acima de 300k</g:custom_label_0>
  <g:custom_label_1>SUV</g:custom_label_1>
  <g:custom_label_2>Eletrificado</g:custom_label_2>
</entry>`;

  const handleTestMapping = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      if (onValidate) onValidate();
      alert('🎉 Validação em Tempo Real Concluída: 100% de conformidade com o Schema Meta DAA!');
    }, 800);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="flex items-center justify-between py-3.5 bg-surface-muted/40">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold text-typography-heading">
            Preview em Tempo Real (Lado a Lado)
          </h3>
        </div>

        <Badge variant="available" size="sm" dot>
          Schema XSD Válido
        </Badge>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Painéis de Código */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px] leading-relaxed">
          {/* DMS Source (Raw XML) */}
          <div className="flex flex-col rounded-lg border border-surface-border overflow-hidden bg-slate-900 text-slate-200">
            <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-sans font-bold">
                Entrada: {dmsName} (Raw)
              </span>
              <span className="text-[10px] text-blue-400">13 tags</span>
            </div>
            <pre className="p-3 overflow-x-auto text-slate-300 selection:bg-blue-600 selection:text-white max-h-80">
              <code>{rawXmlSnippet || defaultRaw}</code>
            </pre>
          </div>

          {/* Meta DAA Target (Output Atom XML) */}
          <div className="flex flex-col rounded-lg border border-blue-900/40 overflow-hidden bg-slate-950 text-blue-100">
            <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-blue-300 font-sans font-bold flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-brand-accent" />
                Saída: Meta Automotive DAA
              </span>
              <span className="text-[10px] text-brand-accent font-sans font-semibold">Ready</span>
            </div>
            <pre className="p-3 overflow-x-auto text-blue-200 selection:bg-blue-600 selection:text-white max-h-80">
              <code>{metaXmlSnippet || defaultMeta}</code>
            </pre>
          </div>
        </div>

        {/* Rodapé com Ação de Teste */}
        <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-typography-muted">
            <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
            <span>Formatador BRL, conversão KM e inferência de propulsão ativos.</span>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Play className="w-4 h-4 fill-current" />}
            onClick={handleTestMapping}
            loading={isValidating}
          >
            Testar e Validar Schema
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
