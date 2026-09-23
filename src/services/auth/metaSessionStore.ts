const STORAGE_PREFIX = 'ds_meta_session_';

let currentWorkspaceId: string | null = null;

export interface MetaSessionStore {
  getMetaSessionToken(workspaceId?: string | null): string | null;
  setMetaSessionToken(workspaceId: string, token: string | null): void;
  clearMetaSessionToken(workspaceId?: string | null): void;
  setCurrentWorkspace(workspaceId: string | null): void;
  clearAllMetaSessionTokens(): void;
}

function storageKey(workspaceId: string): string {
  return `${STORAGE_PREFIX}${workspaceId}`;
}

function resolveWorkspace(workspaceId?: string | null): string | null {
  return workspaceId ?? currentWorkspaceId;
}

export const metaSessionStore: MetaSessionStore = {
  getMetaSessionToken(workspaceId?: string | null): string | null {
    const resolved = resolveWorkspace(workspaceId);
    try {
      if (resolved) {
        const direct = window.localStorage.getItem(storageKey(resolved));
        if (direct !== null) {
          return direct;
        }

        // Fallback resiliente: se a chave exata do workspace não for
        // encontrada (pequeno descasamento de identificadores de tenant),
        // percorre as chaves `ds_meta_session_*`. O fallback só é aplicado
        // quando há exatamente UM token armazenado — com múltiplos tenants
        // emissários o resultado seria ambíguo e poderia vazar tokens entre
        // workspaces.
        let fallbackToken: string | null = null;
        let fallbackCount = 0;
        for (let i = 0; i < window.localStorage.length; i += 1) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith(STORAGE_PREFIX)) {
            const value = window.localStorage.getItem(key);
            if (value !== null) {
              fallbackToken = value;
              fallbackCount += 1;
            }
          }
        }
        if (fallbackCount === 1) {
          return fallbackToken;
        }
      }
    } catch {
      // localStorage indisponível (modo privado/SSR).
    }
    return null;
  },

  setMetaSessionToken(workspaceId: string, token: string | null): void {
    try {
      if (token == null) {
        window.localStorage.removeItem(storageKey(workspaceId));
      } else {
        window.localStorage.setItem(storageKey(workspaceId), token);
      }
    } catch {
      // localStorage indisponível (modo privado/SSR): segue sem persistência.
    }
  },

  clearMetaSessionToken(workspaceId?: string | null): void {
    const resolved = resolveWorkspace(workspaceId);
    if (!resolved) return;
    try {
      window.localStorage.removeItem(storageKey(resolved));
    } catch {
      // ignora erros de storage.
    }
  },

  setCurrentWorkspace(workspaceId: string | null): void {
    currentWorkspaceId = workspaceId;
  },

  clearAllMetaSessionTokens(): void {
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keys.push(key);
        }
      }
      for (const key of keys) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignora erros de storage.
    }
    currentWorkspaceId = null;
  },
};