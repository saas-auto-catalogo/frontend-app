import { ShieldAlert, UserPlus } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card.js';
import { Button } from '../../../components/ui/Button.js';
import { useAuth } from '../../../context/AuthContext.js';
import { useWorkspace } from '../../../hooks/useWorkspace.js';

function getRoleLabel(role?: string | null): string {
  switch (role) {
    case 'OWNER': return 'Proprietário';
    case 'SUPER_ADMIN': return 'Super Administrador';
    case 'MANAGER': return 'Gerente';
    case 'VIEWER': return 'Visualizador';
    default: return role ?? '—';
  }
}

export function TeamSettingsTab() {
  const { user } = useAuth();
  const { role } = useWorkspace();

  const isOwnerOrAdmin = role === 'OWNER' || role === 'SUPER_ADMIN';

  if (!isOwnerOrAdmin) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-typography-heading">Acesso Restrito</h3>
            <p className="text-sm text-typography-muted mt-1 max-w-md mx-auto">
              Somente o proprietário ({`OWNER`}) ou super administrador pode gerenciar membros da equipe.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-typography-heading">Membros da Equipe</h3>
          <p className="text-xs text-typography-muted">Gerencie quem tem acesso ao painel</p>
        </div>
        <Button variant="primary" size="sm" icon={<UserPlus className="w-3.5 h-3.5" />} disabled>
          Convidar Membro
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-surface-border">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-primary text-white font-bold text-xs flex items-center justify-center">
                  {user?.name ? user.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-typography-heading">{user?.name ?? '—'}</p>
                  <p className="text-xs text-typography-muted">{user?.email ?? '—'}</p>
                </div>
              </div>
              <span className="text-xs font-semibold bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full">
                {getRoleLabel(role)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-typography-subtle">
        Convites e gestão completa de membros serão disponibilizados na Issue #32 / Backend #33.
      </p>
    </div>
  );
}
