import { httpClient } from './httpClient.js';
import type {
  CampaignDestinationType,
  CampaignDTO,
  CampaignStatus,
  CreateCampaignInput,
  MetaAdAccountItem,
  MetaLeadGenFormItem,
  MetaPageItem,
} from '../../types/campaign.js';

export const MIN_DAILY_BUDGET_CENTS = 1500; // R$ 15,00/dia
export const MIN_DAILY_BUDGET_REAIS = MIN_DAILY_BUDGET_CENTS / 100;

const E164_REGEX = /^[1-9]\d{9,14}$/;

export function validateWhatsappE164(raw: string): boolean {
  if (!raw) return false;
  const value = raw.trim();
  if (/[^\d+]/g.test(value)) return false;
  const digits = value.replace(/^\+/, '');
  if (!digits) return false;
  return E164_REGEX.test(digits);
}

function toDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function normalizeWhatsappNumber(raw: string): string {
  let digits = toDigits(raw);
  if (!digits) return '';

  // Se não começa com DDI 55 (Brasil), assume número nacional e adiciona o prefixo
  if (!digits.startsWith('55')) {
    if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    digits = `55${digits}`;
  }

  return `+${digits}`;
}

export function formatPriceBRL(price: number): string {
  return `R$ ${price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface StockTemplateContext {
  make?: string;
  model?: string;
  price?: number;
}

function interpolate(template: string, context: StockTemplateContext): string {
  return template
    .replace(/\{\{make\}\}/g, context.make?.trim() || '')
    .replace(/\{\{model\}\}/g, context.model?.trim() || '')
    .replace(/\{\{price\}\}/g, context.price != null ? formatPriceBRL(context.price) : '');
}

export function applyHeadlineTemplate(template: string, context: StockTemplateContext): string {
  return interpolate(template, context);
}

export function applyMessageTemplate(template: string, context: StockTemplateContext): string {
  return interpolate(template, context);
}

export function buildBudgetPayload(
  dailyBudgetReais: number,
): { dailyBudget: number; lifetimeBudget: undefined } {
  if (!Number.isFinite(dailyBudgetReais) || dailyBudgetReais < MIN_DAILY_BUDGET_REAIS) {
    throw new Error(
      `Orçamento diário mínimo de R$ ${MIN_DAILY_BUDGET_REAIS.toFixed(2)} (${MIN_DAILY_BUDGET_CENTS} centavos).`,
    );
  }
  return {
    dailyBudget: Math.round(dailyBudgetReais * 100),
    lifetimeBudget: undefined,
  };
}

export function validateEndDate(endDate: string, startDate: string): boolean {
  if (!endDate || !startDate) return false;
  return new Date(endDate).getTime() > new Date(startDate).getTime();
}

export interface WizardTransitionContext {
  step: number;
  destinationType?: CampaignDestinationType;
  whatsappNumber?: string;
  metaLeadFormId?: string;
  dailyBudgetReais?: number;
}

export interface TransitionResult {
  valid: boolean;
  message?: string;
}

export function validateWizardTransition(ctx: WizardTransitionContext): TransitionResult {
  switch (ctx.step) {
    case 2: {
      if (ctx.destinationType === 'WHATSAPP_MESSAGE') {
        if (!validateWhatsappE164(ctx.whatsappNumber ?? '')) {
          return {
            valid: false,
            message: 'Informe um número de WhatsApp válido no padrão internacional E.164.',
          };
        }
      } else if (ctx.destinationType === 'INSTANT_LEAD_FORM') {
        if (!ctx.metaLeadFormId) {
          return {
            valid: false,
            message: 'Selecione um formulário instantâneo da página para receber os cadastros.',
          };
        }
      }
      return { valid: true };
    }
    case 4: {
      const budget = ctx.dailyBudgetReais ?? 0;
      if (!Number.isFinite(budget) || budget < MIN_DAILY_BUDGET_REAIS) {
        return {
          valid: false,
          message: `Orçamento diário deve ser de no mínimo R$ ${MIN_DAILY_BUDGET_REAIS.toFixed(2)}.`,
        };
      }
      return { valid: true };
    }
    default:
      return { valid: true };
  }
}

export interface BuildCampaignPayloadInput {
  name: string;
  destinationType: CampaignDestinationType;
  adAccountId: string;
  pageId: string;
  whatsappNumber?: string;
  metaLeadFormId?: string;
  dailyBudgetReais: number;
  radiusKm: number;
  campaignName: string;
  headlineTemplate: string;
  messageTemplate: string;
  whatsappGreeting: string;
  startDate: string;
  endDate?: string;
}

export function buildCampaignPayload(input: BuildCampaignPayloadInput): CreateCampaignInput {
  const { dailyBudget, lifetimeBudget } = buildBudgetPayload(input.dailyBudgetReais);

  return {
    name: input.campaignName || input.name,
    destinationType: input.destinationType,
    adAccountId: input.adAccountId,
    pageId: input.pageId,
    ...(input.whatsappNumber ? { whatsappNumber: normalizeWhatsappNumber(input.whatsappNumber) } : {}),
    ...(input.metaLeadFormId ? { metaLeadFormId: input.metaLeadFormId } : {}),
    dailyBudget,
    lifetimeBudget,
    startDate: input.startDate,
    ...(input.endDate ? { endDate: validateEndDate(input.endDate, input.startDate) ? input.endDate : undefined } : {}),
    headlineTemplate: input.headlineTemplate,
    messageTemplate: input.messageTemplate,
    whatsappGreeting: input.whatsappGreeting,
    targetingGeo: {
      customLocations: [
        {
          latitude: 0,
          longitude: 0,
          radius: input.radiusKm,
          distanceUnit: 'kilometer',
        },
      ],
    },
  };
}

export interface ListCampaignsQuery {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
}

export const campaignService = {
  async listAdAccounts(): Promise<{ items: MetaAdAccountItem[] }> {
    return httpClient.get<{ items: MetaAdAccountItem[] }>('/meta/ad-accounts');
  },

  async listPages(): Promise<{ items: MetaPageItem[] }> {
    return httpClient.get<{ items: MetaPageItem[] }>('/meta/pages');
  },

  async listLeadForms(pageId: string): Promise<{ items: MetaLeadGenFormItem[] }> {
    return httpClient.get<{ items: MetaLeadGenFormItem[] }>('/meta/lead-forms', {
      params: { pageId },
    });
  },

  async createCampaign(payload: CreateCampaignInput): Promise<CampaignDTO> {
    return httpClient.post<CampaignDTO>('/meta/campaigns', payload);
  },

  async listCampaigns(query?: ListCampaignsQuery): Promise<{ items: CampaignDTO[]; total: number; page: number; limit: number }> {
    return httpClient.get('/meta/campaigns', { params: (query ?? {}) as Record<string, string | number | boolean | undefined> });
  },

  async getCampaignById(id: string): Promise<CampaignDTO> {
    return httpClient.get<CampaignDTO>(`/meta/campaigns/${id}`);
  },

  async updateStatus(id: string, status: CampaignStatus): Promise<CampaignDTO> {
    return httpClient.patch<CampaignDTO>(`/meta/campaigns/${id}/status`, { status });
  },

  async updateBudget(
    id: string,
    budget: { dailyBudget?: number; lifetimeBudget?: number },
  ): Promise<CampaignDTO> {
    return httpClient.patch<CampaignDTO>(`/meta/campaigns/${id}/budget`, budget);
  },
};