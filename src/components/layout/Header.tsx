import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ExternalLink, RefreshCw, Store, LogOut, Settings, SlidersHorizontal, User } from 'lucide-react';
import { Button } from '../ui/Button.js';

export interface HeaderProps {
  dealershipName?: string;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  userRole?: string;
  workspaceId?: string;
  publicFeedUrl?: string | null;
  onRefreshSync?: () => void;
  isSyncing?: boolean;
  onConfigureMeta?: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

function formatWorkspaceId(workspaceId?: string): string | null {
  if (!workspaceId) return null;
  if (workspaceId.length <= 12) return workspaceId;
  return `${workspaceId.slice(0, 8)}…`;
}

export function Header({
  dealershipName = 'Minha Revenda',
  userName,
  userEmail,
  userInitials = 'U',
  userRole,
  workspaceId,
  publicFeedUrl,
  onRefreshSync,
  isSyncing = false,
  onConfigureMeta,
  onLogout,
  isLoggingOut = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const workspaceIdLabel = formatWorkspaceId(workspaceId);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  const handleOpenFeed = () => {
    if (!publicFeedUrl) return;
    window.open(publicFeedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="bg-surface-card border-b border-surface-border h-16 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-subtle">
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
            {workspaceIdLabel ? (
              <>
                <span>•</span>
                <span className="font-mono">ID: {workspaceIdLabel}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

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

      <div className="flex items-center gap-2.5">
        <Button
          variant="primary"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
          onClick={onRefreshSync}
          loading={isSyncing}
          disabled={!onRefreshSync}
        >
          Sincronizar Estoque DMS
        </Button>

        {publicFeedUrl ? (
          <Button
            variant="outline"
            size="sm"
            icon={<ExternalLink className="w-3.5 h-3.5" />}
            onClick={handleOpenFeed}
            title="Abrir feed XML do catálogo para anúncios"
          >
            Feed XML Meta
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            onClick={onConfigureMeta}
            disabled={!onConfigureMeta}
            title="Clique para configurar o catálogo Meta Ads e ativar seu feed XML"
          >
            <span className="flex items-center gap-1.5">
              Feed XML Meta
              <span className="text-[10px] font-semibold uppercase bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded">
                Configurar
              </span>
            </span>
          </Button>
        )}

        <div className="h-6 w-[1px] bg-surface-border mx-1" />

        <button className="p-2 text-typography-muted hover:text-typography-heading hover:bg-surface-muted rounded-md relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-brand-price absolute top-1.5 right-1.5" />
        </button>

        {onLogout ? (
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut className="w-3.5 h-3.5" />}
            onClick={onLogout}
            loading={isLoggingOut}
            title={userName ? `Sair (${userName})` : 'Sair'}
          >
            Sair
          </Button>
        ) : null}

        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={isProfileMenuOpen}
            title={userName}
            className="w-8 h-8 rounded-full bg-brand-primary text-white font-bold text-xs flex items-center justify-center shadow-sm cursor-pointer transition-shadow hover:ring-2 hover:ring-brand-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            {userInitials}
          </button>

          {isProfileMenuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-surface-border bg-surface-card shadow-xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-surface-border">
                <p className="text-sm font-bold text-typography-heading truncate">
                  {userName}
                </p>
                <p className="text-xs text-typography-muted truncate mt-0.5">
                  {userEmail}
                </p>
                {userRole ? (
                  <span className="mt-1.5 inline-block text-[10px] font-semibold uppercase tracking-wide text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                    {userRole}
                  </span>
                ) : null}
              </div>

              <div className="p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/settings/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-typography-body hover:bg-surface-muted rounded-md transition-colors"
                >
                  <User className="w-4 h-4 text-brand-primary" />
                  Meu Perfil
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-typography-body hover:bg-surface-muted rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4 text-brand-primary" />
                  Configurações
                </button>
              </div>

              <div className="border-t border-surface-border p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLogout?.();
                  }}
                  disabled={isLoggingOut || !onLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-typography-body hover:bg-surface-muted rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <RefreshCw className="w-4 h-4 text-brand-primary animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 text-brand-primary" />
                  )}
                  {isLoggingOut ? 'Saindo...' : 'Sair'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
