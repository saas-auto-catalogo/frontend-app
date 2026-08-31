import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { CheckCircle2, RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export interface MetaConnectionCardProps {
  catalogName?: string;
  catalogId?: string;
  eligibleVehiclesCount?: number;
  totalVehiclesCount?: number;
  feedUrl?: string;
  lastExportAt?: string;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
}

export function MetaConnectionCard({
  catalogName = 'Auto Elite Motors - Inventário Meta Automotive Ads',
  catalogId = '904829104820194',
  eligibleVehiclesCount = 138,
  totalVehiclesCount = 142,
  feedUrl = 'https://api.autocatalogo.com.br/api/v1/feeds/a8f9c0e2b1d3/meta-vehicles.xml',
  lastExportAt = 'Hoje às 19:48 (há 4 minutos)',
  onTriggerSync,
  isSyncing = false,
}: MetaConnectionCardProps) {
  const [copied, setCopied] = useState(false);
  const healthPercentage = Math.round((eligibleVehiclesCount / totalVehiclesCount) * 100);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden border-slate-200">
      <CardHeader className="bg-gradient-to-r from-blue-50/70 via-white to-white flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
            f
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-typography-heading">
                Meta Commerce Manager & Automotive Ads
              </h3>
              <Badge variant="available" size="sm" dot>
                Conectado & Ativo
              </Badge>
            </div>
            <p className="text-xs text-typography-muted">
              Sincronização programada direta com a Meta Graph API v21.0
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
          onClick={onTriggerSync}
          loading={isSyncing}
        >
          Disparar Sync Meta
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barra de Saúde do Catálogo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-surface-muted/60 border border-surface-border">
          <div>
            <span className="text-[11px] font-semibold text-typography-muted uppercase tracking-wider">
              Catálogo Meta
            </span>
            <p className="text-sm font-bold text-typography-heading mt-0.5 truncate">{catalogName}</p>
            <p className="text-[11px] font-mono text-typography-subtle">ID: {catalogId}</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-typography-muted uppercase tracking-wider">
                Saúde do Catálogo
              </span>
              <span className="text-xs font-bold text-brand-accent">{healthPercentage}% Saudável</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
              <div className="bg-brand-accent h-full rounded-full transition-all duration-500" style={{ width: `${healthPercentage}%` }} />
            </div>
            <p className="text-[11px] text-typography-muted mt-1">
              <strong>{eligibleVehiclesCount}</strong> de <strong>{totalVehiclesCount}</strong> veículos em conformidade
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-typography-muted uppercase tracking-wider">
              Última Exportação
            </span>
            <p className="text-xs font-medium text-typography-heading mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />
              {lastExportAt}
            </p>
            <p className="text-[11px] text-typography-subtle">GZIP comprimido (2.6ms)</p>
          </div>
        </div>

        {/* URL do Feed Público com Token Seguro */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-900 rounded-lg text-white">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-blue-300 font-semibold uppercase">Feed XML Atom DAA</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Cache Redis 15m</span>
            </div>
            <p className="text-xs font-mono text-slate-300 truncate mt-0.5">{feedUrl}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-brand-accent" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
