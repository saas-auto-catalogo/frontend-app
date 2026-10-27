import { describe, it, expect } from 'vitest';
import { decodeJwtPayload } from './jwt.js';

describe('decodeJwtPayload', () => {
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



  it('deve decodificar payload de JWT válido com sucesso', () => {
    const payload = {
      sub: 'user-123',
      email: 'lojista@revenda.com.br',
      name: 'Lojista Teste',
      role: 'OWNER',
    };
    const token = makeMockJwt(payload);

    const result = decodeJwtPayload(token);
    expect(result).not.toBeNull();
    expect(result?.sub).toBe('user-123');
    expect(result?.email).toBe('lojista@revenda.com.br');
    expect(result?.role).toBe('OWNER');
    expect(result?.isImpersonated).toBeUndefined();
  });

  it('deve decodificar claims de impersonation quando presentes no JWT', () => {
    const payload = {
      sub: 'owner-456',
      email: 'owner@revenda.com',
      workspaceId: 'ws-789',
      role: 'OWNER',
      isImpersonated: true,
      impersonatedByUserId: 'admin-super-01',
      impersonationReason: 'Auditoria de feeds XML',
      impersonationSessionId: 'sess-abc-123',
    };
    const token = makeMockJwt(payload);

    const result = decodeJwtPayload(token);
    expect(result).not.toBeNull();
    expect(result?.isImpersonated).toBe(true);
    expect(result?.impersonatedByUserId).toBe('admin-super-01');
    expect(result?.impersonationReason).toBe('Auditoria de feeds XML');
    expect(result?.impersonationSessionId).toBe('sess-abc-123');
  });

  it('deve retornar null de forma segura para tokens inválidos, vazios ou malformados', () => {
    expect(decodeJwtPayload('')).toBeNull();
    expect(decodeJwtPayload('invalid-string')).toBeNull();
    expect(decodeJwtPayload('part1.part2')).toBeNull();
    expect(decodeJwtPayload('part1.part2.part3.part4')).toBeNull();
    expect(decodeJwtPayload('not_base64.not_json.sig')).toBeNull();
  });
});
