import { useCallback, useEffect, useState } from 'react';
import {
  CreditCard,
  ExternalLink,
  FileText,
  ShieldAlert,
  Car,
  Wifi,
  Users,
  Tags,
  Sparkles,
  Headphones,
  RefreshCw,
  FileX2,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card.js';
import { Button } from '../../../components/ui/Button.js';
import { useWorkspace } from '../../../hooks/useWorkspace.js';
import { useSubscription } from '../../../context/SubscriptionContext.js';
import {
  billingService,
  type InvoiceItem,
} from '../../../services/api/billingService.js';
import { formatCurrencyCents, formatDate, formatRelativeTime } from '../../../utils/format.js';
import { ApiError } from '../../../types/api.js';

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'Ativa';
    case 'TRIALING': return 'Período de teste';
    case 'EXPIRED': return 'Teste expirado';
    case 'PAST_DUE': return 'Pagamento em atraso';
    case 'CANCELED': return 'Cancelada';
    case 'SUSPENDED': return 'Suspensa';
    case 'NONE': return 'Sem assinatura';
    default: return status;
  }
}

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'bg-green-50 text-green-700 border-green-200';
    case 'TRIALING': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'PAST_DUE': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'SUSPENDED': return 'bg-red-50 text-red-700 border-red-200';
    case 'CANCELED': return 'bg-gray-100 text-gray-600 border-gray-200';
    default: return 'bg-surface-muted text-typography-muted border-surface-border';
  }
}

function formatLimit(value: number): string {
  if (value === Infinity) return 'Ilimitado';
  return String(value);
}

function getInvoiceStatusLabel(status: string): string {
  switch (status) {
    case 'paid': return 'Paga';
    case 'open': return 'Pendente';
    case 'void': return 'Cancelada';
    case 'uncollectible': return 'Cancelada';
    case 'draft': return 'Rascunho';
    default: return status;
  }
}

function getInvoiceStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'paid': return 'bg-green-50 text-green-700 border-green-200';
    case 'open': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'void':
    case 'uncollectible': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-surface-muted text-typography-muted border-surface-border';
  }
}

