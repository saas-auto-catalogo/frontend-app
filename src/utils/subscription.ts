import type { SubscriptionStatus } from '../services/api/billingService.js';

export function isActiveSubscription(status: SubscriptionStatus): boolean {
  return status === 'ACTIVE' || status === 'TRIALING';
}

export function getSubscriptionGatePath(status: SubscriptionStatus): '/subscribe' | '/settings/billing' {
  return status === 'NONE' ? '/subscribe' : '/settings/billing';
}
