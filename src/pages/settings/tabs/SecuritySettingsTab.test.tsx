import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SecuritySettingsTab } from './SecuritySettingsTab.js';
import * as AuthContextModule from '../../../context/AuthContext.js';

describe('SecuritySettingsTab - Impersonation restrictions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve exibir aviso de segurança e bloquear alteração de senha quando em modo impersonation', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', name: 'Lojista', email: 'lojista@revenda.com', isSuperAdmin: false, avatarUrl: null, isImpersonated: true },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      isImpersonated: true,
      impersonationInfo: {
        isImpersonated: true,
        impersonatedByUserId: 'admin-super',
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

    render(<SecuritySettingsTab />);

    expect(screen.getByText(/Ações de segurança bloqueadas em modo de suporte/i)).toBeInTheDocument();
  });
});
