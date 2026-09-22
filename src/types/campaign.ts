export type CampaignDestinationType = 'WHATSAPP_MESSAGE' | 'INSTANT_LEAD_FORM' | 'INSTAGRAM_DIRECT';

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface MetaAdAccountItem {
  id: string; // ex: "act_123456789"
  accountId: string; // ex: "123456789"
  name: string;
  currency: string;
  timezoneName: string;
  accountStatus: number; // 1 = ACTIVE
}

export interface MetaPageItem {
  id: string;
  name: string;
  whatsappNumber?: string | null;
  accessToken?: string;
  isPublished?: boolean;
}

export interface MetaLeadGenFormItem {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | string;
}

export interface CustomGeoLocation {
  latitude: number;
  longitude: number;
  radius: number;
  distanceUnit: 'kilometer' | 'mile';
}

export interface TargetingGeo {
  customLocations: CustomGeoLocation[];
}

export interface CreateCampaignInput {
  name: string;
  destinationType: CampaignDestinationType;
  adAccountId: string;
  catalogId?: string;
  pageId: string;
  productSetId?: string;
  dailyBudget?: number; // em centavos (min 1500 = R$ 15,00)
  lifetimeBudget?: number;
  startDate: string; // ISO datetime
  endDate?: string; // ISO datetime
  whatsappNumber?: string; // Formato E.164 (+5511999998888)
  metaLeadFormId?: string;
  headlineTemplate?: string;
  messageTemplate?: string;
  whatsappGreeting?: string;
  targetingGeo?: TargetingGeo;
  filterRules?: Record<string, any>;
}

export interface CampaignDTO {
  id: string;
  workspaceId: string;
  name: string;
  status: CampaignStatus;
  destinationType: CampaignDestinationType;
  metaAdAccountId: string;
  metaCatalogId?: string | null;
  metaPageId: string;
  metaLeadFormId?: string | null;
  metaLeadFormName?: string | null;
  metaProductSetId?: string | null;
  metaProductSetName?: string | null;
  whatsappNumber?: string | null;
  dailyBudget?: number | null;
  lifetimeBudget?: number | null;
  startDate: string;
  endDate?: string | null;
  metaCampaignId?: string | null;
  metaAdSetId?: string | null;
  metaCreativeId?: string | null;
  metaAdId?: string | null;
  lifetimeSpend: number;
  lifetimeClicks: number;
  lifetimeImpressions: number;
  lifetimeResultsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignWizardState {
  step: number; // 1 a 6
  destinationType: CampaignDestinationType;
  adAccountId: string;
  pageId: string;
  whatsappNumber: string;
  metaLeadFormId: string;
  stockSelectionMode: 'ALL' | 'CUSTOM_FILTER';
  selectedMakes: string[];
  selectedBodyStyles: string[];
  maxPrice?: number;
  radiusKm: number;
  dailyBudgetReais: number; // ex: 30
  continuousPacing: boolean;
  endDate?: string;
  campaignName: string;
  headlineTemplate: string;
  messageTemplate: string;
  whatsappGreeting: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}