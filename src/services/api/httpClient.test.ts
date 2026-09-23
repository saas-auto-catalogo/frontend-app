import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from './httpClient.js';
import { campaignService } from './campaignService.js';
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

  it('não apaga token válido em 401 quando o cabeçalho nem foi enviado (token ausente)', async () => {
    // `ws-1` possui token legítimo, mas a requisição (tenant ws-2) encontra um
    // fallback ambíguo (2 tokens) e não envia x-meta-session-token. O 401 de
    // "token não fornecido" não pode destruir o token válido já armazenado.
    metaSessionStore.setMetaSessionToken('ws-1', 'token-meta-123');
    metaSessionStore.setMetaSessionToken('ws-3', 'token-outro');

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        mockFetchResponse(401, {
          detail: 'Token de acesso Meta não fornecido. Informe x-meta-session-token.',
        }),
      ),
    );

    await expect(httpClient.get('/meta/ad-accounts', { tenantId: 'ws-2' })).rejects.toThrow();
    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBe('token-meta-123');
  });

  it('não apaga o token em 401 genérico mesmo com cabeçalho enviado', async () => {
    // Cabeçalho foi enviado, mas a mensagem não indica sessão inválida/expirada:
    // o guardrail preserva o token para não destruir sessões legítimas.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => mockFetchResponse(401, { detail: 'Unauthorized' })),
    );

    await expect(httpClient.get('/meta/ad-accounts', { tenantId: 'ws-1' })).rejects.toThrow();
    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBe('token-meta-123');
  });
});

describe('campaignService: propagação de workspaceId como tenantId (G4)', () => {
  let captured: Headers | null = null;

  const captureFetch = vi.fn(async (_url: string, init?: RequestInit) => {
    captured = (init?.headers as Headers) ?? null;
    return mockFetchResponse();
  });

  beforeEach(() => {
    captured = null;
    window.localStorage.clear();
    metaSessionStore.setCurrentWorkspace(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    metaSessionStore.setCurrentWorkspace(null);
  });

  it('listAdAccounts envia x-tenant-id e injeta o token do workspace informado', async () => {
    metaSessionStore.setMetaSessionToken('ws-77', 'token-ws77');
    vi.stubGlobal('fetch', captureFetch);

    await campaignService.listAdAccounts('ws-77');

    expect(captured).not.toBeNull();
    expect(captured?.get('x-tenant-id')).toBe('ws-77');
    expect(captured?.get('x-meta-session-token')).toBe('token-ws77');
  });

  it('listPages envia x-tenant-id do workspace informado', async () => {
    vi.stubGlobal('fetch', captureFetch);

    await campaignService.listPages('ws-77');

    expect(captured?.get('x-tenant-id')).toBe('ws-77');
  });

  it('createCampaign envia x-tenant-id e injeta o token do workspace', async () => {
    metaSessionStore.setMetaSessionToken('ws-77', 'token-ws77');
    vi.stubGlobal('fetch', captureFetch);

    await campaignService.createCampaign(
      {
        name: 'Campanha Teste',
        destinationType: 'WHATSAPP_MESSAGE',
        adAccountId: 'act_123',
        pageId: '1029384756',
        dailyBudget: 3000,
        startDate: '2026-01-01T10:00:00Z',
        whatsappNumber: '+5511999876543',
      },
      'ws-77',
    );

    expect(captured).not.toBeNull();
    expect(captured?.get('x-tenant-id')).toBe('ws-77');
    expect(captured?.get('x-meta-session-token')).toBe('token-ws77');
  });
});

describe('campaignService.listLeadForms: injeção de x-meta-access-token', () => {
  let captured: Headers | null = null;

  const captureFetch = vi.fn(async (_url: string, init?: RequestInit) => {
    captured = (init?.headers as Headers) ?? null;
    return mockFetchResponse(200, { items: [] });
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

  it('injeta x-meta-access-token com o token da página quando disponível', async () => {
    vi.stubGlobal('fetch', captureFetch);
    await campaignService.listLeadForms('page-123', 'token-page-abc');

    expect(captured).not.toBeNull();
    expect(captured?.get('x-meta-access-token')).toBe('token-page-abc');
    expect(captured?.get('x-meta-session-token')).toBe('token-meta-123');
    expect(captured?.get('x-tenant-id')).toBe('default-tenant');
  });

  it('não envia x-meta-access-token quando a página não possui token próprio', async () => {
    vi.stubGlobal('fetch', captureFetch);
    await campaignService.listLeadForms('page-456');

    expect(captured).not.toBeNull();
    expect(captured?.get('x-meta-access-token')).toBeNull();
    expect(captured?.get('x-meta-session-token')).toBe('token-meta-123');
  });
});