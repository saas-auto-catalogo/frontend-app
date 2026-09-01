import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { AuthFormField } from '../components/auth/AuthFormField.js';
import { Button } from '../components/ui/Button.js';
import { authService } from '../services/api/authService.js';
import { ApiError } from '../types/api.js';
import { isValidEmail } from '../utils/validation.js';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFieldError(null);

    if (!email.trim()) {
      setFieldError('Informe seu email');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError('Email inválido');
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.forgotPassword(email.trim());
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError('Não foi possível enviar o email. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Verifique seu email"
        subtitle="Se o email estiver cadastrado, você receberá um link de redefinição em breve."
      >
        <div className="text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-brand-accentLight text-brand-accent flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="text-sm text-typography-muted">
            Enviamos as instruções para <span className="font-medium text-typography-heading">{email}</span>.
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Voltar para o login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu email e enviaremos um link para redefinir sua senha."
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
          error={fieldError || undefined}
          placeholder="voce@revenda.com.br"
        />

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Enviar link de recuperação
        </Button>

        <p className="text-center text-sm text-typography-muted">
          Lembrou a senha?{' '}
          <Link to="/login" className="font-medium text-brand-primary hover:text-brand-primaryHover">
            Voltar para o login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