export function BillingSettingsTab() {
  const { role, workspaceId } = useWorkspace();
  const { billing, isLoading: billingLoading, refetchBilling } = useSubscription();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);

  const isOwnerOrAdmin = role === 'OWNER' || role === 'SUPER_ADMIN';

  const loadInvoices = useCallback(async () => {
    if (!workspaceId) return;
    setInvoicesLoading(true);
    setInvoicesError(null);
    try {
      const response = await billingService.getInvoices(workspaceId, { page: 1, limit: 50 });
      setInvoices(response.items ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar o histórico de faturas.';
      setInvoicesError(message);
    } finally {
      setInvoicesLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (isOwnerOrAdmin) {
      void loadInvoices();
    }
  }, [isOwnerOrAdmin, loadInvoices]);

  if (!isOwnerOrAdmin) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-typography-heading">Acesso Restrito</h3>
            <p className="text-sm text-typography-muted mt-1 max-w-md mx-auto">
              Somente o proprietário ({`OWNER`}) ou super administrador pode gerenciar o faturamento e a assinatura.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleOpenPortal = async () => {
    try {
      setIsOpeningPortal(true);
      setError(null);
      const returnUrl = `${window.location.origin}/settings/billing`;
      const session = await billingService.createPortalSession(returnUrl);
      window.location.href = session.url;
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível abrir o portal de faturamento.';
      setError(message);
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const limits = billing?.limits;
  const currentPeriodShown =
    billing?.currentPeriodEnd &&
    (billing.status === 'ACTIVE' || billing.status === 'TRIALING')
      ? billing.currentPeriodEnd
      : null;

  return (
    <div className="space-y-6">
      {/* Seção 1 — Assinatura Ativa & Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-primary/10">
              <CreditCard className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-typography-heading">Assinatura & Plano</h3>
              <p className="text-xs text-typography-muted">Detalhes da sua assinatura atual</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`text-xs font-semibold border px-2.5 py-1 rounded-full ${getStatusBadgeClasses(billing?.status ?? 'NONE')}`}
            >
              {billingLoading ? 'Carregando...' : billing ? getStatusLabel(billing.status) : getStatusLabel('NONE')}
            </span>
            {billing?.cancelAtPeriodEnd && (
              <span className="text-xs font-semibold bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full">
                Cancelamento ao fim do período
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-typography-muted">Plano</label>
              <p className="text-sm font-semibold text-typography-heading bg-surface-muted rounded-md px-3 py-2">
                {billing?.planTier ?? '—'}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-typography-muted">
                {currentPeriodShown ? 'Período atual até' : 'Fim do período'}
              </label>
              <p className="text-sm font-semibold text-typography-heading bg-surface-muted rounded-md px-3 py-2">
                {billing ? formatRelativeTime(billing.currentPeriodEnd) : 'Carregando...'}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => void handleOpenPortal()}
              loading={isOpeningPortal}
            >
              Gerenciar assinatura (Stripe)
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => {
                void refetchBilling();
                void loadInvoices();
              }}
            >
              Atualizar status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seção 2 — Limites de Recursos do Plano */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-accent/10">
              <Tags className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-typography-heading">Limites de Recursos</h3>
              <p className="text-xs text-typography-muted">Uso permitido pelo plano contratado</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {limits ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-lg border border-surface-border bg-surface-muted/50 p-4">
                  <Car className="w-4 h-4 text-brand-primary mb-2" />
                  <p className="text-[11px] font-medium text-typography-muted">Estoque de Veículos</p>
                  <p className="text-lg font-bold text-typography-heading">{formatLimit(limits.maxVehicles)}</p>
                </div>
                <div className="rounded-lg border border-surface-border bg-surface-muted/50 p-4">
                  <Wifi className="w-4 h-4 text-brand-primary mb-2" />
                  <p className="text-[11px] font-medium text-typography-muted">Feeds XML de Estoque</p>
                  <p className="text-lg font-bold text-typography-heading">{formatLimit(limits.maxFeeds)}</p>
                </div>
                <div className="rounded-lg border border-surface-border bg-surface-muted/50 p-4">
                  <Users className="w-4 h-4 text-brand-primary mb-2" />
                  <p className="text-[11px] font-medium text-typography-muted">Membros da Equipe</p>
                  <p className="text-lg font-bold text-typography-heading">{formatLimit(limits.maxMembers)}</p>
                </div>
                <div className="rounded-lg border border-surface-border bg-surface-muted/50 p-4">
                  <Tags className="w-4 h-4 text-brand-primary mb-2" />
                  <p className="text-[11px] font-medium text-typography-muted">Catálogos Meta Ads</p>
                  <p className="text-lg font-bold text-typography-heading">{formatLimit(limits.maxMetaCatalogs)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-2.5 py-1 rounded-full ${
                    limits.hasAiBlogWorker
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-surface-muted text-typography-muted border-surface-border'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gerador de Artigos IA {limits.hasAiBlogWorker ? '— ativo' : '— bloqueado'}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-2.5 py-1 rounded-full ${
                    limits.hasPrioritySupport
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-surface-muted text-typography-muted border-surface-border'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  Suporte Prioritário {limits.hasPrioritySupport ? '— ativo' : '— padrão'}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-typography-muted">
              {billingLoading
                ? 'Carregando limites do plano...'
                : 'Limites do plano indisponíveis no momento.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Seção 3 — Histórico de Faturas Stripe */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-typography-heading">Histórico de Faturas</h3>
              <p className="text-xs text-typography-muted">Comprovantes de cobrança da sua assinatura</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <p className="text-sm text-typography-muted">Carregando faturas...</p>
          ) : invoicesError ? (
            <div className="text-center space-y-3 py-6">
              <FileX2 className="w-8 h-8 text-typography-muted mx-auto" />
              <p className="text-xs text-red-600">{invoicesError}</p>
              <Button variant="outline" size="sm" onClick={() => void loadInvoices()}>
                Tentar novamente
              </Button>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center space-y-2 py-8">
              <FileText className="w-8 h-8 text-typography-muted mx-auto" />
              <p className="text-sm font-semibold text-typography-heading">
                Nenhuma cobrança gerada ainda
              </p>
              <p className="text-xs text-typography-muted max-w-md mx-auto">
                {billing?.status === 'TRIALING'
                  ? 'Seu período de teste está em andamento — as primeiras faturas aparecerão aqui após a contratação do plano.'
                  : 'Ainda não há faturas para este workspace. Elas aparecerão aqui assim que o primeiro pagamento for processado.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-typography-muted border-b border-surface-border">
                    <th className="px-3 py-2 font-semibold">Data</th>
                    <th className="px-3 py-2 font-semibold">Identificador</th>
                    <th className="px-3 py-2 font-semibold">Valor</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold text-right">Comprovante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="px-3 py-3 text-xs text-typography-body whitespace-nowrap">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="px-3 py-3 text-xs font-mono text-typography-heading">
                        {invoice.number}
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-typography-heading whitespace-nowrap">
                        {formatCurrencyCents(invoice.amount, invoice.currency)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block text-[11px] font-semibold border px-2 py-0.5 rounded-full ${getInvoiceStatusBadgeClasses(invoice.status)}`}
                        >
                          {getInvoiceStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<FileText className="w-3.5 h-3.5" />}
                          onClick={() => {
                            const url = invoice.pdfUrl ?? invoice.hostedUrl;
                            if (url) window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          disabled={!invoice.pdfUrl && !invoice.hostedUrl}
                          title="Baixar comprovante em PDF"
                        >
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}