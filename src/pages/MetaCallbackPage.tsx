import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  ExternalLink,
  Store,
  Layers,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { useAuth } from '../context/AuthContext.js';
import {
  getMetaOAuthRedirectUri,
  metaIntegrationService,
  type MetaBusinessAccount,
  type MetaCatalogItem,
  type MetaCallbackResponse,
  type SelectCatalogResponse,
} from '../services/api/metaIntegrationService.js';
import { ApiError } from '../types/api.js';

type Phase =
  | 'loading'
  | 'select'
  | 'create'
  | 'success'
  | 'oauth-error';

export interface MetaOAuthNavigationState {
  metaOAuthResult: 'success' | 'error';
  tab?: 'meta-feed';
  message?: string;
  catalogs?: MetaCatalogItem[];
  catalogsFound?: number;
}

const COMMERCE_MANAGER_URL = 'https://business.facebook.com/commerce_manager';

type CallbackResult =
  | { ok: true; data: MetaCallbackResponse }
  | { ok: false; message: string };

// OAuth codes da Meta são de uso único (single-use). Em modo de desenvolvimento o
// React StrictMode monta/desmonta o componente duas vezes; um cache de Promises em voo
// por `code:state` garante que chamadas quase simultâneas compartilhem a mesma requisição,
// evitando consumir o mesmo code duas vezes ou disparar requisições duplicadas.
const callbackPromises = new Map<string, Promise<CallbackResult>>();

function runCallback(code: string, state: string): Promise<CallbackResult> {
  const key = `${code}:${state}`;
  const existing = callbackPromises.get(key);
  if (existing) {
    console.log(`[MetaCallbackPage] Reutilizando requisição em voo/concluída para code:state=${key}`);
    return existing;
  }

  const promise = (async (): Promise<CallbackResult> => {
    try {
      const response = await metaIntegrationService.completeCallback({
        code,
        state,
        redirectUri: getMetaOAuthRedirectUri(),
      });
      console.log(
        `[MetaCallbackPage] Callback concluído — ${response.catalogs.length} catálogo(s), ${response.businesses.length} negócio(s), sugerido="${response.suggestedCatalogName}"`,
      );
      return { ok: true, data: response };
    } catch (err) {
      callbackPromises.delete(key);
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível concluir a conexão com a Meta.';
      console.log(`[MetaCallbackPage] Callback falhou — ${message}`);
      return { ok: false, message };
    }
  })();

  callbackPromises.set(key, promise);
  return promise;
}

