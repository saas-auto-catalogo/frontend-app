import { env } from '../../config/env.js';
import { ApiError } from '../../types/api.js';
import { authTokenStore } from '../auth/authTokenStore.js';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  tenantId?: string;
  authToken?: string;
  skipAuthRefresh?: boolean;
}

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];

export class HttpClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string = env.apiUrl, defaultTimeout: number = env.apiTimeout) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultTimeout = defaultTimeout;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private isAuthEndpoint(endpoint: string): boolean {
    const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return AUTH_ENDPOINTS.some((path) => normalized === path || normalized.startsWith(`${path}?`));
  }

  private resolveAuthToken(explicitToken?: string): string | undefined {
    return explicitToken ?? authTokenStore.getAccessToken() ?? undefined;
  }

  private parseErrorMessage(responseData: any, status: number): string {
    return (
      responseData?.error?.message ||
      responseData?.detail ||
      responseData?.message ||
      `Erro na requisição: HTTP ${status}`
    );
  }

  public async request<T = any>(endpoint: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
    const {
      params,
      timeout = this.defaultTimeout,
      tenantId = 'default-tenant',
      authToken,
      skipAuthRefresh = false,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(endpoint, params);
    const resolvedToken = this.resolveAuthToken(authToken);

    const headers = new Headers(customHeaders);
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');
    headers.set('x-tenant-id', tenantId);

    if (resolvedToken) {
      headers.set('Authorization', `Bearer ${resolvedToken}`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.status === 204) {
        return {} as T;
      }

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseData = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage = this.parseErrorMessage(responseData, response.status);
        const errorCode = responseData?.error?.code || `HTTP_${response.status}`;
        const apiError = new ApiError(errorMessage, response.status, errorCode, responseData);

        if (
          response.status === 401 &&
          !skipAuthRefresh &&
          !isRetry &&
          !this.isAuthEndpoint(endpoint)
        ) {
          const newToken = await authTokenStore.refreshAccessToken();
          if (newToken) {
            return this.request<T>(endpoint, options, true);
          }
        }

        throw apiError;
      }

      return responseData as T;
    } catch (error: any) {
      clearTimeout(timer);

      if (error.name === 'AbortError') {
        throw new ApiError(`Tempo limite de conexão excedido (${timeout}ms)`, 408, 'TIMEOUT');
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error.message || 'Falha de conexão com o servidor de API backend',
        503,
        'NETWORK_ERROR',
        error,
      );
    }
  }

  public get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
