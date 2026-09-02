import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { DataFetchError } from '../ui/DataFetchError.js';
import { useWorkspace } from '../../hooks/useWorkspace.js';
import {
  dashboardService,
  type MetaCatalogSummary,
} from '../../services/api/dashboardService.js';
import { metaIntegrationService } from '../../services/api/metaIntegrationService.js';
import { ApiError } from '../../types/api.js';
import type { MetaOAuthNavigationState } from '../../pages/MetaCallbackPage.js';

const META_CONNECT_ROLES = new Set(['OWNER', 'SUPER_ADMIN']);

export interface OnboardingMetaStepProps {
  disabled?: boolean;
}

export function OnboardingMetaStep({ disabled = false }: OnboardingMetaStepProps) {
  const { workspaceId, role } = useWorkspace();
  const location = useLocation();
  const oauthState = location.state as MetaOAuthNavigationState | null;

  const [catalog, setCatalog] = useState<MetaCatalogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [oauthBanner, setOauthBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const canConnect = role ? META_CONNECT_ROLES.has(role) : false;

  const loadCatalog = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);
      const catalogs = await dashboardService.listMetaCatalogs(workspaceId);
      setCatalog(catalogs[0] ?? null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao carregar status da integração Meta.';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (!oauthState?.metaOAuthResult) return;

    if (oauthState.metaOAuthResult === 'success') {
      setOauthBanner({
        type: 'success',
        message:
          oauthState.message ??
          (oauthState.catalogsFound
            ? `Conexão concluída. ${oauthState.catalogsFound} catálogo(s) encontrado(s).`
            : 'Conexão concluída com sucesso.'),
      });
      void loadCatalog();
    } else {
      setOauthBanner({
        type: 'error',
        message: oauthState.message ?? 'Não foi possível concluir a conexão com a Meta.',
      });
    }

    window.history.replaceState({}, document.title);
  }, [oauthState, loadCatalog]);

  const handleConnect = async () => {
    if (!workspaceId || !canConnect) return;

    setFormError(null);
    setOauthBanner(null);

    try {
      setIsConnecting(true);
      const { authUrl } = await metaIntegrationService.getAuthUrl(workspaceId);
      window.location.href = authUrl;
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível iniciar a conexão com a Meta.',
      );
      setIsConnecting(false);
    }
  };

  const isConnected = Boolean(catalog?.metaCatalogId);
  const oauthCatalogName = oauthState?.catalogs?.[0]?.name;
  const displayCatalogName = catalog?.catalogName ?? oauthCatalogName ?? null;

  if (!workspaceId) {
    return <DataFetchError message="Workspace não encontrado. Faça login novamente." />;
  }

  if (loading) {
    return (
      <Card className="p-6 space-y-4 animate-pulse">
        <div className="h-5 w-56 bg-surface-muted rounded" />
        <div className="h-24 bg-surface-muted rounded" />
        <div className="h-10 w-40 bg-surface-muted rounded" />
      </Card>
    );
  }

  if (loadError && !catalog && !oauthBanner) {
    return <DataFetchError message={loadError} onRetry={() => void loadCatalog()} />;
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start gap-3">
        <span className="p-2 rounded-lg bg-blue-50 text-brand-primary shrink-0">
          <Share2 className="w-5 h-5" />
        </span>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-typography-heading">Conexão Meta Ads</h3>
            <Badge variant="neutral" size="sm">
              Opcional
            </Badge>
          </div>
          <p className="text-sm text-typography-muted">
            Conecte sua conta Meta Business para publicar veículos no Automotive Ads. Você pode
            configurar isso depois no dashboard.
          </p>
        </div>
      </div>

      {!canConnect ? (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Apenas usuários com perfil <strong>Owner</strong> podem conectar a Meta Ads. Você pode
            pular esta etapa e concluir o onboarding normalmente.
          </span>
        </div>
      ) : null}

      {oauthBanner ? (
        <div
          className={`p-3 rounded-lg border flex items-start gap-2 text-xs ${
            oauthBanner.type === 'success'
              ? 'bg-green-50/80 border-green-200 text-green-800'
              : 'bg-red-50/80 border-red-200 text-red-800'
          }`}
        >
          {oauthBanner.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{oauthBanner.message}</span>
        </div>
      ) : null}

      {isConnected || oauthBanner?.type === 'success' ? (
        <div className="p-4 rounded-lg bg-surface-muted/60 border border-surface-border space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className="text-[11px] font-semibold text-typography-muted uppercase tracking-wider">
                Status da integração
              </span>
              <p className="text-sm font-bold text-typography-heading mt-0.5">
                {displayCatalogName ?? 'Catálogo Meta vinculado'}
              </p>
            </div>
            <Badge variant="available" size="sm" dot>
              Conectada
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-typography-muted">ID Meta Catalog</span>
              <p className="font-mono text-typography-heading mt-0.5">
                {catalog?.metaCatalogId ?? oauthState?.catalogs?.[0]?.id ?? '—'}
              </p>
            </div>
            <div>
              <span className="text-typography-muted">Veículos elegíveis</span>
              <p className="font-bold text-typography-heading mt-0.5">
                {catalog?.eligibleVehiclesCount ?? 0}
                {catalog?.totalVehiclesCount != null
                  ? ` de ${catalog.totalVehiclesCount}`
                  : ''}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-dashed border-surface-border bg-surface-muted/30 space-y-3">
          <p className="text-sm text-typography-muted">
            Ao conectar, você será redirecionado para a Meta para autorizar o acesso ao Business
            Manager e aos catálogos de produtos automotivos.
          </p>
          <Button
            variant="primary"
            size="md"
            icon={<ExternalLink className="w-4 h-4" />}
            onClick={() => void handleConnect()}
            loading={isConnecting}
            disabled={disabled || !canConnect || isConnecting}
          >
            Conectar Meta Ads
          </Button>
        </div>
      )}

      {isConnected && canConnect ? (
        <Button
          variant="outline"
          size="md"
          icon={<ExternalLink className="w-4 h-4" />}
          onClick={() => void handleConnect()}
          loading={isConnecting}
          disabled={disabled || isConnecting}
        >
          Reconectar conta Meta
        </Button>
      ) : null}

      {formError ? (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {formError}
        </p>
      ) : null}
    </Card>
  );
}
