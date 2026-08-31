import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { AlertCircle, AlertTriangle, ArrowUpRight, ImageOff, DollarSign, FileWarning } from 'lucide-react';

export interface PendingIssue {
  id: string;
  vehicleId: string;
  make: string;
  model: string;
  version: string;
  licensePlate: string;
  issueType: 'MISSING_IMAGES' | 'INVALID_PRICE' | 'INVALID_VIN' | 'INCOMPLETE_SPECS';
  message: string;
  severity: 'ERROR' | 'WARNING';
  detectedAt: string;
  heroImageUrl?: string;
}

const SAMPLE_ISSUES: PendingIssue[] = [
  {
    id: 'iss-001',
    vehicleId: 'bmw-x1-2024',
    make: 'BMW',
    model: 'X1 sDrive20i',
    version: '2.0 TwinPower GP Tech',
    licensePlate: 'BMW9X10',
    issueType: 'MISSING_IMAGES',
    message: 'Nenhuma imagem principal cadastrada no feed do DMS.',
    severity: 'ERROR',
    detectedAt: 'Há 12 minutos',
    heroImageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'iss-002',
    vehicleId: 'fiat-pulse-2024',
    make: 'FIAT',
    model: 'Pulse Audace',
    version: 'Turbo 200 Flex Aut.',
    licensePlate: 'PUL7722',
    issueType: 'INVALID_PRICE',
    message: 'Preço cadastrado como R$ 0,00 no sistema DMS parceiro.',
    severity: 'ERROR',
    detectedAt: 'Há 25 minutos'
  },
  {
    id: 'iss-003',
    vehicleId: 'jeep-compass-2023',
    make: 'JEEP',
    model: 'Compass Limited',
    version: 'T270 1.3 Turbo Flex',
    licensePlate: 'JEP4A44',
    issueType: 'INVALID_VIN',
    message: 'Chassi / VIN não informado ou fora do padrão ISO 3779.',
    severity: 'WARNING',
    detectedAt: 'Há 1 hora',
    heroImageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'iss-004',
    vehicleId: 'volvo-xc60-2022',
    make: 'VOLVO',
    model: 'XC60 Recharge',
    version: '2.0 T8 Inscription Híbrido',
    licensePlate: 'VOL8800',
    issueType: 'INCOMPLETE_SPECS',
    message: 'Combustível e tipo de transmissão não mapeados.',
    severity: 'WARNING',
    detectedAt: 'Há 2 horas',
    heroImageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=200&q=80'
  }
];

export function PendingIssuesTable() {
  const getIssueIcon = (type: PendingIssue['issueType']) => {
    switch (type) {
      case 'MISSING_IMAGES':
        return <ImageOff className="w-4 h-4 text-brand-price" />;
      case 'INVALID_PRICE':
        return <DollarSign className="w-4 h-4 text-brand-price" />;
      case 'INVALID_VIN':
      case 'INCOMPLETE_SPECS':
        return <FileWarning className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-brand-primary" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex items-center justify-between py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-typography-heading">
              Diagnóstico de Pendências de Estoque
            </h3>
            <span className="bg-brand-priceLight text-brand-price font-bold text-xs px-2 py-0.5 rounded-full">
              4 Veículos Requerem Atenção
            </span>
          </div>
          <p className="text-xs text-typography-muted mt-0.5">
            Veículos com dados incompletos são temporariamente desativados do Feed Meta DAA para proteger o orçamento de anúncios.
          </p>
        </div>

        <Button variant="ghost" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
          Exportar Relatório
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted/60 border-b border-surface-border text-[11px] font-bold text-typography-muted uppercase tracking-wider">
                <th className="py-3 px-4">Veículo</th>
                <th className="py-3 px-4">Placa / ID</th>
                <th className="py-3 px-4">Motivo da Pendência</th>
                <th className="py-3 px-4">Severidade</th>
                <th className="py-3 px-4">Detectado</th>
                <th className="py-3 px-4 text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs">
              {SAMPLE_ISSUES.map((issue) => (
                <tr key={issue.id} className="hover:bg-surface-muted/30 transition-colors">
                  {/* Veículo com Miniatura */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-surface-muted border border-surface-border overflow-hidden shrink-0 flex items-center justify-center">
                        {issue.heroImageUrl ? (
                          <img src={issue.heroImageUrl} alt={issue.model} className="w-full h-full object-cover" />
                        ) : (
                          <ImageOff className="w-4 h-4 text-typography-subtle" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-typography-heading">{issue.make} {issue.model}</p>
                        <p className="text-[11px] text-typography-muted line-clamp-1">{issue.version}</p>
                      </div>
                    </div>
                  </td>

                  {/* Placa em Fonte Mono */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-semibold text-typography-body bg-surface-muted px-2 py-0.5 rounded border border-surface-border">
                      {issue.licensePlate}
                    </span>
                  </td>

                  {/* Descrição do Problema */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2 max-w-sm">
                      <span className="mt-0.5 shrink-0">{getIssueIcon(issue.issueType)}</span>
                      <span className="text-typography-body leading-relaxed">{issue.message}</span>
                    </div>
                  </td>

                  {/* Badge de Severidade */}
                  <td className="py-3.5 px-4">
                    {issue.severity === 'ERROR' ? (
                      <Badge variant="error" size="sm" icon={<AlertCircle className="w-3 h-3 text-brand-price" />}>
                        Bloqueante
                      </Badge>
                    ) : (
                      <Badge variant="syncing" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-600" />}>
                        Alerta
                      </Badge>
                    )}
                  </td>

                  {/* Horário de Detecção */}
                  <td className="py-3.5 px-4 text-typography-muted whitespace-nowrap">
                    {issue.detectedAt}
                  </td>

                  {/* Ação de Correção */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Abrindo formulário de correção para o veículo ${issue.vehicleId}`)}
                    >
                      Corrigir no DMS
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
