import { CalendarClock, CheckCircle2, ExternalLink, MessageCircle, Rocket, Store } from 'lucide-react';
import type { CampaignWizardState } from '../../../types/campaign.js';
import type { MetaAdAccountItem, MetaLeadGenFormItem, MetaPageItem } from '../../../types/campaign.js';
import { Badge } from '../../ui/Badge.js';
import { Button } from '../../ui/Button.js';
import {
  MIN_DAILY_BUDGET_REAIS,
  applyHeadlineTemplate,
  applyMessageTemplate,
  formatPriceBRL,
  isValidAdAccountId,
} from '../../../services/api/campaignService.js';

export interface CampaignPublishedSuccessProps {
  campaignName: string;
  campaignId?: string | null;
  dailyBudgetReais: number;
  isContinuous: boolean;
  endDate?: string;
  onFinish: () => void;
  onBack?: () => void;
}

export function CampaignPublishedSuccess({
  campaignName,
  campaignId,
  dailyBudgetReais,
  isContinuous,
  endDate,
  onFinish,
  onBack,
}: CampaignPublishedSuccessProps) {
  return (
    <div className="space-y-5 text-center py-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-status-available-bg border border-status-available-border flex items-center justify-center">
        <CheckCircle2 className="w-9 h-9 text-status-available-text" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-typography-heading">Campanha publicada!</h2>
        <p className="mt-1 text-sm text-typography-muted">
          “{campaignName}” foi criada no Gerenciador de Anúncios da Meta e está pronta para
          veicular.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 text-left">
        <div className="p-3 rounded-lg border border-surface-border bg-surface-muted">
          <p className="text-[10px] font-bold uppercase tracking-wide text-typography-muted">
            Orçamento diário
          </p>
          <p className="mt-1 text-sm font-bold text-typography-heading">
            {formatPriceBRL(dailyBudgetReais)}/dia
          </p>
        </div>
        <div className="p-3 rounded-lg border border-surface-border bg-surface-muted">
          <p className="text-[10px] font-bold uppercase tracking-wide text-typography-muted">
            Veiculação
          </p>
          <p className="mt-1 text-sm font-bold text-typography-heading">
            {isContinuous ? 'Contínua' : `Até ${formatEndDate(endDate)}`}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-surface-border bg-surface-muted">
          <p className="text-[10px] font-bold uppercase tracking-wide text-typography-muted">
            Status da Meta
          </p>
          <p className="mt-1 text-sm font-bold text-typography-heading">
            {campaignId ? 'Criada' : '—'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          variant="outline"
          icon={<ExternalLink className="w-4 h-4" />}
          onClick={() => {
            window.open('https://adsmanager.facebook.com/adsmanager/manage/campaigns', '_blank', 'noopener,noreferrer');
          }}
        >
          Abrir Meta Ads Manager
        </Button>
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            Criar outra campanha
          </Button>
        )}
        <Button
          variant="primary"
          icon={<Store className="w-4 h-4" />}
          onClick={onFinish}
        >
          Voltar ao painel
        </Button>
      </div>
    </div>
  );
}

export interface Step6ReviewProps {
  state: CampaignWizardState;
  account?: MetaAdAccountItem;
  page?: MetaPageItem;
  leadForm?: MetaLeadGenFormItem;
  eligibleCount: number | null;
  isPublishing?: boolean;
  publishError?: string | null;
  metaAuthError?: boolean;
  onConnectMeta?: () => void;
  isConnectingMeta?: boolean;
  onPublish: () => void;
  onBack?: () => void;
  onGoToAssets?: () => void;
}

function formatEndDate(endDate?: string): string {
  if (!endDate) return 'Sem data final';
  return new Date(endDate).toLocaleDateString('pt-BR');
}

