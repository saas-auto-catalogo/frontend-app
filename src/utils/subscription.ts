import type { SubscriptionStatus } from '../services/api/billingService.js';

export function isActiveSubscription(status: SubscriptionStatus): boolean {
  return status === 'ACTIVE' || status === 'TRIALING';
}

export function isTrialing(status: SubscriptionStatus): boolean {
  return status === 'TRIALING';
}

export function getTrialDaysRemaining(currentPeriodEnd: string | null): number | null {
  if (!currentPeriodEnd) return null;

  const endMs = new Date(currentPeriodEnd).getTime();
  const diffMs = endMs - Date.now();
  if (diffMs <= 0) return null;

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getSubscriptionGatePath(status: SubscriptionStatus): '/subscribe' | '/settings/billing' {
  if (status === 'NONE' || status === 'EXPIRED') {
    return '/subscribe';
  }
  return '/settings/billing';
}
