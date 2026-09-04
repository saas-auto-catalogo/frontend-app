import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Store, ShieldCheck, Users, CreditCard } from 'lucide-react';
import { Sidebar } from '../../components/layout/Sidebar.js';
import { Header } from '../../components/layout/Header.js';
import { useAuth } from '../../context/AuthContext.js';
import { useWorkspace } from '../../hooks/useWorkspace.js';

const SETTINGS_TABS: Array<{ id: string; label: string; path: string; icon: typeof Store; ownerOnly?: boolean }> = [
  { id: 'profile', label: 'Perfil & Revenda', path: '/settings/profile', icon: Store },
  { id: 'security', label: 'Segurança', path: '/settings/security', icon: ShieldCheck },
  { id: 'team', label: 'Equipe', path: '/settings/team', icon: Users, ownerOnly: true },
  { id: 'billing', label: 'Faturamento', path: '/settings/billing', icon: CreditCard, ownerOnly: true },
];

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workspaceName, role, workspaceId } = useWorkspace();

  const activeTab = location.pathname.split('/settings/')[1] ?? 'profile';
  const isOwnerOrAdmin = role === 'OWNER' || role === 'SUPER_ADMIN';

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-surface-canvas text-typography-body">
      <Sidebar
        activeTab="settings"
        onTabChange={(tab) => {
          if (tab === 'settings') {
            navigate('/settings/profile');
          } else {
            navigate('/', { state: { tab } });
          }
        }}
        workspaceName={workspaceName}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          dealershipName={workspaceName ?? 'Minha Revenda'}
          workspaceId={workspaceId}
          userName={user?.name}
          userInitials={user ? getUserInitials(user.name) : undefined}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-typography-heading">Configurações</h1>
            <p className="text-sm text-typography-muted">
              Gerencie o perfil, segurança, equipe e faturamento da sua revenda.
            </p>
          </div>

          <nav className="flex gap-1 border-b border-surface-border">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const restricted = tab.ownerOnly && !isOwnerOrAdmin;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.path)}
                  disabled={restricted}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-typography-muted hover:text-typography-heading hover:border-surface-border'
                  } ${restricted ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={restricted ? 'Somente OWNER ou SUPER_ADMIN' : tab.label}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {restricted && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                      Restrito
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
