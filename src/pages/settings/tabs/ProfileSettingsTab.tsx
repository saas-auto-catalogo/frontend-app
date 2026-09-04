import { User, Store, Mail, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card.js';
import { useAuth } from '../../../context/AuthContext.js';
import { useWorkspace } from '../../../hooks/useWorkspace.js';

function getRoleLabel(role?: string | null): string {
  switch (role) {
    case 'OWNER': return 'Proprietário';
    case 'SUPER_ADMIN': return 'Super Administrador';
    case 'MANAGER': return 'Gerente';
    case 'VIEWER': return 'Visualizador';
    default: return role ?? 'Não definido';
  }
}

export function ProfileSettingsTab() {
  const { user } = useAuth();
  const { workspaceName, role } = useWorkspace();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-primary/10">
              <User className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-typography-heading">Dados do Usuário</h3>
              <p className="text-xs text-typography-muted">Informações da sua conta pessoal</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-typography-muted flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Nome
              </label>
              <p className="text-sm font-semibold text-typography-heading bg-surface-muted rounded-md px-3 py-2">
                {user?.name ?? '—'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-typography-muted flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                E-mail
              </label>
              <p className="text-sm font-semibold text-typography-heading bg-surface-muted rounded-md px-3 py-2">
                {user?.email ?? '—'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-typography-muted flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Papel
              </label>
              <p className="text-sm font-semibold text-typography-heading bg-surface-muted rounded-md px-3 py-2">
                {getRoleLabel(role)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-accent/10">
              <Store className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-typography-heading">Dados da Revenda</h3>
              <p className="text-xs text-typography-muted">Informações corporativas do workspace</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <label className="text-xs font-medium text-typography-muted flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              Nome da Revenda
            </label>
            <p className="text-sm font-semibold text-typography-heading bg-surface-muted rounded-md px-3 py-2">
              {workspaceName ?? '—'}
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-typography-subtle">
        Formulário completo de edição será disponibilizado na Issue #30.
      </p>
    </div>
  );
}