export function Step6Review({
  state,
  account,
  page,
  leadForm,
  eligibleCount,
  isPublishing,
  publishError,
  metaAuthError = false,
  onConnectMeta,
  isConnectingMeta = false,
  onPublish,
  onBack,
  onGoToAssets,
}: Step6ReviewProps) {
  const budgetValid = state.dailyBudgetReais >= MIN_DAILY_BUDGET_REAIS;
  const accountConfigured = !!account && isValidAdAccountId(state.adAccountId);
  const pageConfigured = !!page && !!state.pageId;
  const assetsValid = accountConfigured && pageConfigured;
  const sampleContext = { make: 'Veículo', model: 'Selecionado', price: 150000 };
  const renderedHeadline = applyHeadlineTemplate(state.headlineTemplate, sampleContext);
  const renderedMessage = applyMessageTemplate(state.messageTemplate, sampleContext);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-surface-border bg-surface-muted flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-typography-heading">
            Revise os detalhes antes de publicar
          </p>
          <p className="mt-0.5 text-xs text-typography-muted leading-relaxed">
            Após a confirmação, a campanha será criada no Gerenciador de Anúncios da Meta com as
            configurações abaixo. Você poderá pausar, retomar ou ajustar o orçamento depois.
          </p>
        </div>
      </div>

      {/* Objetivo */}
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-typography-heading">Objetivo</h3>
        <div className="flex items-center gap-2">
          {state.destinationType === 'WHATSAPP_MESSAGE' ? (
            <Badge variant="available" icon={<MessageCircle className="w-3.5 h-3.5" />}>
              Mensagens para o WhatsApp
            </Badge>
          ) : (
            <Badge variant="available" icon={<Rocket className="w-3.5 h-3.5" />}>
              Cadastro via Formulário Meta
            </Badge>
          )}
          <span className="text-sm text-typography-body">
            {state.campaignName || '—'}{' '}
          </span>
        </div>
      </section>

      {/* Ativos */}
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-typography-heading">Ativos e Destino</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="p-3 rounded-lg border border-surface-border bg-white">
            <p className="text-[10px] font-bold uppercase tracking-wide text-typography-muted">
              Conta de Anúncios
            </p>
            <p className="mt-1 text-sm font-semibold text-typography-heading">
              {account?.name || state.adAccountId}
            </p>
            <p className="text-xs text-typography-muted font-mono">{account?.id}</p>
          </div>
          <div className="p-3 rounded-lg border border-surface-border bg-white">
            <p className="text-[10px] font-bold uppercase tracking-wide text-typography-muted">
              Página do Facebook
            </p>
            <p className="mt-1 text-sm font-semibold text-typography-heading">
              {page?.name || state.pageId}
            </p>
            <p className="text-xs text-typography-muted font-mono">{page?.id}</p>
          </div>

          {state.destinationType === 'WHATSAPP_MESSAGE' && (
            <div className="p-3 rounded-lg border border-surface-border bg-white">
              <p className="text-[10px] font-bold uppercase tracking-wide text-typography-muted">
                WhatsApp (E.164)
              </p>
              <p className="mt-1 text-sm font-semibold text-typography-heading">
                {state.whatsappNumber || '—'}
              </p>
            </div>
          )}

          {state.destinationType === 'INSTANT_LEAD_FORM' && (
            <div className="p-3 rounded-lg border border-surface-border bg-white">
              <p className="text-[10px] font-bold uppercase tracking-wide text-typography-muted">
                Formulário Instantâneo
              </p>
              <p className="mt-1 text-sm font-semibold text-typography-heading">
                {leadForm?.name || state.metaLeadFormId || '—'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Segmentação */}
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-typography-heading">Segmentação</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="p-3 rounded-lg border border-surface-border bg-white">
            <p className="text-[10px] font-bold uppercase tracking-wide text-typography-muted">
              Estoque
            </p>
            <p className="mt-1 text-sm font-semibold text-typography-heading">
              {eligibleCount != null ? `${eligibleCount} veículos` : '—'} —{' '}
              {state.stockSelectionMode === 'ALL' ? 'todo o estoque' : 'filtro específico'}
            </p>
            {state.stockSelectionMode === 'CUSTOM_FILTER' && (
              <p className="text-xs text-typography-muted mt-1">
                {state.selectedMakes.length > 0
                  ? `Marcas: ${state.selectedMakes.join(', ')}`
                  : 'Todas as marcas'}
                {state.maxPrice != null && ` · Até ${formatPriceBRL(state.maxPrice)}`}
              </p>
            )}
          </div>

          <div className="p-3 rounded-lg border border-surface-border bg-white">
            <p className="text-[10px] font-bold uppercase tracking-wide text-typography-muted">
              Raio de Alcance
            </p>
            <p className="mt-1 text-sm font-semibold text-typography-heading">
              {state.radiusKm} km ao redor das unidades
            </p>
          </div>

          <div className="p-3 rounded-lg border border-surface-border bg-white">
            <p className="text-[10px] font-bold uppercase tracking-wide text-typography-muted">
              Orçamento
            </p>
            <p className="mt-1 text-sm font-semibold text-typography-heading">
              {formatPriceBRL(state.dailyBudgetReais)} / dia
            </p>
            <p className="text-xs text-typography-muted mt-1">
              {state.continuousPacing ? 'Distribuição contínua' : 'Maior volume'}
            </p>
          </div>

          <div className="p-3 rounded-lg border border-surface-border bg-white">
            <p className="text-[10px] font-bold uppercase tracking-wide text-typography-muted">
              Período
            </p>
            <p className="mt-1 text-sm font-semibold text-typography-heading flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4 text-brand-primary" />
              {state.continuousPacing
                ? 'Sem data final'
                : `Até ${formatEndDate(state.endDate)}`}
            </p>
          </div>
        </div>
      </section>

      {/* Criativo */}
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-typography-heading">Criativo e Copy</h3>
        <div className="p-3 rounded-lg border border-surface-border bg-white space-y-2">
          <p className="text-xs text-typography-body">
            <span className="font-bold inline-block w-36 text-typography-muted">Título:</span>
            {renderedHeadline || '—'}
          </p>
          <p className="text-xs text-typography-body">
            <span className="font-bold inline-block w-36 text-typography-muted">Mensagem:</span>
            {renderedMessage || '—'}
          </p>
          {state.destinationType === 'WHATSAPP_MESSAGE' && (
            <p className="text-xs text-typography-body">
              <span className="font-bold inline-block w-36 text-typography-muted">Saudação:</span>
              {state.whatsappGreeting || '—'}
            </p>
          )}
        </div>
      </section>

      {publishError && (
        <div className="p-4 rounded-lg border border-status-error-border bg-status-error-bg">
          <p className="text-sm font-semibold text-status-error-text">
            Não foi possível publicar a campanha.
          </p>
          <p className="mt-1 text-xs text-status-error-text">{publishError}</p>
        </div>
      )}

      {!budgetValid && (
        <div className="p-4 rounded-lg border border-status-error-border bg-status-error-bg">
          <p className="text-sm font-semibold text-status-error-text">
            Orçamento abaixo do mínimo de R$ {MIN_DAILY_BUDGET_REAIS.toFixed(2)}/dia. Volte ao passo
            4 para corrigir.
          </p>
        </div>
      )}

      {metaAuthError && (
        <div
          className="p-4 rounded-lg border border-status-error-border bg-status-error-bg"
          role="alert"
        >
          <p className="text-sm font-semibold text-status-error-text">
            Sessão Meta não conectada
          </p>
          <p className="mt-1 text-xs text-status-error-text">
            Conecte sua conta de anúncios da Meta para publicar a campanha.
          </p>
          {onConnectMeta && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={onConnectMeta}
              disabled={isPublishing}
              loading={isConnectingMeta}
            >
              {isConnectingMeta ? 'Conectando...' : 'Conectar conta da Meta'}
            </Button>
          )}
        </div>
      )}

      {!metaAuthError && !assetsValid && (
        <div
          className="p-4 rounded-lg border border-status-error-border bg-status-error-bg"
          role="alert"
        >
          <p className="text-sm font-semibold text-status-error-text">
            Ativos não configurados
          </p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs text-status-error-text">
            {!accountConfigured && (
              <li>
                Conta de anúncios não selecionada. Volte ao Passo 2 para escolher uma conta ativa.
              </li>
            )}
            {!pageConfigured && (
              <li>
                Página do Facebook não selecionada. Volte ao Passo 2 para escolher uma página.
              </li>
            )}
          </ul>
          {onGoToAssets && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              icon={<Store className="w-4 h-4" />}
              onClick={onGoToAssets}
              disabled={isPublishing}
            >
              Ir para Conta & Página
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          variant="ghost"
          icon={<Store className="w-4 h-4" />}
          onClick={onBack}
          disabled={isPublishing}
        >
          Voltar
        </Button>

        <Button
          variant="primary"
          size="lg"
          icon={<Rocket className="w-4 h-4" />}
          onClick={onPublish}
          disabled={isPublishing || !budgetValid || !assetsValid}
          className="ml-auto"
        >
          {isPublishing ? 'Publicando...' : 'Publicar Campanha'}
        </Button>
      </div>
    </div>
  );
}