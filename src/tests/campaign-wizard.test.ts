import { describe, expect, it } from 'vitest';
import {
  applyMessageTemplate,
  applyHeadlineTemplate,
  validateWhatsappE164,
  normalizeWhatsappNumber,
  buildBudgetPayload,
  buildCampaignPayload,
  validateWizardTransition,
  MIN_DAILY_BUDGET_CENTS,
  validateEndDate,
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
      destinationType: 'WHATSAPP_MESSAGE',
      whatsappNumber: '119876', // incompleto, sem DDI e abaixo de 10 dígitos
    });
    expect(result.valid).toBe(false);
  });

  it('bloqueia avanço para FORMULÁRIO sem formMetaLeadFormId selecionado', () => {
    const result = validateWizardTransition({
      step: 2,
      destinationType: 'INSTANT_LEAD_FORM',
      metaLeadFormId: '',
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('formul');
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