export function MetaCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [callbackData, setCallbackData] = useState<MetaCallbackResponse | null>(null);

  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [wantCreateNew, setWantCreateNew] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [catalogNameInput, setCatalogNameInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [result, setResult] = useState<SelectCatalogResponse | null>(null);

  const redirectToDashboard = (state: MetaOAuthNavigationState) => {
    navigate('/', { replace: true, state });
  };

  useEffect(() => {
    if (isAuthLoading) {
      console.log('[MetaCallbackPage] Aguardando inicialização da sessão de autenticação...');
      return;
    }

    if (!isAuthenticated) {
      console.log('[MetaCallbackPage] Usuário não autenticado no aplicativo local.');
      return;
    }

    const oauthError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (oauthError) {
      console.log(`[MetaCallbackPage] Erro OAuth recebido: ${oauthError} — ${errorDescription ?? ''}`);
      setPhase('oauth-error');
      setErrorMessage(errorDescription ?? 'Autorização cancelada ou recusada pela Meta.');
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    console.log(
      `[MetaCallbackPage] Parâmetros recebidos — code: ${code ? 'presente' : 'ausente'}, state: ${state ? 'presente' : 'ausente'}`,
    );

    if (!code || !state) {
      setPhase('oauth-error');
      setErrorMessage('Parâmetros de retorno OAuth inválidos. Tente conectar novamente.');
      return;
    }

    let cancelled = false;
    void runCallback(code, state).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        const response = res.data;
        setCallbackData(response);
        setSelectedBusinessId(response.businesses[0]?.id ?? '');
        setCatalogNameInput(response.suggestedCatalogName || '');
        setPhase(response.catalogs.length > 0 ? 'select' : 'create');
      } else {
        setPhase('oauth-error');
        setErrorMessage(res.message);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isAuthenticated, searchParams]);

  useEffect(() => {
    if (phase !== 'success' || !result) return;
    const timer = window.setTimeout(() => {
      redirectToDashboard({
        metaOAuthResult: 'success',
        tab: 'meta-feed',
        message: `Catálogo "${result.catalogName}" vinculado à Meta (ID ${result.catalogId}).`,
      });
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [phase, result]);

  const selectedCatalog = useMemo(
    () => callbackData?.catalogs.find((c) => c.id === selectedCatalogId) ?? null,
    [callbackData, selectedCatalogId],
  );

  const handleSelectExisting = async () => {
    if (!callbackData || !selectedCatalog) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await metaIntegrationService.selectCatalog({
        workspaceId: callbackData.workspaceId,
        metaSessionToken: callbackData.metaSessionToken,
        catalogId: selectedCatalog.id,
        catalogName: selectedCatalog.name,
      });
      setResult(res);
      setPhase('success');
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Não foi possível vincular o catálogo selecionado.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNew = async () => {
    if (!callbackData) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await metaIntegrationService.selectCatalog({
        workspaceId: callbackData.workspaceId,
        metaSessionToken: callbackData.metaSessionToken,
        createNew: true,
        businessId: selectedBusinessId,
        catalogName: catalogNameInput.trim(),
      });
      setResult(res);
      setPhase('success');
    } catch (err) {
      const metaMessage = err instanceof ApiError ? err.message : 'A Meta recusou a criação do catálogo.';
      const hint =
        err instanceof ApiError && err.details?.hint
          ? (err.details.hint as string)
          : 'Verifique se você é Administrador do Gerenciador de Negócios ou crie manualmente no Meta Commerce Manager.';
      setActionError(`${metaMessage} ${hint}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderHeader = (title: string, subtitle: string) => (
    <div className="text-center mb-6">
      <h1 className="text-xl font-bold text-typography-heading">{title}</h1>
      <p className="text-sm text-typography-muted mt-1">{subtitle}</p>
    </div>
  );

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-brand-primary animate-spin mx-auto" />
            <h1 className="text-lg font-bold text-typography-heading">Carregando autenticação...</h1>
            <p className="text-sm text-typography-muted">
              Aguardando validação da sua sessão para conectar à Meta Ads.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h1 className="text-lg font-bold text-typography-heading">Sessão Expirada</h1>
            <p className="text-sm text-typography-muted">
              Sua sessão local não está ativa. Faça login para concluir a vinculação do catálogo Meta.
            </p>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                navigate('/login', { state: { from: `/meta/callback${window.location.search}` } });
              }}
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 sm:p-8">
          {phase === 'loading' && (
            <div className="space-y-4 text-center py-6">
              <Loader2 className="w-10 h-10 text-brand-primary animate-spin mx-auto" />
              <h1 className="text-lg font-bold text-typography-heading">Conectando Meta Ads</h1>
              <p className="text-sm text-typography-muted">
                Finalizando autorização e buscando seus catálogos na Meta...
              </p>
            </div>
          )}

          {phase === 'oauth-error' && (
            <div className="space-y-5 text-center py-4">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <h1 className="text-lg font-bold text-typography-heading">Falha na conexão</h1>
              <p className="text-sm text-typography-muted">{errorMessage}</p>
              <Button
                variant="primary"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => redirectToDashboard({ metaOAuthResult: 'error', tab: 'meta-feed', message: errorMessage ?? '' })}
              >
                Voltar ao Dashboard
              </Button>
            </div>
          )}

          {phase === 'select' && callbackData && (
            <div className="space-y-5">
              {renderHeader(
                'Selecione o catálogo de veículos',
                'Escolha qual catálogo deseja conectar ao seu estoque ou crie um novo.',
              )}

              {actionError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
                  {actionError}
                </div>
              ) : null}

              {!wantCreateNew ? (
                <div className="space-y-3">
                  {callbackData.catalogs.map((catalog) => {
                    const isSelected = selectedCatalogId === catalog.id;
                    return (
                      <button
                        key={catalog.id}
                        type="button"
                        onClick={() => setSelectedCatalogId(catalog.id)}
                        className={`w-full text-left rounded-xl border p-4 transition-all ${
                          isSelected
                            ? 'border-brand-primary bg-brand-primaryLight ring-2 ring-brand-primary/30'
                            : 'border-surface-border hover:border-brand-primary/40 hover:bg-surface-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                                isSelected ? 'border-brand-primary bg-brand-primary' : 'border-typography-subtle'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-typography-heading truncate">
                                  {catalog.name}
                                </span>
                                {catalog.vertical === 'vehicles' ? (
                                  <Badge variant="primary" size="sm">Veículos</Badge>
                                ) : (
                                  <Badge variant="neutral" size="sm">{catalog.vertical || 'Geral'}</Badge>
                                )}
                              </div>
                              <p className="text-xs font-mono text-typography-subtle mt-0.5">
                                {catalog.id}
                                {catalog.productCount !== undefined
                                  ? ` · ${catalog.productCount} produto(s)`
                                  : ''}
                              </p>
                              {catalog.businessName ? (
                                <p className="text-xs text-typography-muted mt-0.5 flex items-center gap-1">
                                  <Store className="w-3 h-3" /> {catalog.businessName}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <Layers className="w-4 h-4 text-typography-subtle shrink-0" />
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setWantCreateNew(true)}
                    className="w-full rounded-xl border border-dashed border-surface-border text-typography-muted hover:border-brand-primary/50 hover:text-brand-primary p-4 flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Criar um novo catálogo para este negócio
                  </button>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    disabled={!selectedCatalogId}
                    loading={submitting}
                    onClick={() => void handleSelectExisting()}
                  >
                    Confirmar e Vincular Catálogo
                  </Button>
                </div>
              ) : (
                <CreateCatalogForm
                  businesses={callbackData.businesses}
                  selectedBusinessId={selectedBusinessId}
                  onBusinessChange={setSelectedBusinessId}
                  catalogName={catalogNameInput}
                  onCatalogNameChange={setCatalogNameInput}
                  submitting={submitting}
                  onBack={() => setWantCreateNew(false)}
                  onSubmit={() => void handleCreateNew()}
                  onGoToCommerceManager={() => window.open(COMMERCE_MANAGER_URL, '_blank', 'noopener,noreferrer')}
                />
              )}
            </div>
          )}

          {phase === 'create' && callbackData && (
            <div className="space-y-5">
              {renderHeader(
                'Nenhum catálogo encontrado',
                'Seu Gerenciador de Negócios ainda não possui um catálogo de veículos. Crie um agora para conectar seu estoque.',
              )}

              {actionError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm space-y-1">
                  <p className="font-semibold">A Meta recusou a criação do catálogo</p>
                  <p>{actionError}</p>
                </div>
              ) : null}

              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/70 text-blue-900 px-4 py-3 text-xs">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  A criação programática exige função de <strong>Administrador</strong> no
                  Gerenciador de Negócios. Se preferir, crie manualmente no{' '}
                  <a
                    href={COMMERCE_MANAGER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    Meta Commerce Manager
                  </a>{' '}
                  e volte para vincular o catálogo existente.
                </p>
              </div>

              <CreateCatalogForm
                businesses={callbackData.businesses}
                selectedBusinessId={selectedBusinessId}
                onBusinessChange={setSelectedBusinessId}
                catalogName={catalogNameInput}
                onCatalogNameChange={setCatalogNameInput}
                submitting={submitting}
                onSubmit={() => void handleCreateNew()}
                onGoToCommerceManager={() => window.open(COMMERCE_MANAGER_URL, '_blank', 'noopener,noreferrer')}
              />
            </div>
          )}

          {phase === 'success' && result && (
            <div className="space-y-4 text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h1 className="text-lg font-bold text-typography-heading">
                {result.created ? 'Catálogo criado e vinculado!' : 'Catálogo vinculado!'}
              </h1>
              <div className="rounded-lg border border-green-200 bg-green-50 text-green-800 px-4 py-3 text-sm">
                <p className="font-semibold">{result.catalogName}</p>
                <p className="font-mono text-xs mt-1">#{result.catalogId}</p>
              </div>
              <p className="text-xs text-typography-muted">
                Redirecionando para o Dashboard na aba Feed Meta DAA...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface CreateCatalogFormProps {
  businesses: MetaBusinessAccount[];
  selectedBusinessId: string;
  onBusinessChange: (id: string) => void;
  catalogName: string;
  onCatalogNameChange: (name: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  onBack?: () => void;
  onGoToCommerceManager: () => void;
}

function CreateCatalogForm({
  businesses,
  selectedBusinessId,
  onBusinessChange,
  catalogName,
  onCatalogNameChange,
  submitting,
  onSubmit,
  onBack,
  onGoToCommerceManager,
}: CreateCatalogFormProps) {
  const canSubmit = Boolean(selectedBusinessId) && catalogName.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-typography-heading uppercase tracking-wide">
          Nome do novo catálogo de veículos
        </label>
        <input
          type="text"
          value={catalogName}
          onChange={(e) => onCatalogNameChange(e.target.value)}
          placeholder="Ex.: Minha Revenda - Catálogo Meta Automotive Ads"
          className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {businesses.length > 1 ? (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-typography-heading uppercase tracking-wide">
            Gerenciador de Negócios
          </label>
          <select
            value={selectedBusinessId}
            onChange={(e) => onBusinessChange(e.target.value)}
            className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        icon={<Plus className="w-4 h-4" />}
        disabled={!canSubmit}
        loading={submitting}
        onClick={onSubmit}
      >
        Criar Catálogo de Veículos na Meta
      </Button>

      <div className="flex items-center justify-between pt-1">
        {onBack ? (
          <Button variant="ghost" size="sm" onClick={onBack} disabled={submitting}>
            Voltar
          </Button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onGoToCommerceManager}
          className="inline-flex items-center gap-1 text-xs text-brand-primary hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Criar manualmente no Meta Commerce Manager
        </button>
      </div>
    </div>
  );
}
