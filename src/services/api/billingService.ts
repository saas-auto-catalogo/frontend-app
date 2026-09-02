import { httpClient } from './httpClient.js';
import type {
  CreateWorkspaceCheckoutSessionPayload,
  CheckoutSessionResponse,
} from '../../types/billing.js';

export type SubscriptionStatus =
  | 'NONE'
  | 'ACTIVE'
  | 'TRIALING'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'SUSPENDED';

export interface PlanLimits {
  name: string;
  maxVehicles: number;
  maxFeeds: number;
  maxMembers: number;
  maxMetaCatalogs: number;
  hasAiBlogWorker: boolean;
  hasPrioritySupport: boolean;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
}

export interface WorkspaceBilling {
  workspaceId: string;
  planTier: string | null;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: PlanLimits | null;
}

export interface PortalSessionResponse {
  url: string;
}

export const billingService = {
  async getWorkspaceBilling(workspaceId: string): Promise<WorkspaceBilling> {
    return httpClient.get<WorkspaceBilling>(`/workspaces/${workspaceId}/billing`);
  },

  async createPortalSession(returnUrl: string): Promise<PortalSessionResponse> {
    return httpClient.post<PortalSessionResponse>('/billing/portal', { returnUrl });
  },

  async createWorkspaceCheckoutSession(
    workspaceId: string,
    payload: CreateWorkspaceCheckoutSessionPayload,
  ): Promise<CheckoutSessionResponse> {
    return httpClient.post<CheckoutSessionResponse>(
      `/workspaces/${workspaceId}/checkout/stripe/session`,
      payload,
    );
  },
};
