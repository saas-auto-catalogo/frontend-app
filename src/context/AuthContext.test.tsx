import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext.js';
import { authService } from '../services/api/authService.js';
import { impersonationService } from '../services/api/impersonationService.js';
import { authTokenStore } from '../services/auth/authTokenStore.js';
import { env } from '../config/env.js';

describe('AuthContext - Impersonation Flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    authTokenStore.setAccessToken(null);
  });

  function makeMockJwt(payload: Record<string, unknown>): string {
    const json = JSON.stringify(payload);
    const utf8Bytes = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    );
    const body = btoa(utf8Bytes)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `eyJhbGciOiJIUzI1NiJ9.${body}.signature`;
  }



  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('deve capturar impersonate_token da URL, limpar o parâmetro e configurar isImpersonated: true', async () => {
    const impersonatePayload = {
      sub: 'owner-uuid-123',
      email: 'owner@loja.com.br',
      name: 'Proprietário Loja',
      isImpersonated: true,
      impersonatedByUserId: 'super-admin-uuid-999',
      impersonationReason: 'Verificação técnica urgente',
      impersonationSessionId: 'session-uuid-001',
    };
    const token = makeMockJwt(impersonatePayload);

    // Simula URL com ?impersonate_token=...
    delete (window as any).location;
    window.location = new URL(`https://app.drivesync.me/?impersonate_token=${token}`) as any;

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    vi.spyOn(authService, 'getMe').mockResolvedValueOnce({
      user: {
        id: 'owner-uuid-123',
        email: 'owner@loja.com.br',
        name: 'Proprietário Loja',
        avatarUrl: null,
        isSuperAdmin: false,
        isImpersonated: true,
        impersonatedByUserId: 'super-admin-uuid-999',
        impersonationReason: 'Verificação técnica urgente',
        impersonationSessionId: 'session-uuid-001',
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isImpersonated).toBe(true);
    expect(result.current.impersonationInfo?.impersonatedByUserId).toBe('super-admin-uuid-999');
    expect(result.current.impersonationInfo?.impersonationReason).toBe('Verificação técnica urgente');
    expect(result.current.accessToken).toBe(token);
    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it('deve executar endImpersonation chamando API, limpando sessão e redirecionando ao backoffice', async () => {
    const token = makeMockJwt({
      sub: 'owner-uuid',
      isImpersonated: true,
      impersonatedByUserId: 'admin-1',
      impersonationReason: 'Suporte',
    });

    delete (window as any).location;
    window.location = new URL(`https://app.drivesync.me/?impersonate_token=${token}`) as any;

    vi.spyOn(authService, 'getMe').mockResolvedValueOnce({
      user: {
        id: 'owner-uuid',
        email: 'owner@loja.com.br',
        name: 'Proprietário Loja',
        avatarUrl: null,
        isSuperAdmin: false,
        isImpersonated: true,
      },
    });

    const endSpy = vi.spyOn(impersonationService, 'endImpersonation').mockResolvedValueOnce({
      message: 'Sessão encerrada',
    });

    let assignedUrl = '';
    delete (window as any).location;
    window.location = {
      href: `https://app.drivesync.me/?impersonate_token=${token}`,
      search: `?impersonate_token=${token}`,
      pathname: '/',
      assign: (url: string) => {
        assignedUrl = url;
      },
    } as any;

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.endImpersonation();
    });

    expect(endSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isImpersonated).toBe(false);
    expect(assignedUrl).toBe(env.backofficeUrl);
  });
});
