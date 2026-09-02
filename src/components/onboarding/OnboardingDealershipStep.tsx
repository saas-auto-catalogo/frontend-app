import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { AuthFormField } from '../auth/AuthFormField.js';
import { Card } from '../ui/Card.js';
import { DataFetchError } from '../ui/DataFetchError.js';
import { useWorkspace } from '../../hooks/useWorkspace.js';
import { profileService } from '../../services/api/profileService.js';
import { BRAZILIAN_STATES } from '../../constants/brazilianStates.js';
import { ApiError } from '../../types/api.js';
import {
  isValidCity,
  isValidCnpj,
  isValidPhone,
  isValidState,
  isValidTradeName,
  isValidUrl,
} from '../../utils/validation.js';

export interface OnboardingDealershipStepHandle {
  saveAndValidate: () => Promise<boolean>;
}

export interface OnboardingDealershipStepProps {
  disabled?: boolean;
}

interface DealershipFormState {
  tradeName: string;
  cnpj: string;
  phone: string;
  city: string;
  state: string;
  logoUrl: string;
}

const EMPTY_FORM: DealershipFormState = {
  tradeName: '',
  cnpj: '',
  phone: '',
  city: '',
  state: '',
  logoUrl: '',
};

function profileToForm(profile: Awaited<ReturnType<typeof profileService.getProfile>>): DealershipFormState {
  const { workspace, dealership } = profile;

  return {
    tradeName: dealership.tradeName || workspace.name || '',
    cnpj: dealership.cnpj ?? workspace.cnpj ?? '',
    phone: dealership.phone ?? workspace.phone ?? '',
    city: dealership.city ?? workspace.city ?? '',
    state: dealership.state ?? workspace.state ?? '',
    logoUrl: dealership.logoUrl ?? '',
  };
}

export const OnboardingDealershipStep = forwardRef<
  OnboardingDealershipStepHandle,
  OnboardingDealershipStepProps
>(function OnboardingDealershipStep({ disabled = false }, ref) {
  const { workspaceId } = useWorkspace();
  const [form, setForm] = useState<DealershipFormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof DealershipFormState, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);
      const profile = await profileService.getProfile(workspaceId);
      setForm(profileToForm(profile));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados da revenda';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const updateField = (field: keyof DealershipFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormError(null);
  };

  const saveAndValidate = useCallback(async (): Promise<boolean> => {
    setFormError(null);

    if (!workspaceId) {
      setFormError('Workspace não encontrado. Faça login novamente.');
      return false;
    }

    const errors: Partial<Record<keyof DealershipFormState, string>> = {};

    if (!isValidTradeName(form.tradeName)) {
      errors.tradeName = 'Informe o nome fantasia (mín. 2 caracteres)';
    }

    if (!isValidCnpj(form.cnpj)) {
      errors.cnpj = 'Informe um CNPJ válido';
    }

    if (!isValidPhone(form.phone)) {
      errors.phone = 'Informe um telefone válido';
    }

    if (!isValidCity(form.city)) {
      errors.city = 'Informe a cidade';
    }

    if (!isValidState(form.state)) {
      errors.state = 'Selecione o estado (UF)';
    }

    if (form.logoUrl.trim() && !isValidUrl(form.logoUrl)) {
      errors.logoUrl = 'Informe uma URL válida (http ou https)';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return false;
    }

    try {
      await profileService.updateProfile(workspaceId, {
        tradeName: form.tradeName.trim(),
        cnpj: form.cnpj.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        logoUrl: form.logoUrl.trim() ? form.logoUrl.trim() : null,
      });
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError('Não foi possível salvar os dados da revenda.');
      }
      return false;
    }
  }, [form, workspaceId]);

  useImperativeHandle(ref, () => ({ saveAndValidate }), [saveAndValidate]);

  const showLogoPreview = form.logoUrl.trim() !== '' && isValidUrl(form.logoUrl);

  if (!workspaceId) {
    return <DataFetchError message="Workspace não encontrado. Faça login novamente." />;
  }

  if (loading) {
    return (
      <Card className="p-6 space-y-4 animate-pulse">
        <div className="h-5 w-48 bg-surface-muted rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 bg-surface-muted rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (loadError) {
    return <DataFetchError message={loadError} onRetry={() => void loadProfile()} />;
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start gap-3">
        <span className="p-2 rounded-lg bg-blue-50 text-brand-primary shrink-0">
          <Building2 className="w-5 h-5" />
        </span>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-typography-heading">
            Dados da Revenda e logotipo
          </h3>
          <p className="text-sm text-typography-muted">
            Confirme as informações da sua revenda para personalizar o catálogo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <AuthFormField
            label="Nome fantasia"
            name="tradeName"
            value={form.tradeName}
            onChange={(event) => updateField('tradeName', event.target.value)}
            error={fieldErrors.tradeName}
            disabled={disabled}
            placeholder="Auto Elite Motors"
          />
        </div>

        <AuthFormField
          label="CNPJ"
          name="cnpj"
          value={form.cnpj}
          onChange={(event) => updateField('cnpj', event.target.value)}
          error={fieldErrors.cnpj}
          disabled={disabled}
          placeholder="12.345.678/0001-90"
        />

        <AuthFormField
          label="Telefone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={(event) => updateField('phone', event.target.value)}
          error={fieldErrors.phone}
          disabled={disabled}
          placeholder="(11) 98888-7777"
        />

        <AuthFormField
          label="Cidade"
          name="city"
          value={form.city}
          onChange={(event) => updateField('city', event.target.value)}
          error={fieldErrors.city}
          disabled={disabled}
          placeholder="São Paulo"
        />

        <div className="space-y-1.5">
          <label htmlFor="state" className="block text-sm font-medium text-typography-heading">
            Estado
          </label>
          <select
            id="state"
            name="state"
            value={form.state}
            onChange={(event) => updateField('state', event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(fieldErrors.state)}
            aria-describedby={fieldErrors.state ? 'state-error' : undefined}
            className={clsx(
              'w-full px-3.5 py-2.5 rounded-md border text-sm text-typography-body bg-white',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
              fieldErrors.state
                ? 'border-brand-price focus:ring-brand-price focus:border-brand-price'
                : 'border-surface-border hover:border-surface-borderHover',
            )}
          >
            <option value="">Selecione a UF</option>
            {BRAZILIAN_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.value} — {state.label}
              </option>
            ))}
          </select>
          {fieldErrors.state ? (
            <p id="state-error" className="text-xs text-brand-price" role="alert">
              {fieldErrors.state}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <AuthFormField
            label="URL do logotipo (opcional)"
            name="logoUrl"
            type="url"
            value={form.logoUrl}
            onChange={(event) => updateField('logoUrl', event.target.value)}
            error={fieldErrors.logoUrl}
            disabled={disabled}
            placeholder="https://exemplo.com/logo.png"
          />
        </div>
      </div>

      {showLogoPreview ? (
        <div className="flex items-center gap-4 p-4 rounded-lg border border-surface-border bg-surface-muted/40">
          <img
            src={form.logoUrl.trim()}
            alt="Prévia do logotipo da revenda"
            className="h-16 w-16 rounded-lg object-contain bg-white border border-surface-border"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <p className="text-xs font-semibold text-typography-heading">Prévia do logotipo</p>
            <p className="text-xs text-typography-muted mt-0.5 break-all">{form.logoUrl.trim()}</p>
          </div>
        </div>
      ) : null}

      {formError ? (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {formError}
        </p>
      ) : null}
    </Card>
  );
});
