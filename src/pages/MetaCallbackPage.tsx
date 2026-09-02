import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card.js';
import {
  getMetaOAuthRedirectUri,
  metaIntegrationService,
  type MetaCatalogItem,
} from '../services/api/metaIntegrationService.js';
import { ApiError } from '../types/api.js';

export interface MetaOAuthNavigationState {
  metaOAuthResult: 'success' | 'error';
  message?: string;
  catalogs?: MetaCatalogItem[];
  catalogsFound?: number;
}

export function MetaCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const finishWithError = (message: string) => {
      setErrorMessage(message);
      window.setTimeout(() => {
        navigate('/onboarding', {
          replace: true,
          state: {
            metaOAuthResult: 'error',
            message,
          } satisfies MetaOAuthNavigationState,
        });
      }, 2500);
    };

    const oauthError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (oauthError) {
      finishWithError(
        errorDescription ?? 'Autorização cancelada ou recusada pela Meta.',
      );
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      finishWithError('Parâmetros de retorno OAuth inválidos. Tente conectar novamente.');
      return;
    }

    void (async () => {
      try {
        const response = await metaIntegrationService.completeCallback({
          code,
          state,
          redirectUri: getMetaOAuthRedirectUri(),
        });

        navigate('/onboarding', {
          replace: true,
          state: {
            metaOAuthResult: 'success',
            catalogs: response.catalogs,
            catalogsFound: response.catalogsFound,
            message:
              response.catalogsFound > 0
                ? `Conexão concluída. ${response.catalogsFound} catálogo(s) encontrado(s) na Meta.`
                : 'Conexão concluída. Nenhum catálogo encontrado na conta Meta vinculada.',
          } satisfies MetaOAuthNavigationState,
        });
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Não foi possível concluir a conexão com a Meta.';
        finishWithError(message);
      }
    })();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-4 text-center">
        {errorMessage ? (
          <>
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h1 className="text-lg font-bold text-typography-heading">Falha na conexão</h1>
            <p className="text-sm text-typography-muted">{errorMessage}</p>
            <p className="text-xs text-typography-subtle">Redirecionando ao onboarding...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-brand-primary animate-spin mx-auto" />
            <h1 className="text-lg font-bold text-typography-heading">Conectando Meta Ads</h1>
            <p className="text-sm text-typography-muted">
              Finalizando autorização OAuth e vinculando sua conta...
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-brand-accent">
              <CheckCircle2 className="w-4 h-4" />
              <span>Aguarde um instante</span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
