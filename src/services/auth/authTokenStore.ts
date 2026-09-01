import type { RefreshResponse } from '../../types/auth.js';

type RefreshFn = () => Promise<RefreshResponse>;
type UnauthorizedFn = () => void;

let accessToken: string | null = null;
let refreshFn: RefreshFn | null = null;
let onUnauthorized: UnauthorizedFn | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const pendingRequests: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

function flushPending(token: string | null, error?: unknown): void {
  while (pendingRequests.length > 0) {
    const pending = pendingRequests.shift();
    if (!pending) continue;
    if (error) {
      pending.reject(error);
    } else {
      pending.resolve(token);
    }
  }
}

export const authTokenStore = {
  getAccessToken(): string | null {
    return accessToken;
  },

  setAccessToken(token: string | null): void {
    accessToken = token;
  },

  setRefreshFn(fn: RefreshFn): void {
    refreshFn = fn;
  },

  setOnUnauthorized(fn: UnauthorizedFn): void {
    onUnauthorized = fn;
  },

  clearSession(): void {
    accessToken = null;
    onUnauthorized?.();
  },

  async refreshAccessToken(): Promise<string | null> {
    if (!refreshFn) {
      return null;
    }

    if (refreshPromise) {
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = new Promise<string | null>((resolve, reject) => {
      pendingRequests.push({ resolve, reject });
    });

    try {
      const result = await refreshFn();
      accessToken = result.accessToken;
      flushPending(result.accessToken);
      return result.accessToken;
    } catch (error) {
      accessToken = null;
      flushPending(null, error);
      onUnauthorized?.();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  },

  get isRefreshing(): boolean {
    return isRefreshing;
  },
};
