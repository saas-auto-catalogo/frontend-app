import { httpClient } from './httpClient.js';
import type {
  CreateWorkspaceCheckoutSessionPayload,
  CheckoutSessionResponse,
} from '../../types/billing.js';

export type SubscriptionStatus =
  | 'NONE'
  | 'ACTIVE'
  | 'TRIALING'
  | 'EXPIRED'
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

export interface InvoiceItem {
  id: string;
  number: string;
  createdAt: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
}

export interface InvoicesPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoicesResponse {
  items: InvoiceItem[];
  pagination: InvoicesPagination;
}

export interface ListInvoicesOptions {
  page?: number;
  limit?: number;
}

export const billingService = {
  async getWorkspaceBilling(workspaceId: string): Promise<WorkspaceBilling> {
    return httpClient.get<WorkspaceBilling>(`/workspaces/${workspaceId}/billing`);
  },

  async createPortalSession(returnUrl: string): Promise<PortalSessionResponse> {
    return httpClient.post<PortalSessionResponse>('/billing/portal', { returnUrl });
  },

  async getInvoices(
    workspaceId: string,
    options?: ListInvoicesOptions,
  ): Promise<InvoicesResponse> {
    const params: Record<string, string | number | boolean | undefined> = {
      page: options?.page,
      limit: options?.limit,
    };
    return httpClient.get<InvoicesResponse>(
      `/workspaces/${workspaceId}/billing/invoices`,
      { params },
    );
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
