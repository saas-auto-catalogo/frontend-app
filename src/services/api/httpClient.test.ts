import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from './httpClient.js';
import { metaSessionStore } from '../auth/metaSessionStore.js';

function mockFetchResponse(status = 200, body: unknown = { items: [] }): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('httpClient: injeção de x-meta-session-token', () => {
  let captured: Headers | null = null;

  const captureFetch = vi.fn(async (_url: string, init?: RequestInit) => {
    captured = (init?.headers as Headers) ?? null;
    return mockFetchResponse();
  });

  beforeEach(() => {
    captured = null;
    window.localStorage.clear();
    metaSessionStore.setCurrentWorkspace('ws-1');
    metaSessionStore.setMetaSessionToken('ws-1', 'token-meta-123');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    metaSessionStore.setCurrentWorkspace(null);
  });

  it('adiciona o cabeçalho x-meta-session-token em endpoints /meta/* quando token existe', async () => {
    vi.stubGlobal('fetch', captureFetch);
    await httpClient.get('/meta/ad-accounts');

    expect(captured).not.toBeNull();
    expect(captured?.get('x-meta-session-token')).toBe('token-meta-123');
    expect(captured?.get('x-tenant-id')).toBe('default-tenant');
  });

  it('adiciona o cabeçalho em endpoints /integrations/meta/*', async () => {
    vi.stubGlobal('fetch', captureFetch);
    await httpClient.get('/integrations/meta/auth-url');

    expect(captured?.get('x-meta-session-token')).toBe('token-meta-123');
  });

  it('não sobrescreve x-meta-session-token customizado informado pelo chamador', async () => {
    vi.stubGlobal('fetch', captureFetch);
    await httpClient.get('/meta/ad-accounts', {
      headers: { 'x-meta-session-token': 'custom-token' },
    });

    expect(captured?.get('x-meta-session-token')).toBe('custom-token');
  });

  it('não adiciona o cabeçalho em endpoints fora da integração Meta', async () => {
    vi.stubGlobal('fetch', captureFetch);
    await httpClient.get('/workspaces/ws-1/dashboard/stats');

    expect(captured).not.toBeNull();
    expect(captured?.get('x-meta-session-token')).toBeNull();
  });

  it('não envia o cabeçalho quando não há token no store', async () => {
    metaSessionStore.clearMetaSessionToken('ws-1');
    vi.stubGlobal('fetch', captureFetch);
    await httpClient.get('/meta/ad-accounts');

    expect(captured?.get('x-meta-session-token')).toBeNull();
  });

  it('limpa o token local quando o backend responde 401 em endpoint Meta', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => mockFetchResponse(401, { detail: 'Sessão Meta inválida ou expirada' })),
    );

    await expect(httpClient.get('/meta/ad-accounts')).rejects.toThrow();
    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBeNull();
  });
});