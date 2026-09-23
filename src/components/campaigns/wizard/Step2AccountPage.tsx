import { useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  MessageCircle,
  RefreshCw,
  Store,
} from 'lucide-react';
import type {
  CampaignDestinationType,
  MetaAdAccountItem,
  MetaLeadGenFormItem,
  MetaPageItem,
} from '../../../types/campaign.js';
import { Badge } from '../../ui/Badge.js';
import { Button } from '../../ui/Button.js';

export interface Step2AccountPageProps {
  destinationType: CampaignDestinationType;
  adAccountId: string;
  pageId: string;
  whatsappNumber: string;
  metaLeadFormId: string;
  accounts: MetaAdAccountItem[];
  pages: MetaPageItem[];
  leadForms: MetaLeadGenFormItem[];
  accountsLoading: boolean;
  pagesLoading: boolean;
  formsLoading: boolean;
  accountsError?: string | null;
  pagesError?: string | null;
  formsError?: string | null;
  onAdAccountChange: (id: string) => void;
  onPageChange: (pageId: string) => void;
  onWhatsappChange: (number: string) => void;
  onLeadFormChange: (formId: string) => void;
  onReloadAccounts: () => void;
  onReloadPages: () => void;
  onReloadForms: () => void;
  onConnectMeta?: () => void;
  isConnectingMeta?: boolean;
}

const E164_HINT = 'Formato E.164: +55 (DDD) + número';

