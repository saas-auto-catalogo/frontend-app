import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { AuthFormField } from '../components/auth/AuthFormField.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useSubscription } from '../context/SubscriptionContext.js';
import { ApiError } from '../types/api.js';
import { isValidEmail } from '../utils/validation.js';
import { resolvePostAuthNavigatePath } from '../utils/auth.js';
import { env } from '../config/env.js';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan');
  const { login, startMockImpersonation } = useAuth();
  const { refetchBilling, setBilling } = useSubscription();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || '/';

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'Informe seu email';
    } else if (!isValidEmail(email)) {
      errors.email = 'Email inválido';
    }

    if (!password) {
      errors.password = 'Informe sua senha';
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
      const session = await login(email.trim(), password);
      const billing = session.billing ?? (await refetchBilling());
      if (session.billing) {
        setBilling(session.billing);
      }
      navigate(resolvePostAuthNavigatePath(session.user, billing, from, selectedPlan), { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerPath = selectedPlan
    ? `/register?plan=${encodeURIComponent(selectedPlan)}`
    : '/register';

  return (
    <AuthLayout
      title="Entrar na sua conta"
      subtitle="Acesse o painel da sua revenda e gerencie o catálogo."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError ? (
          <div className="rounded-md border border-brand-price/30 bg-brand-priceLight px-3.5 py-2.5 text-sm text-brand-price">
            {formError}
          </div>
        ) : null}

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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          placeholder="••••••••"
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-primary hover:text-brand-primaryHover">
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Entrar
        </Button>

        {env.enableMockFallback ? (
          <div className="pt-2 border-t border-brand-border">
            <button
              type="button"
              onClick={async () => {
                await startMockImpersonation();
                navigate('/', { replace: true });
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <span>🛡️</span>
              <span>Acessar via Suporte (Ver Banner de Impersonation)</span>
            </button>
            <p className="mt-1.5 text-center text-xs text-typography-muted">
              Ativa o modo de suporte técnico com banner vermelho persistente no topo.
            </p>
          </div>
        ) : null}

        <p className="text-center text-sm text-typography-muted">
          Ainda não tem conta?{' '}
          <Link to={registerPath} className="font-medium text-brand-primary hover:text-brand-primaryHover">
            Criar conta
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

