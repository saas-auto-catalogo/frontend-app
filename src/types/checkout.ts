export type CheckoutProvisionStatus = 'PENDING_REGISTRATION' | 'COMPLETED';

export interface CheckoutSessionStatus {
  sessionId: string;
  status: CheckoutProvisionStatus;
  customerEmail: string;
  dealershipName: string;
  planTier: string | null;
  subscriptionStatus: string | null;
  provisioned: boolean;
  expiresAt: string;
}
