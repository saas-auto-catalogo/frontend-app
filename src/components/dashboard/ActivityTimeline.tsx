import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { CheckCircle2, ArrowUpRight, RefreshCw, Tag, Check } from 'lucide-react';

export function ActivityTimeline() {
  const events = [
    {
      id: 'evt-1',
      title: 'Sincronização Meta DAA Concluída',
      description: '138 veículos elegíveis exportados no formato Atom XML com GZIP.',
      time: 'Há 4 minutos',
      icon: <Check className="w-3.5 h-3.5 text-brand-accent" />,
      badgeBg: 'bg-brand-accentLight border-brand-accent/30',
    },
    {
      id: 'evt-2',
      title: 'Ingestão de Feed DMS AutoCerto',
      description: 'Download e streaming de 142 veículos em 2.4s com consumo < 64MB RAM.',
      time: 'Há 12 minutos',
      icon: <RefreshCw className="w-3.5 h-3.5 text-brand-primary" />,
      badgeBg: 'bg-brand-primaryLight border-brand-primary/30',
    },
    {
      id: 'evt-3',
      title: 'Alteração de Preço Promocional',
      description: 'Mercedes GLC 300 AMG Line atualizada de R$ 489.700 para R$ 479.900.',
      time: 'Há 45 minutos',
      icon: <Tag className="w-3.5 h-3.5 text-brand-price" />,
      badgeBg: 'bg-brand-priceLight border-brand-price/30',
    },
    {
      id: 'evt-4',
      title: 'Veículo Baixado como Vendido',
      description: 'BMW 320i M Sport (Placa: BMW3200) removida do estoque ativo.',
      time: 'Há 2 horas',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />,
      badgeBg: 'bg-slate-100 border-slate-300',
    },
  ];

  return (
    <Card>
      <CardHeader className="flex items-center justify-between py-4">
        <div>
          <h3 className="text-sm font-bold text-typography-heading">
            Atividades Recentes do Estoque
          </h3>
          <p className="text-xs text-typography-muted">
            Auditoria em tempo real de diffs e sincronizações
          </p>
        </div>
        <button className="text-xs font-semibold text-brand-primary hover:text-brand-primaryHover flex items-center gap-1">
          Ver Log Completo
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-border">
          {events.map((evt) => (
            <div key={evt.id} className="relative group">
              <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center bg-white shadow-sm ${evt.badgeBg}`}>
                {evt.icon}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-typography-heading">{evt.title}</p>
                  <span className="text-[10px] text-typography-subtle font-mono">{evt.time}</span>
                </div>
                <p className="text-xs text-typography-body mt-0.5 leading-relaxed">{evt.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
