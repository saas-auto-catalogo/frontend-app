export interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
  enableMockFallback: boolean;
  marketingUrl: string;
  marketingCheckoutUrl: string;
  checkoutSuccessPath: string;
  isDev: boolean;
  isProd: boolean;
}

export const env: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  enableMockFallback: import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true',
  marketingUrl: import.meta.env.VITE_MARKETING_URL || '',
  marketingCheckoutUrl: import.meta.env.VITE_MARKETING_CHECKOUT_URL || '',
  checkoutSuccessPath: import.meta.env.VITE_CHECKOUT_SUCCESS_PATH || '/register',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
