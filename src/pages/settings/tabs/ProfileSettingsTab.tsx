import { useEffect, useState } from 'react';
import { User, Store, Mail, Shield, Camera, Building2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card.js';
import { Button } from '../../../components/ui/Button.js';
import { useAuth } from '../../../context/AuthContext.js';
import { useWorkspace } from '../../../hooks/useWorkspace.js';
import { profileService } from '../../../services/api/profileService.js';
import { BRAZILIAN_STATES } from '../../../constants/brazilianStates.js';
import type { WorkspaceProfile } from '../../../types/profile.js';
import { ApiError } from '../../../types/api.js';

function getRoleLabel(role?: string | null): string {
  switch (role) {
    case 'OWNER': return 'Proprietário';
    case 'SUPER_ADMIN': return 'Super Administrador';
    case 'MANAGER': return 'Gerente';
    case 'VIEWER': return 'Visualizador';
    default: return role ?? 'Não definido';
  }
}

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function ProfileSettingsTab() {
  const { user, updateProfile, refreshUser } = useAuth();
  const { workspaceId, role } = useWorkspace();

  const isOwnerOrAdmin = role === 'OWNER' || role === 'SUPER_ADMIN';

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [, setProfile] = useState<WorkspaceProfile | null>(null);
  const [tradeName, setTradeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingDealership, setIsSavingDealership] = useState(false);
  const [dealershipSuccess, setDealershipSuccess] = useState<string | null>(null);
  const [dealershipError, setDealershipError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setAvatarUrl(user.avatarUrl ?? '');
    }
  }, [user]);

  useEffect(() => {
    if (!workspaceId) {
      setIsProfileLoading(false);
      return;
    }

    let cancelled = false;
    profileService
      .getProfile(workspaceId)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setTradeName(data.dealership.tradeName ?? data.workspace.name ?? '');
        setCnpj(data.dealership.cnpj ?? data.workspace.cnpj ?? '');
        setPhone(data.dealership.phone ?? data.workspace.phone ?? '');
        setCity(data.dealership.city ?? data.workspace.city ?? '');
        setState(data.dealership.state ?? data.workspace.state ?? '');
        setLogoUrl(data.dealership.logoUrl ?? '');
      })
      .catch(() => {
        if (!cancelled) {
          setDealershipError('Não foi possível carregar os dados da revenda.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const showQuickMessage = (setter: (v: string | null) => void, message: string) => {
    setter(message);
    window.setTimeout(() => setter(null), 3000);
  };

  const handleSaveProfile = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError('O nome deve ter pelo menos 2 caracteres.');
      return;
    }
    setNameError(null);
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      await updateProfile({ name: trimmed, avatarUrl: avatarUrl.trim() || null });
      showQuickMessage(setProfileSuccess, 'Perfil atualizado com sucesso.');
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao salvar seu perfil.';
      setProfileError(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveDealership = async () => {
    if (!workspaceId) return;
    const trimmedTradeName = tradeName.trim();
    if (trimmedTradeName.length < 2) {
      setDealershipError('O nome fantasia deve ter pelo menos 2 caracteres.');
      return;
    }
    setIsSavingDealership(true);
    setDealershipError(null);
    try {
      const updated = await profileService.updateProfile(workspaceId, {
        tradeName: trimmedTradeName,
        cnpj: cnpj.replace(/\D/g, '') || undefined,
        phone: phone || undefined,
        city: city.trim() || undefined,
        state: state || undefined,
        logoUrl: logoUrl.trim() || null,
      });
      setProfile(updated);
      await refreshUser();
      showQuickMessage(setDealershipSuccess, 'Dados da revenda atualizados com sucesso.');
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao salvar os dados da revenda.';
      setDealershipError(message);
    } finally {
      setIsSavingDealership(false);
    }
  };

  const dealershipReadOnly = !isOwnerOrAdmin;
  const effectiveLogo = avatarUrl.trim();
  const previewInitials = user ? getUserInitials(name.trim() || user.name) : 'U';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-primary/10">
              <User className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-typography-heading">Meu Perfil</h3>
              <p className="text-xs text-typography-muted">Dados pessoais da sua conta</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-bold text-sm flex items-center justify-center sticky top-0 overflow-hidden">
              {effectiveLogo ? (
                <img
                  src={effectiveLogo}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                previewInitials
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-typography-heading">{name || '—'}</p>
              <div className="flex items-center gap-1.5 text-xs text-typography-muted mt-0.5">
                <Shield className="w-3.5 h-3.5 text-brand-primary" />
                {getRoleLabel(role)}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-typography-muted flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-muted/60 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              placeholder="Seu nome completo"
            />
            {nameError && <p className="text-xs text-red-600">{nameError}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-typography-muted flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              E-mail
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full px-3 py-2 text-sm bg-surface-muted cursor-not-allowed border border-surface-border rounded-md text-typography-muted"
            />
            <p className="text-[11px] text-typography-subtle">
              O e-mail é usado para login e não pode ser alterado aqui.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-typography-muted flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              URL do Avatar
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-muted/60 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              placeholder="https://exemplo.com/avatar.png"
            />
          </div>

          {profileError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {profileError}
            </p>
          )}
          {profileSuccess && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {profileSuccess}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleSaveProfile()}
              loading={isSavingProfile}
            >
              Salvar Meu Perfil
            </Button>
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
              <p className="text-xs text-typography-muted">Informações corporativas da concessionária</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {dealershipReadOnly && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Somente proprietários (Owner) podem alterar os dados cadastrais da revenda.
              </p>
            </div>
          )}

          {isProfileLoading ? (
            <p className="text-sm text-typography-muted">Carregando dados da revenda...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-typography-muted flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  disabled={dealershipReadOnly}
                  className="w-full px-3 py-2 text-sm bg-surface-muted/60 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Nome da revenda"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-typography-muted">CNPJ</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                  disabled={dealershipReadOnly}
                  className="w-full px-3 py-2 text-sm bg-surface-muted/60 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-typography-muted">Telefone Comercial</label>
                <input
                  type="text"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  disabled={dealershipReadOnly}
                  className="w-full px-3 py-2 text-sm bg-surface-muted/60 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-typography-muted">Cidade</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={dealershipReadOnly}
                  className="w-full px-3 py-2 text-sm bg-surface-muted/60 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Cidade"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-typography-muted">Estado (UF)</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={dealershipReadOnly}
                  className="w-full px-3 py-2 text-sm bg-surface-muted/60 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione...</option>
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf.value} value={uf.value}>
                      {uf.value} — {uf.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-typography-muted flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  URL do Logotipo
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  disabled={dealershipReadOnly}
                  className="w-full px-3 py-2 text-sm bg-surface-muted/60 border border-surface-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
            </div>
          )}

          {logoUrl.trim() && (
            <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-muted px-4 py-3">
              <div className="w-12 h-12 rounded-lg bg-white border border-surface-border overflow-hidden flex items-center justify-center">
                <img
                  src={logoUrl.trim()}
                  alt="Logotipo da revenda"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <p className="text-xs text-typography-muted">Preview do logotipo</p>
            </div>
          )}

          {dealershipError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {dealershipError}
            </p>
          )}
          {dealershipSuccess && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {dealershipSuccess}
            </p>
          )}

          {!dealershipReadOnly && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                icon={<Store className="w-3.5 h-3.5" />}
                onClick={() => void handleSaveDealership()}
                loading={isSavingDealership}
              >
                Salvar Dados da Revenda
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
