export interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
  enableMockFallback: boolean;
  isDev: boolean;
  isProd: boolean;
}

export const env: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  enableMockFallback: import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
