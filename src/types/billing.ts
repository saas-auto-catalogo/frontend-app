export type PlanTier = 'STARTER' | 'PRO' | 'ENTERPRISE';
export type BillingInterval = 'MONTHLY' | 'YEARLY';

export interface CreateWorkspaceCheckoutSessionPayload {
  plan: PlanTier;
  billingInterval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export const PLAN_OPTIONS: Array<{
  id: PlanTier;
  name: string;
  description: string;
  highlight?: boolean;
}> = [
  {
    id: 'STARTER',
    name: 'Starter',
    description: 'Ideal para revendas iniciando no catálogo digital.',
  },
  {
    id: 'PRO',
    name: 'Pro',
    description: 'Recursos avançados para equipes em crescimento.',
    highlight: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'Escala e suporte prioritário para operações maiores.',
  },
];

export function parsePlanTier(value: string | null): PlanTier {
  if (value === 'STARTER' || value === 'PRO' || value === 'ENTERPRISE') {
    return value;
  }
  return 'PRO';
}
