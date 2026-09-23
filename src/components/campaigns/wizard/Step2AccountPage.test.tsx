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

describe('Step2AccountPage: seleção obrigatória de conta e página', () => {
  const singlePage: MetaPageItem[] = [
    { id: 'page-001', name: 'Auto Elite Veículos', isPublished: true },
  ];

  it('exibe aviso quando nenhuma conta ativa está selecionada', () => {
    render(<Step2AccountPage {...baseProps} adAccountId="" pageId="" pages={singlePage} />);

    expect(
      screen.getByText('Selecione uma conta de anúncios da Meta ativa para continuar.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Selecione uma Página do Facebook para vincular à campanha.')).toBeInTheDocument();
  });

  it('não exibe aviso de conta quando há conta ativa selecionada', () => {
    render(<Step2AccountPage {...baseProps} pageId="page-001" pages={singlePage} />);

    expect(
      screen.queryByText('Selecione uma conta de anúncios da Meta ativa para continuar.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Selecione uma Página do Facebook para vincular à campanha.'),
    ).not.toBeInTheDocument();
  });

  it('exibe aviso quando nenhuma página está selecionada', () => {
    render(
      <Step2AccountPage {...baseProps} adAccountId="" pageId="" pages={singlePage} />,
    );

    expect(
      screen.getByText('Selecione uma Página do Facebook para vincular à campanha.'),
    ).toBeInTheDocument();
  });

  it('exibe aviso quando a conta selecionada está inativa', () => {
    const inactiveAccount: MetaAdAccountItem = { ...account, accountStatus: 2 };

    render(
      <Step2AccountPage {...baseProps} adAccountId={inactiveAccount.id} accounts={[inactiveAccount]} />,
    );

    expect(
      screen.getByText('Selecione uma conta de anúncios da Meta ativa para continuar.'),
    ).toBeInTheDocument();
  });

  it('emite onAdAccountChange ao selecionar conta ativa', async () => {
    const onAdAccountChange = vi.fn();
    const user = userEvent.setup();

    render(<Step2AccountPage {...baseProps} adAccountId="" onAdAccountChange={onAdAccountChange} />);

    await user.click(screen.getByRole('button', { name: /Conta Principal/ }));
    expect(onAdAccountChange).toHaveBeenCalledWith('act_123456789');
  });

  it('emite onPageChange ao selecionar página', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Step2AccountPage
        {...baseProps}
        pageId=""
        pages={singlePage}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Auto Elite Veículos/ }));
    expect(onPageChange).toHaveBeenCalledWith('page-001');
  });

  it('não emite onAdAccountChange ao clicar em conta inativa', async () => {
    const onAdAccountChange = vi.fn();
    const user = userEvent.setup();
    const inactiveAccount: MetaAdAccountItem = { ...account, accountStatus: 2 };

    render(
      <Step2AccountPage
        {...baseProps}
        adAccountId=""
        accounts={[inactiveAccount]}
        onAdAccountChange={onAdAccountChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Conta Principal/ }));
    expect(onAdAccountChange).not.toHaveBeenCalled();
  });
});

describe('Step2AccountPage: erro de autenticação Meta (G6)', () => {
  it('exibe CTA de reconexão quando o carregamento de contas falha por autenticação', async () => {
    const onConnectMeta = vi.fn();
    const user = userEvent.setup();

    render(
      <Step2AccountPage
        {...baseProps}
        accounts={[]}
        accountsError="Token de acesso Meta não fornecido. Informe x-meta-session-token."
        onConnectMeta={onConnectMeta}
      />,
    );

    expect(screen.getByText(/Token de acesso Meta não fornecido/i)).toBeInTheDocument();

    const reauthButton = screen.getByRole('button', { name: /Vincular seus ativos Meta/i });
    expect(reauthButton).toBeInTheDocument();

    await user.click(reauthButton);
    expect(onConnectMeta).toHaveBeenCalledTimes(1);
  });
});

describe('Step2AccountPage: erro ao carregar formulários instantâneos', () => {
  const leadFormProps = {
    ...baseProps,
    destinationType: 'INSTANT_LEAD_FORM' as CampaignDestinationType,
    pageId: 'page-001',
    pages: [
      { id: 'page-001', name: 'Auto Elite Veículos', isPublished: true },
    ] as MetaPageItem[],
  };

  it('exibe mensagem amigável e botão "Reautenticar com a Meta" quando formsError', async () => {
    const onConnectMeta = vi.fn();
    const user = userEvent.setup();

    render(
      <Step2AccountPage
        {...leadFormProps}
        formsError="Token de acesso Meta não fornecido. Informe x-meta-session-token."
        onConnectMeta={onConnectMeta}
      />,
    );

    expect(
      screen.getByText(/Não foi possível carregar os formulários instantâneos desta página/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Token de acesso Meta não fornecido/i)).toBeInTheDocument();

    const reauthButton = screen.getByRole('button', { name: /Reautenticar com a Meta/i });
    expect(reauthButton).toBeInTheDocument();

    await user.click(reauthButton);
    expect(onConnectMeta).toHaveBeenCalledTimes(1);
  });

  it('não mostra botão de reautenticação quando onConnectMeta não é fornecido', () => {
    render(
      <Step2AccountPage
        {...leadFormProps}
        formsError="Erro de formação"
        onConnectMeta={undefined}
      />,
    );

    expect(
      screen.getByText(/Não foi possível carregar os formulários instantâneos desta página/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Reautenticar com a Meta/i }),
    ).not.toBeInTheDocument();
  });
});
