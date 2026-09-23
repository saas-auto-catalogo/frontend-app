import { describe, expect, it } from 'vitest';
import { classifyMetaFormError } from './metaFormError.js';

describe('classifyMetaFormError', () => {
  it('classifica erro de permissão da Meta como permission', () => {
    expect(classifyMetaFormError('(#200) Requires the leads permission for the page')).toBe(
      'permission',
    );
    expect(classifyMetaFormError('Falha na Meta Marketing API: (#190) This method must be called with a Page Access Token')).toBe(
      'permission',
    );
    expect(classifyMetaFormError('A página não possui permissão para leadgen_forms')).toBe(
      'permission',
    );
  });

  it('classifica erros de autenticação como auth', () => {
    expect(classifyMetaFormError('Token de acesso Meta não fornecido. Informe x-meta-session-token.')).toBe(
      'auth',
    );
    expect(classifyMetaFormError('Sessão Meta expirada ou inválida')).toBe('auth');
    expect(classifyMetaFormError('MetaTokenUnavailableError: Reconecte a integração Meta.')).toBe(
      'auth',
    );
  });

  it('classifica mensagens desconhecidas como other', () => {
    expect(classifyMetaFormError('Erro de formação')).toBe('other');
    expect(classifyMetaFormError('')).toBe('other');
  });
});