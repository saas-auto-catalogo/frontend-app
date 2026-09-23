import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Step2AccountPage } from './Step2AccountPage.js';
import type {
  CampaignDestinationType,
  MetaAdAccountItem,
  MetaLeadGenFormItem,
  MetaPageItem,
} from '../../../types/campaign.js';

const account: MetaAdAccountItem = {
  id: 'act_123456789',
  accountId: '123456789',
  name: 'Conta Principal',
  currency: 'BRL',
  timezoneName: 'America/Sao_Paulo',
  accountStatus: 1,
};

const baseProps = {
  destinationType: 'WHATSAPP_MESSAGE' as CampaignDestinationType,
  adAccountId: 'act_123456789',
  pageId: '',
  whatsappNumber: '',
  metaLeadFormId: '',
  accounts: [account] as MetaAdAccountItem[],
  pages: [] as MetaPageItem[],
  leadForms: [] as MetaLeadGenFormItem[],
  accountsLoading: false,
  pagesLoading: false,
  formsLoading: false,
  accountsError: null,
  pagesError: null,
  formsError: null,
  onAdAccountChange: vi.fn(),
  onPageChange: vi.fn(),
  onWhatsappChange: vi.fn(),
  onLeadFormChange: vi.fn(),
  onReloadAccounts: vi.fn(),
  onReloadPages: vi.fn(),
  onReloadForms: vi.fn(),
};

describe('Step2AccountPage: alerta de reautenticação quando páginas vazias', () => {
  it('exibe aviso e botão "Reautenticar com a Meta" quando há contas mas nenhuma página', async () => {
    const onConnectMeta = vi.fn();
    const user = userEvent.setup();

    render(<Step2AccountPage {...baseProps} onConnectMeta={onConnectMeta} />);

    expect(
      screen.getByText('Sua conta está conectada, mas nenhuma Página do Facebook foi encontrada.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Reautentique com a Meta/i)).toBeInTheDocument();

    const reauthButton = screen.getByRole('button', { name: /Reautenticar com a Meta/i });
    expect(reauthButton).toBeInTheDocument();

    await user.click(reauthButton);
    expect(onConnectMeta).toHaveBeenCalledTimes(1);
  });

  it('exibe lista de páginas sem o alerta quando há páginas disponíveis', () => {
    const pages: MetaPageItem[] = [
      { id: 'page-001', name: 'Auto Elite Veículos', isPublished: true },
    ];

    render(<Step2AccountPage {...baseProps} pages={pages} onConnectMeta={vi.fn()} />);

    expect(screen.getByText('Auto Elite Veículos')).toBeInTheDocument();
    expect(
      screen.queryByText('Sua conta está conectada, mas nenhuma Página do Facebook foi encontrada.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reautenticar com a Meta/i })).not.toBeInTheDocument();
  });

  it('mantém mensagem genérica quando não há contas vinculadas', () => {
    render(
      <Step2AccountPage {...baseProps} accounts={[]} onConnectMeta={vi.fn()} />,
    );

    expect(screen.getByText('Nenhuma página encontrada para esta conta.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vincular Página/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reautenticar com a Meta/i })).not.toBeInTheDocument();
  });

  it('não exibe alerta de páginas enquanto carrega', () => {
    render(
      <Step2AccountPage {...baseProps} pagesLoading onConnectMeta={vi.fn()} />,
    );

    expect(screen.getByText('Carregando páginas...')).toBeInTheDocument();
    expect(
      screen.queryByText('Sua conta está conectada, mas nenhuma Página do Facebook foi encontrada.'),
    ).not.toBeInTheDocument();
  });
});
