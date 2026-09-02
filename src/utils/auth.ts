import type { AuthUser } from '../types/auth.js';

export function getPostAuthPath(user: AuthUser, fallback = '/'): string {
  return user.onboardingCompleted === false ? '/onboarding' : fallback;
}
