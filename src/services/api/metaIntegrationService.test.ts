import { beforeEach, describe, expect, it } from 'vitest';
import { consumeOAuthReturnTo, peekOAuthReturnTo, saveOAuthReturnTo } from './metaIntegrationService.js';

const KEY = 'ds_meta_oauth_return_to';

describe('OAuth returnTo helpers (metaIntegrationService)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('salva e recupera a rota de origem', () => {
    saveOAuthReturnTo('/campaigns/new');
    expect(peekOAuthReturnTo()).toBe('/campaigns/new');
  });

  it('peek não consome o valor registrado', () => {
    saveOAuthReturnTo('/campaigns/new');
    peekOAuthReturnTo();
    expect(peekOAuthReturnTo()).toBe('/campaigns/new');
  });

  it('consume lê e remove a rota registrada', () => {
    saveOAuthReturnTo('/campaigns/new');
    expect(consumeOAuthReturnTo()).toBe('/campaigns/new');
    expect(peekOAuthReturnTo()).toBe('/');
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
  });

  it('usa o fallback padrão quando nada foi registrado', () => {
    expect(peekOAuthReturnTo()).toBe('/');
    expect(consumeOAuthReturnTo('/')).toBe('/');
  });

  it('rejeita rotas externas/protocolo-relativas (open redirect)', () => {
    saveOAuthReturnTo('https://evil.com');
    expect(peekOAuthReturnTo('/')).toBe('/');

    saveOAuthReturnTo('//evil.com');
    expect(peekOAuthReturnTo('/')).toBe('/');
  });
});