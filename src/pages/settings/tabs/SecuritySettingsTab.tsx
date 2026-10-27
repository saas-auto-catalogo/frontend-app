import { ShieldCheck, Lock, KeyRound, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card.js';
import { Button } from '../../../components/ui/Button.js';
import { useAuth } from '../../../context/AuthContext.js';

export function SecuritySettingsTab() {
  const { user, isImpersonated } = useAuth();
  const mfaEnabled = user?.mfaEnabled ?? false;

  return (
    <div className="space-y-6">
      {isImpersonated && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Ações de segurança bloqueadas em modo de suporte</p>
            <p className="text-red-700 mt-0.5">
              Por motivos de conformidade e segurança, a alteração de senhas e dados de credenciais não é permitida durante a sessão de impersonation.
            </p>
          </div>
        </div>
      )}

      <Card>

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-typography-heading">Alterar Senha</h3>
              <p className="text-xs text-typography-muted">Atualize sua senha de acesso</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-typography-muted">E-mail</label>
            <p className="text-sm font-semibold text-typography-heading bg-surface-muted rounded-md px-3 py-2">
              {user?.email ?? '—'}
            </p>
          </div>
          <Button variant="outline" size="sm" disabled>
            Alterar senha (em breve)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-typography-heading">Autenticação em Duas Etapas (2FA)</h3>
              <p className="text-xs text-typography-muted">Adicione uma camada extra de segurança</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${mfaEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-typography-body font-medium">
              {mfaEnabled ? '2FA ativado' : '2FA desativado'}
            </span>
          </div>
          <Button variant="outline" size="sm" icon={<KeyRound className="w-3.5 h-3.5" />} disabled>
            {mfaEnabled ? 'Gerenciar 2FA (em breve)' : 'Ativar 2FA (em breve)'}
          </Button>
          <p className="text-xs text-typography-subtle">
            A configuração completa de 2FA TOTP será disponibilizada na Issue #31 / Backend #32.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
