import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImpersonationBanner } from './ImpersonationBanner.js';
import * as AuthContextModule from '../../context/AuthContext.js';

describe('ImpersonationBanner', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('não deve renderizar nada se o usuário não estiver em impersonation (isImpersonated: false)', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', name: 'Lojista', email: 'lojista@revenda.com', isSuperAdmin: false, avatarUrl: null },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      isImpersonated: false,
      impersonationInfo: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateOnboarding: vi.fn(),
      updateProfile: vi.fn(),
      refreshUser: vi.fn(),
      endImpersonation: vi.fn(),
      startMockImpersonation: vi.fn(),
    });

    const { container } = render(<ImpersonationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar o banner com alerta, nome/id do admin e motivo quando isImpersonated: true', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', name: 'Lojista', email: 'lojista@revenda.com', isSuperAdmin: false, avatarUrl: null },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      isImpersonated: true,
      impersonationInfo: {
        isImpersonated: true,
        impersonatedByUserId: 'admin-super-99',
        impersonationReason: 'Diagnóstico de erro no catálogo XML',
      },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateOnboarding: vi.fn(),
      updateProfile: vi.fn(),
      refreshUser: vi.fn(),
      endImpersonation: vi.fn(),
      startMockImpersonation: vi.fn(),
    });

    render(<ImpersonationBanner />);

    expect(screen.getByText(/Sessão de suporte ativa/i)).toBeInTheDocument();
    expect(screen.getByText(/admin-super-99/i)).toBeInTheDocument();
    expect(screen.getByText(/Diagnóstico de erro no catálogo XML/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Encerrar sessão de suporte/i })).toBeInTheDocument();
  });

  it('não deve conter nenhum botão para fechar ou ocultar o banner (regra da indestrutibilidade)', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', name: 'Lojista', email: 'lojista@revenda.com', isSuperAdmin: false, avatarUrl: null },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      isImpersonated: true,
      impersonationInfo: {
        isImpersonated: true,
        impersonatedByUserId: 'admin-super-99',
        impersonationReason: 'Verificação técnica',
      },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateOnboarding: vi.fn(),
      updateProfile: vi.fn(),
      refreshUser: vi.fn(),
      endImpersonation: vi.fn(),
      startMockImpersonation: vi.fn(),
    });

    render(<ImpersonationBanner />);

    const buttons = screen.getAllByRole('button');
    // Deve haver apenas o botão de encerrar sessão
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent(/Encerrar sessão de suporte/i);
    expect(screen.queryByLabelText(/fechar/i)).toBeNull();
    expect(screen.queryByTitle(/fechar/i)).toBeNull();
  });

  it('deve chamar endImpersonation ao clicar no botão de encerrar', async () => {
    const user = userEvent.setup();
    const endImpersonationMock = vi.fn().mockResolvedValue(undefined);

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', name: 'Lojista', email: 'lojista@revenda.com', isSuperAdmin: false, avatarUrl: null },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      isImpersonated: true,
      impersonationInfo: {
        isImpersonated: true,
        impersonatedByUserId: 'admin-super-99',
        impersonationReason: 'Ajuste de feed',
      },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateOnboarding: vi.fn(),
      updateProfile: vi.fn(),
      refreshUser: vi.fn(),
      endImpersonation: endImpersonationMock,
      startMockImpersonation: vi.fn(),
    });

    render(<ImpersonationBanner />);

    const endButton = screen.getByRole('button', { name: /Encerrar sessão de suporte/i });
    await user.click(endButton);

    expect(endImpersonationMock).toHaveBeenCalledTimes(1);
  });
});
