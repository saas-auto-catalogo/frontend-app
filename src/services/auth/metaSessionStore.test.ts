import { beforeEach, describe, expect, it } from 'vitest';
import { metaSessionStore } from './metaSessionStore.js';

const PRE = 'ds_meta_session_';

describe('metaSessionStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    metaSessionStore.setCurrentWorkspace(null);
  });

  it('retorna null quando não há token salvo', () => {
    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBeNull();
    expect(metaSessionStore.getMetaSessionToken()).toBeNull();
  });

  it('salva e recupera token por workspaceId', () => {
    metaSessionStore.setMetaSessionToken('ws-1', 'token-a');
    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBe('token-a');
  });

  it('segrega tokens entre workspaces (sem vazamento de tenants)', () => {
    metaSessionStore.setMetaSessionToken('ws-1', 'token-a');
    metaSessionStore.setMetaSessionToken('ws-2', 'token-b');
    metaSessionStore.setMetaSessionToken('ws-3', 'token-c');

    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBe('token-a');
    expect(metaSessionStore.getMetaSessionToken('ws-2')).toBe('token-b');
    expect(metaSessionStore.getMetaSessionToken('ws-3')).toBe('token-c');

    metaSessionStore.clearMetaSessionToken('ws-1');
    // Com múltiplos tokens residuais, o fallback de prefixo é ambíguo e não
    // deve vazar o token de outro workspace para o ws-1.
    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBeNull();
    expect(metaSessionStore.getMetaSessionToken('ws-2')).toBe('token-b');
    expect(metaSessionStore.getMetaSessionToken('ws-3')).toBe('token-c');
  });

  it('remove a chave ao salvar null', () => {
    metaSessionStore.setMetaSessionToken('ws-1', 'token-a');
    metaSessionStore.setMetaSessionToken('ws-1', null);
    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBeNull();
    expect(window.localStorage.getItem(`${PRE}ws-1`)).toBeNull();
  });

  it('resolve o token do workspace atual quando workspaceId é omitido', () => {
    metaSessionStore.setCurrentWorkspace('ws-3');
    metaSessionStore.setMetaSessionToken('ws-3', 'token-atual');
    expect(metaSessionStore.getMetaSessionToken()).toBe('token-atual');
    expect(metaSessionStore.getMetaSessionToken(null)).toBe('token-atual');
  });

  it('faz fallback resiliente quando a chave exata não existe, mas há um único token com prefixo', () => {
    metaSessionStore.setCurrentWorkspace('ws-1');
    metaSessionStore.setMetaSessionToken('ws-2', 'token-fallback');

    expect(metaSessionStore.getMetaSessionToken()).toBe('token-fallback');
    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBe('token-fallback');
  });

  it('não aplica fallback ambíguo quando há múltiplos tokens de tenants distintos', () => {
    metaSessionStore.setCurrentWorkspace('ws-1');
    metaSessionStore.setMetaSessionToken('ws-2', 'token-b');
    metaSessionStore.setMetaSessionToken('ws-3', 'token-c');

    expect(metaSessionStore.getMetaSessionToken()).toBeNull();
    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBeNull();
  });

  it('prioriza a chave direta do workspace sobre o fallback de prefixo', () => {
    metaSessionStore.setCurrentWorkspace('ws-1');
    metaSessionStore.setMetaSessionToken('ws-1', 'token-direto');
    metaSessionStore.setMetaSessionToken('ws-2', 'token-fallback');

    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBe('token-direto');
  });

  it('clearAllMetaSessionTokens remove todos os tokens de todos os workspaces', () => {
    metaSessionStore.setMetaSessionToken('ws-1', 'token-a');
    metaSessionStore.setMetaSessionToken('ws-2', 'token-b');
    metaSessionStore.setCurrentWorkspace('ws-1');

    metaSessionStore.clearAllMetaSessionTokens();

    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBeNull();
    expect(metaSessionStore.getMetaSessionToken('ws-2')).toBeNull();
    expect(metaSessionStore.getMetaSessionToken()).toBeNull();
  });

  it('limpa o workspace corrente após clearAll', () => {
    metaSessionStore.setCurrentWorkspace('ws-1');
    metaSessionStore.setMetaSessionToken('ws-1', 'token-a');
    metaSessionStore.clearAllMetaSessionTokens();
    metaSessionStore.setMetaSessionToken('ws-1', 'token-b');
    expect(metaSessionStore.getMetaSessionToken()).toBeNull();
    expect(metaSessionStore.getMetaSessionToken('ws-1')).toBe('token-b');
  });
});