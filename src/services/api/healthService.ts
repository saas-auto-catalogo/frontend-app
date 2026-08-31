import { httpClient } from './httpClient.js';

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime?: number;
  environment?: string;
}

export const healthService = {
  async checkHealth(): Promise<HealthCheckResponse> {
    try {
      // Tenta checar o health endpoint da API
      const res = await httpClient.get<HealthCheckResponse>('/health', { timeout: 3000 });
      return res;
    } catch {
      // Fallback gracioso
      return {
        status: 'offline',
        timestamp: new Date().toISOString(),
      };
    }
  },
};
