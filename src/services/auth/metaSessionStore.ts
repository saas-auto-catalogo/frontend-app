const STORAGE_PREFIX = 'ds_meta_session_';
const CURRENT_WORKSPACE_KEY = 'ds_meta_current_workspace';

function readPersistedWorkspace(): string | null {
  try {
    return window.localStorage.getItem(CURRENT_WORKSPACE_KEY);
  } catch {
    return null;
  }
}

// Sobrevive a recarregamentos de página: restaura o workspace corrente a partir
// do localStorage antes mesmo do bootstrap assíncrono do AuthContext concluir.
let currentWorkspaceId: string | null = readPersistedWorkspace();

export interface MetaSessionStore {
  getMetaSessionToken(workspaceId?: string | null): string | null;
  setMetaSessionToken(workspaceId: string, token: string | null): void;
  clearMetaSessionToken(workspaceId?: string | null): void;
  setCurrentWorkspace(workspaceId: string | null): void;
  getCurrentWorkspace(): string | null;
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
      }

      // Fallback resiliente e incondicional: se houver exatamente UM token
      // armazenado, utiliza-o mesmo quando `resolved` for null (código executando
      // antes do bootstrap do AuthContext/uso do tenant). Com múltiplos tenants
      // emissários o resultado seria ambíguo e poderia vazar tokens entre
      // workspaces — nesse caso o fallback é suprimido.
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
        // Gravar um token vincula o workspace à sessão corrente e persiste a
        // identificação para recarregamentos e redirecionamentos.
        currentWorkspaceId = workspaceId;
        window.localStorage.setItem(CURRENT_WORKSPACE_KEY, workspaceId);
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
    try {
      if (workspaceId == null) {
        window.localStorage.removeItem(CURRENT_WORKSPACE_KEY);
      } else {
        window.localStorage.setItem(CURRENT_WORKSPACE_KEY, workspaceId);
      }
    } catch {
      // localStorage indisponível (modo privado/SSR).
    }
  },

  getCurrentWorkspace(): string | null {
    return currentWorkspaceId;
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
      window.localStorage.removeItem(CURRENT_WORKSPACE_KEY);
    } catch {
      // ignora erros de storage.
    }
    currentWorkspaceId = null;
  },
};