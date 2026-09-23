import type { CampaignWizardState } from '../types/campaign.js';

export const WIZARD_DRAFT_KEY = 'ds_campaign_wizard_draft';

/**
 * Persiste o rascunho do wizard de campanhas em sessionStorage antes de
 * redirecionar para o OAuth da Meta, permitindo restaurar o estado exato
 * (step, destinationType, ativos selecionados, orçamento etc.) no retorno.
 */
export function saveCampaignWizardDraft(state: CampaignWizardState): void {
  try {
    window.sessionStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage indisponível: segue sem persistência de rascunho.
  }
}

/**
 * Restaura o rascunho salvo, validando a estrutura mínima para evitar
 * corromper o wizard com dados inválidos.
 */
export function loadCampaignWizardDraft(): CampaignWizardState | null {
  try {
    const raw = window.sessionStorage.getItem(WIZARD_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CampaignWizardState>;
    if (!isValidDraft(parsed)) return null;
    return parsed as CampaignWizardState;
  } catch {
    return null;
  }
}

export function clearCampaignWizardDraft(): void {
  try {
    window.sessionStorage.removeItem(WIZARD_DRAFT_KEY);
  } catch {
    // ignora erros de storage.
  }
}

/**
 * Detecta se o wizard deve abrir no Passo 2 (Conta & Página), com base no
 * parâmetro `?step=2` registrado no returnTo do OAuth da Meta.
 */
export function shouldRestoreStepTwo(search: string): boolean {
  try {
    return new URLSearchParams(search).get('step') === '2';
  } catch {
    return false;
  }
}

function isValidDraft(value: Partial<CampaignWizardState>): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.step === 'number' &&
    typeof value.destinationType === 'string' &&
    typeof value.adAccountId === 'string' &&
    typeof value.pageId === 'string' &&
    typeof value.whatsappNumber === 'string' &&
    typeof value.metaLeadFormId === 'string' &&
    typeof value.radiusKm === 'number' &&
    typeof value.dailyBudgetReais === 'number'
  );
}