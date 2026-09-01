import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { AuthFormField } from '../components/auth/AuthFormField.js';
import { Button } from '../components/ui/Button.js';
import { authService } from '../services/api/authService.js';
import { ApiError } from '../types/api.js';
import { isValidPassword, passwordsMatch } from '../utils/validation.js';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!token) {
      setFormError('Link de redefinição inválido ou expirado.');
      return false;
    }

    if (!password) {
      errors.password = 'Informe a nova senha';
    } else if (!isValidPassword(password)) {
      errors.password = 'A senha deve ter ao menos 8 caracteres';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirme a nova senha';
    } else if (!passwordsMatch(password, confirmPassword)) {
      errors.confirmPassword = 'As senhas não coincidem';
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
      await authService.resetPassword(token, password);
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError('Não foi possível redefinir a senha. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Link inválido"
        subtitle="O link de redefinição de senha está incompleto ou expirou."
      >
        <div className="space-y-4">
          <p className="text-sm text-typography-muted">
            Solicite um novo link na página de recuperação de senha.
          </p>
          <Link to="/forgot-password">
            <Button className="w-full">Solicitar novo link</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Senha redefinida"
        subtitle="Sua senha foi atualizada com sucesso."
      >
        <div className="text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-brand-accentLight text-brand-accent flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="text-sm text-typography-muted">
            Faça login com sua nova senha para acessar o painel.
          </p>
          <Button className="w-full" onClick={() => navigate('/login', { replace: true })}>
            Ir para o login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nova senha"
      subtitle="Defina uma nova senha para sua conta."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError ? (
          <div className="rounded-md border border-brand-price/30 bg-brand-priceLight px-3.5 py-2.5 text-sm text-brand-price">
            {formError}
          </div>
        ) : null}

        <AuthFormField
          label="Nova senha"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          placeholder="Mínimo 8 caracteres"
        />

        <AuthFormField
          label="Confirmar nova senha"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors.confirmPassword}
          placeholder="Repita a nova senha"
        />

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Redefinir senha
        </Button>

        <p className="text-center text-sm text-typography-muted">
          <Link to="/login" className="font-medium text-brand-primary hover:text-brand-primaryHover">
            Voltar para o login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
