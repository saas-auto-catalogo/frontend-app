import { env } from '../../config/env.js';
import { ApiError } from '../../types/api.js';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  tenantId?: string;
  authToken?: string;
}

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

  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      params,
      timeout = this.defaultTimeout,
      tenantId = 'default-tenant',
      authToken,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(endpoint, params);

    const headers = new Headers(customHeaders);
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');
    headers.set('x-tenant-id', tenantId);

    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Tratamento de respostas sem corpo (ex: 204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseData = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage =
          responseData?.error?.message ||
          responseData?.message ||
          `Erro na requisição: HTTP ${response.status}`;

        const errorCode = responseData?.error?.code || `HTTP_${response.status}`;
        throw new ApiError(errorMessage, response.status, errorCode, responseData);
      }

      // Se a resposta estiver encapsulada em { success: true, data: ... }, extrai o data se conveniente
      return responseData as T;
    } catch (error: any) {
      clearTimeout(timer);

      if (error.name === 'AbortError') {
        throw new ApiError(`Tempo limite de conexão excedido (${timeout}ms)`, 408, 'TIMEOUT');
      }

      if (error instanceof ApiError) {
        throw error;
      }

      // Falhas de rede / servidor offline
      throw new ApiError(
        error.message || 'Falha de conexão com o servidor de API backend',
        503,
        'NETWORK_ERROR',
        error
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
      body: body instanceof FormData ? body : JSON.stringify(body),
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
