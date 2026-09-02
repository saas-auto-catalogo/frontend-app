import { env } from '../config/env.js';

export function getCheckoutSessionId(searchParams: URLSearchParams): string | null {
  return searchParams.get('session_id') || searchParams.get('checkoutSessionId');
}

export function buildAuthPathWithSession(
  basePath: '/login' | '/register',
  sessionId: string | null,
): string {
  if (!sessionId) return basePath;
  return `${basePath}?session_id=${encodeURIComponent(sessionId)}`;
}

export function getMarketingCheckoutRetryUrl(): string {
  if (env.marketingCheckoutUrl) {
    return env.marketingCheckoutUrl;
  }
  if (env.marketingUrl) {
    return `${env.marketingUrl.replace(/\/$/, '')}/checkout`;
  }
  return '';
}
