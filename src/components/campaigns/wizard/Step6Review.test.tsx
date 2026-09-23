import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Step6Review } from './Step6Review.js';
import type {
  CampaignWizardState,
  MetaAdAccountItem,
  MetaPageItem,
} from '../../../types/campaign.js';

function makeState(overrides: Partial<CampaignWizardState> = {}): CampaignWizardState {
  return {
    step: 6,
    destinationType: 'WHATSAPP_MESSAGE',
    adAccountId: 'act_123456789',
    pageId: '1029384756',
    whatsappNumber: '+5511999876543',
    metaLeadFormId: '',
    stockSelectionMode: 'ALL',
    selectedMakes: [],
    selectedBodyStyles: [],
    radiusKm: 50,
    dailyBudgetReais: 30,
    continuousPacing: true,
    campaignName: 'Campanha Teste',
    headlineTemplate: '{{make}}',
    messageTemplate: '{{model}}',
    whatsappGreeting: 'Oi!',
    ...overrides,
  };
}

const account: MetaAdAccountItem = {
  id: 'act_123456789',
  accountId: '123456789',
  name: 'Conta Principal',
  currency: 'BRL',
  timezoneName: 'America/Sao_Paulo',
  accountStatus: 1,
};

const page: MetaPageItem = { id: '1029384756', name: 'Auto Elite Veículos', isPublished: true };

describe('Step6Review: bloqueio por sessão Meta inválida (G6)', () => {
  it('exibe CTA de autenticação quando a integração Meta falha por sessão', async () => {
    const onConnectMeta = vi.fn();
    const user = userEvent.setup();

    render(
      <Step6Review
        state={makeState()}
        account={undefined}
        page={page}
        eligibleCount={10}
        metaAuthError
        onConnectMeta={onConnectMeta}
        onPublish={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Conecte sua conta de anúncios da Meta para publicar/i),
    ).toBeInTheDocument();

    const cta = screen.getByRole('button', { name: /Conectar conta da Meta/i });
    await user.click(cta);
    expect(onConnectMeta).toHaveBeenCalledTimes(1);
  });

  it('desabilita o botão de publicar quando não há sessão Meta válida', () => {
    render(
      <Step6Review
        state={makeState()}
        account={undefined}
        page={page}
        eligibleCount={10}
        metaAuthError
        onConnectMeta={vi.fn()}
        onPublish={vi.fn()}
      />,
    );

    const publishButton = screen.getByRole('button', { name: /Publicar Campanha/i });
    expect(publishButton).toBeDisabled();
  });

  it('habilita a publicação quando a integração Meta está conectada e os ativos existem', () => {
    render(
      <Step6Review
        state={makeState()}
        account={account}
        page={page}
        eligibleCount={10}
        onPublish={vi.fn()}
      />,
    );

    const publishButton = screen.getByRole('button', { name: /Publicar Campanha/i });
    expect(publishButton).not.toBeDisabled();
  });
});