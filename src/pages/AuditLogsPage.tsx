import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar.js';
import { Header } from '../components/layout/Header.js';
import { Card, CardContent } from '../components/ui/Card.js';
import {
  AuditLogFilters,
  AuditLogsView,
} from '../components/dashboard/AuditLogsView.js';
import { useAuth } from '../context/AuthContext.js';
import { useWorkspace } from '../hooks/useWorkspace.js';
import { useAuditLogSearchParams } from '../hooks/useAuditLogSearchParams.js';

const AUDIT_LOG_ROLES = new Set(['MANAGER', 'OWNER', 'SUPER_ADMIN']);

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AuditLogsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workspaceId, workspaceName, role } = useWorkspace();
  const { filters, setFilters } = useAuditLogSearchParams();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dealershipName = workspaceName || 'Auto Elite Motors - Matriz Jardins';
  const canViewAuditLog = role ? AUDIT_LOG_ROLES.has(role) : false;

  const handleFiltersChange = useCallback(
    (nextFilters: AuditLogFilters) => {
      setFilters(nextFilters);
    },
    [setFilters],
  );

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSidebarTabChange = useCallback(
    (tab: string) => {
      navigate('/', { state: { tab } });
    },
    [navigate],
  );

  return (
    <div className="min-h-screen flex bg-surface-canvas text-typography-body">
      <Sidebar
        activeTab="dashboard"
        onTabChange={handleSidebarTabChange}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          dealershipName={dealershipName}
          userName={user?.name}
          userInitials={user ? getUserInitials(user.name) : undefined}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-typography-heading">Log de Auditoria</h1>
              <p className="text-xs text-typography-muted mt-0.5">
                Histórico completo de ações sensíveis no workspace.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center justify-center text-xs font-medium rounded-md border border-surface-border text-typography-body hover:bg-surface-muted px-3 py-1.5 gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao Dashboard
            </Link>
          </div>

          {!canViewAuditLog ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-typography-muted max-w-md">
                    Acesso restrito. Apenas gestores podem visualizar o log de auditoria.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center text-xs font-medium rounded-md border border-surface-border text-typography-body hover:bg-surface-muted px-3 py-1.5 transition-colors"
                  >
                    Voltar ao Dashboard
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : workspaceId ? (
            <AuditLogsView
              workspaceId={workspaceId}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-typography-muted">
                Workspace não encontrado para esta sessão.
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

export default AuditLogsPage;
