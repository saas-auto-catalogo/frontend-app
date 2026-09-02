import type { AuthUser } from '../types/auth.js';
import type { WorkspaceBilling } from '../services/api/billingService.js';
import { getSubscriptionGatePath, isActiveSubscription } from './subscription.js';

export function getPostAuthPath(
  user: AuthUser,
  billing: WorkspaceBilling | null | undefined,
  fallback = '/',
): string {
  if (user.isSuperAdmin) {
    return user.onboardingCompleted === false ? '/onboarding' : fallback;
  }

  if (billing && !isActiveSubscription(billing.status)) {
    return getSubscriptionGatePath(billing.status);
  }

  return user.onboardingCompleted === false ? '/onboarding' : fallback;
}
