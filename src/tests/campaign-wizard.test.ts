import { describe, expect, it } from 'vitest';
import {
  applyMessageTemplate,
  applyHeadlineTemplate,
  buildBudgetPayload,
  buildCampaignPayload,
  isValidAdAccountId,
  normalizeWhatsappNumber,
  validateEndDate,
  validateWhatsappE164,
  validateWizardTransition,
  MIN_DAILY_BUDGET_CENTS,
} from '../services/api/campaignService.js';

describe('Campaign Wizard: validações de transição entre passos', () => {
  it('bloqueia avanço quando orçamento diário é inferior ao piso de R$ 15,00', () => {
    const result = validateWizardTransition({
      step: 4,
      dailyBudgetReais: 10, // R$ 10,00 < R$ 15,00
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('15');
  });

  it('permite avanço com orçamento exatamente no piso de R$ 15,00', () => {
    const result = validateWizardTransition({
      step: 4,
      dailyBudgetReais: 15,
    });
    expect(result.valid).toBe(true);
  });

  it('bloqueia avanço no passo 2 WhatsApp com número inválido', () => {
    const result = validateWizardTransition({
      step: 2,
      adAccountId: 'act_123456789',
      pageId: '1029384756',
      destinationType: 'WHATSAPP_MESSAGE',
      whatsappNumber: '119876', // incompleto, sem DDI e abaixo de 10 dígitos
    });
    expect(result.valid).toBe(false);
  });

  it('bloqueia avanço para FORMULÁRIO sem formMetaLeadFormId selecionado', () => {
    const result = validateWizardTransition({
      step: 2,
      adAccountId: 'act_123456789',
      pageId: '1029384756',
      destinationType: 'INSTANT_LEAD_FORM',
      metaLeadFormId: '',
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('formul');
  });
});

describe('Campaign Wizard: isValidAdAccountId', () => {
  it('aceita UUID no padrão v4 (case-insensitive)', () => {
    expect(isValidAdAccountId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidAdAccountId('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('aceita formato act_<números> e apenas números', () => {
    expect(isValidAdAccountId('act_123456789')).toBe(true);
    expect(isValidAdAccountId('123456789')).toBe(true);
    expect(isValidAdAccountId(' act_1 ')).toBe(true);
  });

  it('rejeita strings vazias, nulas e formatos arbitrários', () => {
    expect(isValidAdAccountId('')).toBe(false);
    expect(isValidAdAccountId('abc')).toBe(false);
    expect(isValidAdAccountId('act_')).toBe(false);
    expect(isValidAdAccountId('act_abc123')).toBe(false);
    expect(isValidAdAccountId('550e8400-e29b-41d4-a716-44665544000x')).toBe(false);
    expect(isValidAdAccountId(null)).toBe(false);
    expect(isValidAdAccountId(undefined)).toBe(false);
  });
});

describe('Campaign Wizard: validação obrigatória de adAccountId e pageId', () => {
  const validAssets = { adAccountId: 'act_123456789', pageId: '1029384756' };

  it('bloqueia avanço no Passo 2 sem conta de anúncios', () => {
    const result = validateWizardTransition({ step: 2, ...validAssets, adAccountId: '' });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('conta de anúncios');
  });

  it('bloqueia avanço no Passo 2 com adAccountId em formato inválido', () => {
    const result = validateWizardTransition({ step: 2, ...validAssets, adAccountId: 'abc' });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('conta de anúncios');
  });

  it('bloqueia avanço no Passo 2 sem página selecionada', () => {
    const result = validateWizardTransition({ step: 2, ...validAssets, pageId: '' });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Página');
  });

  it('permite avanço no Passo 2 com conta e página válidas', () => {
    const result = validateWizardTransition({
      step: 2,
      ...validAssets,
      destinationType: 'WHATSAPP_MESSAGE',
      whatsappNumber: '+5511999876543',
    });
    expect(result.valid).toBe(true);
  });

  it('bloqueia publicação no Passo 6 sem conta de anúncios', () => {
    const result = validateWizardTransition({
      step: 6,
      ...validAssets,
      adAccountId: '',
      destinationType: 'WHATSAPP_MESSAGE',
      whatsappNumber: '+5511999876543',
      dailyBudgetReais: 30,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('conta de anúncios');
  });

  it('bloqueia publicação no Passo 6 com adAccountId em formato inválido', () => {
    const result = validateWizardTransition({
      step: 6,
      ...validAssets,
      adAccountId: 'not-a-valid-id',
      destinationType: 'WHATSAPP_MESSAGE',
      whatsappNumber: '+5511999876543',
      dailyBudgetReais: 30,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('conta de anúncios');
  });

  it('bloqueia publicação no Passo 6 sem página selecionada', () => {
    const result = validateWizardTransition({
      step: 6,
      ...validAssets,
      pageId: '',
      destinationType: 'WHATSAPP_MESSAGE',
      whatsappNumber: '+5511999876543',
      dailyBudgetReais: 30,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Página');
  });

  it('bloqueia publicação no Passo 6 com orçamento abaixo do piso', () => {
    const result = validateWizardTransition({
      step: 6,
      ...validAssets,
      destinationType: 'WHATSAPP_MESSAGE',
      whatsappNumber: '+5511999876543',
      dailyBudgetReais: 10,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('15');
  });

  it('permite publicação no Passo 6 com todos os ativos válidos', () => {
    const result = validateWizardTransition({
      step: 6,
      ...validAssets,
      destinationType: 'WHATSAPP_MESSAGE',
      whatsappNumber: '+5511999876543',
      dailyBudgetReais: 30,
    });
    expect(result.valid).toBe(true);
  });
});

describe('Campaign Wizard: validação E.164 de WhatsApp', () => {
  it('rejeita números sem o padrão E.164', () => {
    expect(validateWhatsappE164('11 98765-4321')).toBe(false);
    expect(validateWhatsappE164('abc')).toBe(false);
    expect(validateWhatsappE164('')).toBe(false);
  });

  it('aceita números válidos com e sem o sinal de +', () => {
    expect(validateWhatsappE164('+55119998765432')).toBe(true);
    expect(validateWhatsappE164('55119998765432')).toBe(true);
  });

  it('normaliza formatação local brasileira para E.164', () => {
    expect(normalizeWhatsappNumber('(11) 98765-4321')).toBe('+5511987654321');
    expect(normalizeWhatsappNumber('11987654321')).toBe('+5511987654321');
  });
});

describe('Campaign Wizard: interpolação de tags de copy', () => {
  const stock = { make: 'Toyota', model: 'Corolla', price: 120000 };

  it('substitui {{make}}, {{model}} e {{price}} no headline', () => {
    const headline = applyHeadlineTemplate('{{make}} {{model}} por {{price}}', stock);
    expect(headline).toBe('Toyota Corolla por R$ 120.000,00');
  });

  it('substitui tags na mensagem principal e mantém texto literal', () => {
    const message = applyMessageTemplate(
      'Olá! Tenho um {{make}} {{model}} com ótimo preço.',
      stock,
    );
    expect(message).toBe('Olá! Tenho um Toyota Corolla com ótimo preço.');
  });

  it('formata o preço em moeda pt-BR na interpolação', () => {
    const out = applyMessageTemplate('Valor: {{price}}', { ...stock, price: 489700 });
    expect(out).toBe('Valor: R$ 489.700,00');
  });

  it('deixa tags desconhecidas intactas', () => {
    const out = applyHeadlineTemplate('{{unknown}} {{make}}', { make: 'Honda' });
    expect(out).toBe('{{unknown}} Honda');
  });
});

describe('Campaign Wizard: conversão de orçamento e payload da API', () => {
  it('converte reais para centavos (min 1500 = R$ 15,00)', () => {
    expect(buildBudgetPayload(30)).toEqual({ dailyBudget: 3000, lifetimeBudget: undefined });
  });

  it('rejeita piso inferior a R$ 15,00 na conversão', () => {
    expect(() => buildBudgetPayload(0)).toThrow();
    expect(() => buildBudgetPayload(10)).toThrow();
  });

  it('monta payload de campanha com budget em centavos e números validados', () => {
    const payload = buildCampaignPayload({
      name: 'Campanha Corolla',
      destinationType: 'WHATSAPP_MESSAGE',
      adAccountId: 'act_123456',
      pageId: 'page_1',
      whatsappNumber: '(11) 98765-4321',
      dailyBudgetReais: 30,
      radiusKm: 50,
      campaignName: 'Corolla Oferta',
      headlineTemplate: '{{make}} {{model}}',
      messageTemplate: 'Vi este {{model}}.',
      whatsappGreeting: 'Oi!',
      startDate: '2026-01-01T10:00:00Z',
    });

    expect(payload.dailyBudget).toBe(3000);
    expect(payload.whatsappNumber).toBe('+5511987654321');
    expect(payload.targetingGeo?.customLocations[0].radius).toBe(50);
    expect(payload.headlineTemplate).toContain('{{make}}');
  });

  it('rejeita payload sem adAccountId ou pageId válidos', () => {
    const base = {
      name: 'Campanha Corolla',
      destinationType: 'WHATSAPP_MESSAGE' as const,
      adAccountId: 'act_123456',
      pageId: '1029384756',
      whatsappNumber: '(11) 98765-4321',
      dailyBudgetReais: 30,
      radiusKm: 50,
      campaignName: 'Corolla Oferta',
      headlineTemplate: '{{make}} {{model}}',
      messageTemplate: 'Vi este {{model}}.',
      whatsappGreeting: 'Oi!',
      startDate: '2026-01-01T10:00:00Z',
    };

    expect(() => buildCampaignPayload({ ...base, adAccountId: '' })).toThrow(/conta de anúncios/);
    expect(() => buildCampaignPayload({ ...base, adAccountId: 'abc' })).toThrow(/conta de anúncios/);
    expect(() => buildCampaignPayload({ ...base, pageId: '' })).toThrow(/Página/);
  });
});

describe('Campaign Wizard: datas & veiculação', () => {
  it('rejeita endDate anterior ou igual a startDate', () => {
    const start = '2026-01-10T10:00:00Z';
    expect(validateEndDate('2026-01-10T09:00:00Z', start)).toBe(false);
    expect(validateEndDate('2026-01-10T10:00:00Z', start)).toBe(false);
  });

  it('aceita endDate posterior a startDate', () => {
    expect(validateEndDate('2026-01-11T10:00:00Z', '2026-01-10T10:00:00Z')).toBe(true);
  });

  it('exporta o piso mínimo como constante', () => {
    expect(MIN_DAILY_BUDGET_CENTS).toBe(1500);
  });
});
