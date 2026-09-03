import { useEffect, useState, type FormEvent } from 'react';

import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout.js';

import { AuthFormField } from '../components/auth/AuthFormField.js';

import { Button } from '../components/ui/Button.js';

import { useAuth } from '../context/AuthContext.js';

import { useSubscription } from '../context/SubscriptionContext.js';

import { ApiError } from '../types/api.js';

import { isValidEmail, isValidPassword, passwordsMatch } from '../utils/validation.js';

import { resolvePostAuthNavigatePath } from '../utils/auth.js';

import {
  LEGAL_ACCEPTANCE_DOCUMENTS,
  REGISTER_LEGAL_REQUIRED_ERROR,
  legalDocumentUrl,
} from '../constants/legal.js';

export function RegisterPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const selectedPlan = searchParams.get('plan');

  const isTrialRegister = selectedPlan === 'trial';

  const { register, logout, isAuthenticated } = useAuth();

  const { refetchBilling, setBilling } = useSubscription();

  const [isClearingSession, setIsClearingSession] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const clearSessionForTrialRegister = async () => {
      setIsClearingSession(true);

      try {
        await logout();

        setBilling(null);
      } finally {
        if (!cancelled) {
          setIsClearingSession(false);
        }
      }
    };

    void clearSessionForTrialRegister();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, logout, setBilling]);

  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [workspaceName, setWorkspaceName] = useState('');

  const [acceptTerms, setAcceptTerms] = useState(false);

  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formError, setFormError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Informe seu nome';
    }

    if (!email.trim()) {
      errors.email = 'Informe seu email';
    } else if (!isValidEmail(email)) {
      errors.email = 'Email inválido';
    }

    if (!password) {
      errors.password = 'Informe uma senha';
    } else if (!isValidPassword(password)) {
      errors.password = 'A senha deve ter ao menos 8 caracteres';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirme sua senha';
    } else if (!passwordsMatch(password, confirmPassword)) {
      errors.confirmPassword = 'As senhas não coincidem';
    }

    if (!workspaceName.trim()) {
      errors.workspaceName = 'Informe o nome da revenda';
    }

    if (!acceptTerms || !acceptPrivacy) {
      errors.legal = REGISTER_LEGAL_REQUIRED_ERROR;
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError(null);

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const acceptedAt = new Date().toISOString();

      const legalAcceptances = LEGAL_ACCEPTANCE_DOCUMENTS.map((doc) => ({
        slug: doc.slug,
        version: doc.version,
        contentHash: doc.contentHash,
        acceptedAt,
      }));

      const session = await register(
        {
          name: name.trim(),
          email: email.trim(),
          password,
          workspaceName: workspaceName.trim(),
          legalAcceptances,
        },
        isTrialRegister ? { plan: 'trial' } : undefined,
      );

      const billing = session.billing ?? (await refetchBilling());

      if (session.billing) {
        setBilling(session.billing);
      }

      navigate(resolvePostAuthNavigatePath(session.user, billing, '/', selectedPlan), { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError('Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isClearingSession) {
    return (
      <AuthLayout title="Preparando cadastro trial" subtitle="Encerrando a sessão anterior...">
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={
        isTrialRegister
          ? 'Crie sua conta — 14 dias grátis no plano Pro, sem cartão'
          : 'Criar sua conta'
      }
      subtitle={
        isTrialRegister
          ? 'Cadastre sua revenda e comece a usar o catálogo sem pagamento agora.'
          : 'Cadastre sua revenda e comece a publicar seu catálogo.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError ? (
          <div className="rounded-md border border-brand-price/30 bg-brand-priceLight px-3.5 py-2.5 text-sm text-brand-price">
            {formError}
          </div>
        ) : null}

        <AuthFormField
          label="Nome completo"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
          placeholder="João Silva"
        />

        <AuthFormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          placeholder="voce@revenda.com.br"
        />

        <AuthFormField
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          placeholder="Mínimo 8 caracteres"
        />

        <AuthFormField
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors.confirmPassword}
          placeholder="Repita a senha"
        />

        <AuthFormField
          label="Nome da revenda"
          name="workspaceName"
          value={workspaceName}
          onChange={(event) => setWorkspaceName(event.target.value)}
          error={fieldErrors.workspaceName}
          placeholder="Auto Elite Motors"
        />

        <div className="space-y-3 pt-1">
          {LEGAL_ACCEPTANCE_DOCUMENTS.map((doc) => (
            <label
              key={doc.slug}
              className="flex items-start gap-2.5 text-sm text-typography-muted cursor-pointer"
            >
              <input
                type="checkbox"
                name={`legal-${doc.slug}`}
                checked={doc.slug === 'termos-de-uso' ? acceptTerms : acceptPrivacy}
                onChange={(event) => {
                  if (doc.slug === 'termos-de-uso') {
                    setAcceptTerms(event.target.checked);
                  } else {
                    setAcceptPrivacy(event.target.checked);
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-surface-border accent-brand-primary cursor-pointer"
              />
              <span>
                {doc.prefix}
                <a
                  href={legalDocumentUrl(doc.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-primary underline-offset-2 hover:underline"
                >
                  {doc.anchor}
                </a>
                {doc.suffix}
              </span>
            </label>
          ))}

          {fieldErrors.legal ? (
            <p className="text-xs text-brand-price bg-brand-priceLight rounded-md px-3 py-2">
              {fieldErrors.legal}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
          Criar conta
        </Button>

        <p className="text-center text-sm text-typography-muted">
          Já tem conta?{' '}
          <Link
            to={selectedPlan ? `/login?plan=${encodeURIComponent(selectedPlan)}` : '/login'}
            className="font-medium text-brand-primary hover:text-brand-primaryHover"
          >
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
