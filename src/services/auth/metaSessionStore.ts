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
    if (!resolved) return null;
    try {
      return window.localStorage.getItem(storageKey(resolved));
    } catch {
      return null;
    }
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