import { Search, Bell, ExternalLink, RefreshCw, Plus, Store } from 'lucide-react';
import { Button } from '../ui/Button.js';

export interface HeaderProps {
  dealershipName?: string;
  onRefreshSync?: () => void;
  isSyncing?: boolean;
}

export function Header({
  dealershipName = 'Auto Elite Motors - Matriz Jardins',
  onRefreshSync,
  isSyncing = false,
}: HeaderProps) {
  return (
    <header className="bg-surface-card border-b border-surface-border h-16 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-subtle">
      {/* Informações da Unidade / Loja */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-surface-muted border border-surface-border text-typography-heading">
          <Store className="w-4 h-4 text-brand-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-typography-heading tracking-tight">
            {dealershipName}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-typography-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              Sincronização em tempo real ativa
            </span>
            <span>•</span>
            <span className="font-mono">ID: AE-JARDINS-SP</span>
          </div>
        </div>
      </div>

      {/* Busca Rápida Global */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-typography-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa, chassi, modelo ou código DMS..."
            className="w-full pl-9 pr-4 py-1.5 bg-surface-muted/60 border border-surface-border rounded-md text-xs text-typography-body placeholder:text-typography-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
          />
        </div>
      </div>

      {/* Ações & Controles do Lojista */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-primary' : ''}`} />}
          onClick={onRefreshSync}
          loading={isSyncing}
        >
          Sincronizar DMS
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={<ExternalLink className="w-3.5 h-3.5" />}
          onClick={() => window.open('/api/v1/feeds/sample-token/meta-vehicles.xml', '_blank')}
        >
          Feed XML
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Veículo
        </Button>

        <div className="h-6 w-[1px] bg-surface-border mx-1" />

        {/* Notificações & Perfil */}
        <button className="p-2 text-typography-muted hover:text-typography-heading hover:bg-surface-muted rounded-md relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-brand-price absolute top-1.5 right-1.5" />
        </button>

        <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-bold text-xs flex items-center justify-center shadow-sm">
          FB
        </div>
      </div>
    </header>
  );
}