export function Step2AccountPage({
  destinationType,
  adAccountId,
  pageId,
  whatsappNumber,
  metaLeadFormId,
  accounts,
  pages,
  leadForms,
  accountsLoading,
  pagesLoading,
  formsLoading,
  accountsError,
  pagesError,
  formsError,
  onAdAccountChange,
  onPageChange,
  onWhatsappChange,
  onLeadFormChange,
  onReloadAccounts,
  onReloadPages,
  onReloadForms,
  onConnectMeta,
  isConnectingMeta = false,
}: Step2AccountPageProps) {
  const selectedPage = pages.find((page) => page.id === pageId);
  const hasNoAccounts = !accountsLoading && !accountsError && accounts.length === 0;
  const hasNoPages = !pagesLoading && !pagesError && pages.length === 0;
  const activeForms = leadForms.filter((form) => form.status === 'ACTIVE');
  const hasNoForms = !formsLoading && leadForms.length === 0;

  useEffect(() => {
    if (selectedPage?.whatsappNumber && !whatsappNumber) {
      onWhatsappChange(selectedPage.whatsappNumber);
    }
  }, [selectedPage, whatsappNumber, onWhatsappChange]);

  const whatsappValue = whatsappNumber.trim();
  const isValidE164 = whatsappValue ? /^\+?[1-9]\d{9,14}$/.test(whatsappValue.replace(/\s/g, '')) : false;

  return (
    <div className="space-y-6">
      {/* Conta de Anúncios */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-typography-heading">
            Conta de Anúncios Meta
          </h3>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={onReloadAccounts}
            disabled={accountsLoading}
          >
            Recarregar
          </Button>
        </div>

        {accountsLoading && (
          <div className="flex items-center gap-2 text-sm text-typography-muted">
            <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
            Carregando contas de anúncios...
          </div>
        )}

        {accountsError && (
          <div className="flex flex-col gap-2 p-3 rounded-lg border border-surface-border bg-surface-muted text-sm">
            <p className="text-typography-body">{accountsError}</p>
            {onConnectMeta ? (
              <button
                type="button"
                onClick={onConnectMeta}
                disabled={isConnectingMeta}
                className="text-brand-primary font-semibold underline text-xs flex items-center gap-1 w-fit hover:text-brand-primaryHover disabled:opacity-50"
              >
                {isConnectingMeta ? 'Conectando à Meta...' : 'Vincular seus ativos Meta (reautenticar)'} <ExternalLink className="w-3 h-3" />
              </button>
            ) : null}
          </div>
        )}

        {hasNoAccounts && (
          <div className="p-4 rounded-lg border border-surface-border bg-surface-muted">
            <p className="text-sm text-typography-muted">
              Nenhuma conta de anúncios encontrada. Vincule seus ativos Meta para começar a
              anunciar.
            </p>
            {onConnectMeta ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                icon={<Store className="w-4 h-4" />}
                loading={isConnectingMeta}
                onClick={onConnectMeta}
              >
                Vincular Conta Meta
              </Button>
            ) : null}
          </div>
        )}

        {!accountsLoading && !accountsError && accounts.length > 0 && (
          <div className="grid gap-2 md:grid-cols-2">
            {accounts.map((account) => {
              const active = account.accountStatus === 1;
              const isSelected = account.id === adAccountId;

              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => active && onAdAccountChange(account.id)}
                  disabled={!active}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primaryLight/40 ring-1 ring-brand-primary/30'
                      : 'border-surface-border bg-surface-card hover:border-brand-primary/40'
                  } ${!active ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-typography-heading truncate">
                      {account.name}
                    </p>
                    {active ? (
                      <Badge variant="available" size="sm" dot>
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="error" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
                        Inativa
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-typography-muted font-mono">
                    <span>{account.id}</span>
                    <span>{account.currency}</span>
                    <span>{account.timezoneName}</span>
                  </div>
                  {!active && (
                    <p className="mt-2 text-xs text-status-error-text">
                      Regularize esta conta no Gerenciador de Anúncios para utilizá-la.
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Página do Facebook / Perfil */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-typography-heading">Página do Facebook / Perfil</h3>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={onReloadPages}
            disabled={pagesLoading}
          >
            Recarregar
          </Button>
        </div>

        {pagesLoading && (
          <div className="flex items-center gap-2 text-sm text-typography-muted">
            <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
            Carregando páginas...
          </div>
        )}

        {pagesError && (
          <div className="flex flex-col gap-2 p-3 rounded-lg border border-surface-border bg-surface-muted text-sm">
            <p className="text-typography-body">{pagesError}</p>
            {onConnectMeta ? (
              <button
                type="button"
                onClick={onConnectMeta}
                disabled={isConnectingMeta}
                className="text-brand-primary font-semibold underline text-xs flex items-center gap-1 w-fit hover:text-brand-primaryHover disabled:opacity-50"
              >
                {isConnectingMeta ? 'Conectando à Meta...' : 'Reautenticar com a Meta'} <ExternalLink className="w-3 h-3" />
              </button>
            ) : null}
          </div>
        )}

        {hasNoPages && (
          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-800 font-medium">
              {accounts.length > 0
                ? 'Sua conta está conectada, mas nenhuma Página do Facebook foi encontrada.'
                : 'Nenhuma página encontrada para esta conta.'}
            </p>
            {accounts.length > 0 && (
              <p className="mt-1 text-xs text-amber-700">
                Se você se conectou à Meta antes desta atualização, o token atual pode não
                incluir as permissões necessárias para exibir suas páginas. Reautentique com a
                Meta para conceder as novas permissões.
              </p>
            )}
            {onConnectMeta ? (
              accounts.length > 0 ? (
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                  loading={isConnectingMeta}
                  onClick={onConnectMeta}
                >
                  {isConnectingMeta ? 'Conectando à Meta...' : 'Reautenticar com a Meta'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  icon={<Globe className="w-4 h-4" />}
                  loading={isConnectingMeta}
                  onClick={onConnectMeta}
                >
                  Vincular Página
                </Button>
              )
            ) : null}
          </div>
        )}

        {!pagesLoading && !pagesError && pages.length > 0 && (
          <div className="grid gap-2 md:grid-cols-2">
            {pages.map((page) => {
              const isSelected = page.id === pageId;

              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => onPageChange(page.id)}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primaryLight/40 ring-1 ring-brand-primary/30'
                      : 'border-surface-border bg-surface-card hover:border-brand-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-typography-heading truncate">
                      {page.name}
                    </p>
                    {page.isPublished === false ? (
                      <Badge variant="error" size="sm">
                        Não publicada
                      </Badge>
                    ) : (
                      <Badge variant="available" size="sm" dot>
                        Publicada
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-typography-muted font-mono truncate">{page.id}</p>
                  {page.whatsappNumber && (
                    <p className="mt-1.5 text-xs text-typography-body flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-brand-accent" />
                      WhatsApp: {page.whatsappNumber}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Destino específico */}
      {selectedPage && destinationType === 'WHATSAPP_MESSAGE' && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-typography-heading">Número de WhatsApp</h3>
          <div>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(event) => onWhatsappChange(event.target.value)}
              placeholder="+55 11 98765-4321"
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-white text-sm text-typography-heading focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            />
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              {whatsappValue ? (
                isValidE164 ? (
                  <span className="text-status-available-text flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Formato E.164 válido
                  </span>
                ) : (
                  <span className="text-status-error-text flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {E164_HINT}
                  </span>
                )
              ) : (
                <span className="text-typography-muted">{E164_HINT}</span>
              )}
            </div>
          </div>
        </section>
      )}

      {selectedPage && destinationType === 'INSTANT_LEAD_FORM' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-typography-heading">
              Formulário Instantâneo
            </h3>
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={onReloadForms}
              disabled={formsLoading}
            >
              Recarregar
            </Button>
          </div>

          {formsLoading && (
            <div className="flex items-center gap-2 text-sm text-typography-muted">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              Carregando formulários...
            </div>
          )}

          {formsError && (
            <div className="flex flex-col gap-2 p-3 rounded-lg border border-surface-border bg-surface-muted text-sm">
              <p className="text-status-error-text font-medium">
                Não foi possível carregar os formulários instantâneos desta página.
              </p>
              <p className="text-xs text-typography-muted">{formsError}</p>
              {onConnectMeta ? (
                <button
                  type="button"
                  onClick={onConnectMeta}
                  disabled={isConnectingMeta}
                  className="text-brand-primary font-semibold underline text-xs flex items-center gap-1 w-fit hover:text-brand-primaryHover disabled:opacity-50"
                >
                  {isConnectingMeta ? 'Conectando à Meta...' : 'Reautenticar com a Meta'} <ExternalLink className="w-3 h-3" />
                </button>
              ) : null}
            </div>
          )}

          {hasNoForms && !formsLoading && !formsError && (
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-800 font-medium">
                Esta página ainda não possui formulários instantâneos.
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Crie um formulário no Meta Business Suite e retorne para recarregar a lista sem
                perder o progresso.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={() => {
                    window.open(
                      'https://www.facebook.com/business/tools/forms',
                      '_blank',
                      'noopener,noreferrer',
                    );
                  }}
                >
                  Criar formulário na Meta
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={onReloadForms}
                >
                  Recarregar lista
                </Button>
              </div>
            </div>
          )}

          {!formsLoading && !formsError && leadForms.length > 0 && (
            <select
              value={metaLeadFormId}
              onChange={(event) => onLeadFormChange(event.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-white text-sm text-typography-heading focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            >
              <option value="">Selecione um formulário...</option>
              {activeForms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
              {leadForms.some((form) => form.status !== 'ACTIVE') && (
                <optgroup label="Arquivados / Rascunhos">
                  {leadForms
                    .filter((form) => form.status !== 'ACTIVE')
                    .map((form) => (
                      <option key={form.id} value={form.id}>
                        {form.name} ({form.status})
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          )}
        </section>
      )}
    </div>
  );
}