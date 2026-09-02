import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { AuthFormField } from '../components/auth/AuthFormField.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useSubscription } from '../context/SubscriptionContext.js';
import { checkoutService } from '../services/api/checkoutService.js';
import { ApiError } from '../types/api.js';
import { isValidEmail, isValidPassword, passwordsMatch } from '../utils/validation.js';
import { getPostAuthPath } from '../utils/auth.js';
import {
  buildAuthPathWithSession,
  getCheckoutSessionId,
  getMarketingCheckoutRetryUrl,
} from '../utils/checkout.js';

type SessionErrorKind = 'invalid' | 'expired' | 'consumed' | null;

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutSessionId = getCheckoutSessionId(searchParams);
  const { register } = useAuth();
  const { refetchBilling } = useSubscription();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingSession, setIsValidatingSession] = useState(Boolean(checkoutSessionId));
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [sessionError, setSessionError] = useState<SessionErrorKind>(null);

  const retryCheckoutUrl = getMarketingCheckoutRetryUrl();
  const loginPath = buildAuthPathWithSession('/login', checkoutSessionId);

  useEffect(() => {
    if (!checkoutSessionId) {
      setIsValidatingSession(false);
      return;
    }

    let cancelled = false;

    const validateSession = async () => {
      setIsValidatingSession(true);
      setSessionError(null);
      setFormError(null);

      try {
        const status = await checkoutService.getStripeSessionStatus(checkoutSessionId);
        if (cancelled) return;

        setEmail(status.customerEmail);
        setWorkspaceName(status.dealershipName);
        setIsCheckoutMode(true);
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError) {
          if (error.statusCode === 410) {
            setSessionError('expired');
          } else if (error.statusCode === 409) {
            setSessionError('consumed');
          } else {
            setSessionError('invalid');
          }
        } else {
          setSessionError('invalid');
        }
      } finally {
        if (!cancelled) {
          setIsValidatingSession(false);
        }
      }
    };

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [checkoutSessionId]);

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

    if (!isCheckoutMode && !workspaceName.trim()) {
      errors.workspaceName = 'Informe o nome da revenda';
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
      const user = await register(
        isCheckoutMode && checkoutSessionId
          ? {
              name: name.trim(),
              email: email.trim(),
              password,
              checkoutSessionId,
            }
          : {
              name: name.trim(),
              email: email.trim(),
              password,
              workspaceName: workspaceName.trim(),
            },
      );
      const billing = await refetchBilling();
      navigate(getPostAuthPath(user, billing), { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 409 && error.message.toLowerCase().includes('cadastrado')) {
          setFormError(`${error.message} Use a opção de login abaixo.`);
        } else if (error.statusCode === 409) {
          setFormError('Use o mesmo email informado no checkout.');
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError('Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidatingSession) {
    return (
      <AuthLayout title="Criar sua conta" subtitle="Validando pagamento...">
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          <p className="text-sm text-typography-muted">Confirmando sessão de checkout...</p>
        </div>
      </AuthLayout>
    );
  }

  if (sessionError) {
    const messages: Record<Exclude<SessionErrorKind, null>, { title: string; detail: string }> = {
      invalid: {
        title: 'Sessão inválida',
        detail: 'Não foi possível validar o pagamento. Verifique o link ou tente novamente.',
      },
      expired: {
        title: 'Sessão expirada',
        detail: 'O prazo para concluir o cadastro expirou. Realize um novo pagamento para continuar.',
      },
      consumed: {
        title: 'Sessão já utilizada',
        detail: 'Esta sessão de checkout já foi usada. Faça login para continuar.',
      },
    };

    const message = messages[sessionError];

    return (
      <AuthLayout title={message.title} subtitle={message.detail}>
        <div className="space-y-4">
          {sessionError === 'consumed' ? (
            <Button className="w-full" size="lg" onClick={() => navigate(loginPath, { replace: true })}>
              Ir para login
            </Button>
          ) : retryCheckoutUrl ? (
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                window.location.href = retryCheckoutUrl;
              }}
            >
              Tentar novamente
            </Button>
          ) : null}

          <p className="text-center text-sm text-typography-muted">
            {sessionError === 'consumed' ? (
              <>
                Ainda não tem conta?{' '}
                <Link to="/register" className="font-medium text-brand-primary hover:text-brand-primaryHover">
                  Cadastro normal
                </Link>
              </>
            ) : (
              <>
                Já possui conta?{' '}
                <Link to={loginPath} className="font-medium text-brand-primary hover:text-brand-primaryHover">
                  Entrar
                </Link>
              </>
            )}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle={
        isCheckoutMode
          ? 'Pagamento confirmado — complete seu cadastro para acessar o onboarding.'
          : 'Cadastre sua revenda e comece a publicar seu catálogo.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {isCheckoutMode ? (
          <div className="rounded-md border border-brand-primary/20 bg-brand-primary/5 px-3.5 py-2.5 text-sm text-typography-body">
            Pagamento confirmado. Use o mesmo email do checkout para concluir o cadastro.
          </div>
        ) : null}

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
          readOnly={isCheckoutMode}
          className={isCheckoutMode ? 'bg-surface-muted cursor-not-allowed' : undefined}
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

        {isCheckoutMode ? (
          <AuthFormField
            label="Nome da revenda"
            name="workspaceName"
            value={workspaceName}
            readOnly
            className="bg-surface-muted cursor-not-allowed"
          />
        ) : (
          <AuthFormField
            label="Nome da revenda"
            name="workspaceName"
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
            error={fieldErrors.workspaceName}
            placeholder="Auto Elite Motors"
          />
        )}

        <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
          Criar conta
        </Button>

        <p className="text-center text-sm text-typography-muted">
          Já tem conta?{' '}
          <Link to={loginPath} className="font-medium text-brand-primary hover:text-brand-primaryHover">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
