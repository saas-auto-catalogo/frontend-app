import { httpClient } from './httpClient.js';
import type { CheckoutSessionStatus } from '../../types/checkout.js';

export const checkoutService = {
  async getStripeSessionStatus(sessionId: string): Promise<CheckoutSessionStatus> {
    return httpClient.get<CheckoutSessionStatus>(
      `/checkout/stripe/session/${encodeURIComponent(sessionId)}/status`,
      { skipAuthRefresh: true },
    );
  },
};
