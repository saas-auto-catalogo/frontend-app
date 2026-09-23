import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearCampaignWizardDraft,
  loadCampaignWizardDraft,
  saveCampaignWizardDraft,
  shouldRestoreStepTwo,
  WIZARD_DRAFT_KEY,
} from './campaignWizardDraft.js';
import type { CampaignWizardState } from '../types/campaign.js';

const draftState: CampaignWizardState = {
  step: 2,
  destinationType: 'INSTANT_LEAD_FORM',
  adAccountId: 'act_123456789',
  pageId: 'page-001',
  whatsappNumber: '+5511987654321',
  metaLeadFormId: 'form-001',
  stockSelectionMode: 'ALL',
  selectedMakes: ['Toyota'],
  selectedBodyStyles: [],
  maxPrice: 150000,
  radiusKm: 50,
  dailyBudgetReais: 30,
  continuousPacing: true,
  endDate: '2026-12-31',
  campaignName: 'Campanha Ofertas',
  headlineTemplate: '{{make}} {{model}}',
  messageTemplate: 'Confira as melhores ofertas!',
  whatsappGreeting: 'Olá!',
};

describe('campaignWizardDraft: persistência e restauração do estado', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('salva e restaura o rascunho completo em sessionStorage', () => {
    saveCampaignWizardDraft(draftState);

    const raw = window.sessionStorage.getItem(WIZARD_DRAFT_KEY);
    expect(raw).not.toBeNull();

    const restored = loadCampaignWizardDraft();
    expect(restored).toEqual(draftState);
  });

  it('retorna null quando não há rascunho salvo', () => {
    expect(loadCampaignWizardDraft()).toBeNull();
  });

  it('retorna null para texto inválido / JSON corrompido', () => {
    window.sessionStorage.setItem(WIZARD_DRAFT_KEY, 'not-json');
    expect(loadCampaignWizardDraft()).toBeNull();

    window.sessionStorage.setItem(WIZARD_DRAFT_KEY, '{ "step": "x" }');
    expect(loadCampaignWizardDraft()).toBeNull();
  });

  it('clearCampaignWizardDraft remove o rascunho persistido', () => {
    saveCampaignWizardDraft(draftState);
    expect(loadCampaignWizardDraft()).not.toBeNull();

    clearCampaignWizardDraft();
    expect(loadCampaignWizardDraft()).toBeNull();
    expect(window.sessionStorage.getItem(WIZARD_DRAFT_KEY)).toBeNull();
  });

  it('shouldRestoreStepTwo detecta o parâmetro ?step=2', () => {
    expect(shouldRestoreStepTwo('')).toBe(false);
    expect(shouldRestoreStepTwo('?step=1')).toBe(false);
    expect(shouldRestoreStepTwo('?step=2')).toBe(true);
    expect(shouldRestoreStepTwo('?step=2&foo=bar')).toBe(true);
    expect(shouldRestoreStepTwo('?step=abc')).toBe(false);
  });
});