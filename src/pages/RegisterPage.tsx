import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout.js';
import { AuthFormField } from '../components/auth/AuthFormField.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { ApiError } from '../types/api.js';
import { isValidEmail, isValidPassword, passwordsMatch } from '../utils/validation.js';
import { getPostAuthPath } from '../utils/auth.js';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        workspaceName: workspaceName.trim(),
      });
      navigate(getPostAuthPath(user), { replace: true });
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

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle="Cadastre sua revenda e comece a publicar seu catálogo."
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

        <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
          Criar conta
        </Button>

        <p className="text-center text-sm text-typography-muted">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-brand-primary hover:text-brand-primaryHover">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
