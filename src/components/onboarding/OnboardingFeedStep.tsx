import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Link,
  RefreshCw,
  Rss,
  Sparkles,
  Timer,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { DataFetchError } from '../ui/DataFetchError.js';
import { DMS_PRESETS, type DmsPreset } from '../xml-mapper/DmsPresetSelector.js';
import { useWorkspace } from '../../hooks/useWorkspace.js';
import {
  feedService,
  computeSyncTimeout,
  type FeedConfigSummary,
} from '../../services/api/feedService.js';
import { vehicleService, type Vehicle } from '../../services/api/vehicleService.js';
import { ApiError } from '../../types/api.js';
import {
  type FeedDetectedFormat,
  getFeedValidationSuccessMessage,
  getPresetIdsForFormat,
  resolvePresetIdFromSuggestion,
  resolveSourceTypeForFeed,
  sourceTypeToPresetId,
} from '../../utils/feedPresets.js';

export interface OnboardingFeedStepHandle {
  connectAndValidate: () => Promise<boolean>;
}

export interface OnboardingFeedStepProps {
  disabled?: boolean;
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function findPresetById(presetId: string): DmsPreset {
  return DMS_PRESETS.find((preset) => preset.id === presetId) ?? DMS_PRESETS[0];
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const OnboardingFeedStep = forwardRef<OnboardingFeedStepHandle, OnboardingFeedStepProps>(
  function OnboardingFeedStep({ disabled = false }, ref) {
    const { workspaceId } = useWorkspace();
    const [feedUrl, setFeedUrl] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<DmsPreset>(DMS_PRESETS[0]);
    const [connectedFeed, setConnectedFeed] = useState<FeedConfigSummary | null>(null);
    const [previewVehicles, setPreviewVehicles] = useState<Vehicle[]>([]);
    const [urlStatus, setUrlStatus] = useState<'IDLE' | 'VALID' | 'INVALID'>('IDLE');
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [vehicleCount, setVehicleCount] = useState<number | null>(null);
    const [detectedFormat, setDetectedFormat] = useState<FeedDetectedFormat | null>(null);
    const [suggestedSourceType, setSuggestedSourceType] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isValidatingUrl, setIsValidatingUrl] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [syncJobStatus, setSyncJobStatus] = useState<'waiting' | 'active' | 'completed' | null>(
      null,
    );
    const [syncProgress, setSyncProgress] = useState<number | null>(null);
    const [syncElapsed, setSyncElapsed] = useState(0);
    const syncElapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearSyncTimer = useCallback(() => {
      if (syncElapsedRef.current) {
        clearInterval(syncElapsedRef.current);
        syncElapsedRef.current = null;
      }
    }, []);

    useEffect(() => {
      return () => clearSyncTimer();
    }, [clearSyncTimer]);

    const visiblePresets = DMS_PRESETS.filter((preset) =>
      getPresetIdsForFormat(detectedFormat).includes(preset.id),
    );

    const loadPreview = useCallback(async () => {
      if (!workspaceId) return;

      const response = await vehicleService.listVehicles(workspaceId, { limit: 5, page: 1 });
      setPreviewVehicles(response.items);
      return response.items;
    }, [workspaceId]);

    const loadExistingFeed = useCallback(async () => {
      if (!workspaceId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError(null);
        const feeds = await feedService.listFeeds(workspaceId);
        const activeFeed = feeds.find((feed) => feed.isActive) ?? feeds[0];

        if (!activeFeed) {
          return;
        }

        setConnectedFeed(activeFeed);
        setFeedUrl(activeFeed.feedUrl);
        setUrlStatus('VALID');

        const presetId = sourceTypeToPresetId(activeFeed.sourceType);
        if (presetId) {
          setSelectedPreset(findPresetById(presetId));
        }

        const vehicles = await loadPreview();
        if (vehicles && vehicles.length > 0) {
          setStatusMessage(`${vehicles.length} veículo(s) importados do feed conectado.`);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar feeds existentes';
        setLoadError(message);
      } finally {
        setLoading(false);
      }
    }, [workspaceId, loadPreview]);

    useEffect(() => {
      void loadExistingFeed();
    }, [loadExistingFeed]);

    const handleFeedUrlChange = (value: string) => {
      setFeedUrl(value);
      setUrlStatus('IDLE');
      setValidationMessage(null);
      setVehicleCount(null);
      setDetectedFormat(null);
      setSuggestedSourceType(null);
      setFormError(null);
      setStatusMessage(null);

      if (connectedFeed && value.trim() !== connectedFeed.feedUrl) {
        setConnectedFeed(null);
        setPreviewVehicles([]);
      }
    };

    const handleTestUrl = async () => {
      const trimmedUrl = feedUrl.trim();

      if (!workspaceId) {
        setUrlStatus('INVALID');
        setValidationMessage('Workspace não encontrado. Faça login novamente.');
        return;
      }

      if (!trimmedUrl) {
        setUrlStatus('INVALID');
        setValidationMessage('Informe uma URL do feed.');
        return;
      }

      setIsValidatingUrl(true);
      setValidationMessage(null);
      setVehicleCount(null);
      setDetectedFormat(null);
      setSuggestedSourceType(null);
      setFormError(null);

      try {
        const result = await feedService.validateUrl(workspaceId, trimmedUrl);

        if (result.valid) {
          setUrlStatus('VALID');
          setVehicleCount(result.vehicleCount ?? null);
          setDetectedFormat(result.detectedFormat ?? null);
          setSuggestedSourceType(result.suggestedPresetId ?? null);
          setValidationMessage(null);

          const suggestedPresetId = resolvePresetIdFromSuggestion(result.suggestedPresetId);
          if (suggestedPresetId) {
            setSelectedPreset(findPresetById(suggestedPresetId));
          }
        } else {
          setUrlStatus('INVALID');
          setValidationMessage(result.error ?? 'Não foi possível validar a URL do feed.');
        }
      } catch (error) {
        setUrlStatus('INVALID');
        setValidationMessage(
          error instanceof ApiError
            ? error.message
            : 'Falha ao validar a URL. Tente novamente.',
        );
      } finally {
        setIsValidatingUrl(false);
      }
    };

    const connectAndValidate = useCallback(async (): Promise<boolean> => {
      setFormError(null);
      setStatusMessage(null);
      setSyncJobStatus(null);
      setSyncProgress(null);
      setSyncElapsed(0);

      if (!workspaceId) {
        setFormError('Workspace não encontrado. Faça login novamente.');
        return false;
      }

      if (connectedFeed && previewVehicles.length > 0) {
        return true;
      }

      const trimmedUrl = feedUrl.trim();
      if (!trimmedUrl || urlStatus !== 'VALID') {
        setFormError('Teste a URL do feed antes de continuar.');
        return false;
      }

      try {
        setIsConnecting(true);
        setSyncJobStatus('waiting');
        setStatusMessage('Criando feed e sincronizando estoque...');

        let feed = connectedFeed;
        if (!feed || feed.feedUrl !== trimmedUrl) {
          feed = await feedService.createFeed(workspaceId, {
            sourceType: resolveSourceTypeForFeed(selectedPreset.id, suggestedSourceType),
            feedUrl: trimmedUrl,
          });
          setConnectedFeed(feed);
        }

        const syncJob = await feedService.triggerSync(workspaceId, feed.id);
        const timeoutMs = computeSyncTimeout(syncJob.estimatedTimeSeconds);

        setSyncJobStatus('active');
        setSyncElapsed(0);
        syncElapsedRef.current = setInterval(() => {
          setSyncElapsed((prev) => prev + 1);
        }, 1000);

        const syncResult = await feedService.waitForSyncJob(workspaceId, feed.id, syncJob.jobId, {
          timeoutMs,
          onProgress: (job) => {
            setSyncProgress(job.progress ?? null);
          },
        });

        clearSyncTimer();
        setSyncJobStatus('completed');
        setSyncProgress(100);

        if (syncResult.status === 'failed') {
          setFormError(syncResult.failedReason ?? 'Falha ao sincronizar o feed.');
          return false;
        }

        const vehicles = await loadPreview();
        if (!vehicles || vehicles.length === 0) {
          setFormError('Feed sincronizado, mas nenhum veículo foi importado. Verifique o feed.');
          return false;
        }

        setStatusMessage(`${vehicles.length} veículo(s) importados com sucesso.`);
        return true;
      } catch (err) {
        clearSyncTimer();
        setSyncJobStatus(null);
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else if (err instanceof Error) {
          setFormError(err.message);
        } else {
          setFormError('Não foi possível conectar o feed DMS.');
        }
        return false;
      } finally {
        setIsConnecting(false);
      }
    }, [
      workspaceId,
      connectedFeed,
      previewVehicles.length,
      feedUrl,
      urlStatus,
      selectedPreset.id,
      suggestedSourceType,
      loadPreview,
      clearSyncTimer,
    ]);

    useImperativeHandle(ref, () => ({ connectAndValidate }), [connectAndValidate]);

    if (!workspaceId) {
      return <DataFetchError message="Workspace não encontrado. Faça login novamente." />;
    }

    if (loading) {
      return (
        <Card className="p-6 space-y-4 animate-pulse">
          <div className="h-5 w-56 bg-surface-muted rounded" />
          <div className="h-10 bg-surface-muted rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-20 bg-surface-muted rounded" />
            ))}
          </div>
        </Card>
      );
    }

    if (loadError) {
      return <DataFetchError message={loadError} onRetry={() => void loadExistingFeed()} />;
    }

    return (
      <Card className="p-6 space-y-6">
        <div className="flex items-start gap-3">
          <span className="p-2 rounded-lg bg-blue-50 text-brand-primary shrink-0">
            <Rss className="w-5 h-5" />
          </span>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-typography-heading">
              Conexão do primeiro Feed DMS
            </h3>
            <p className="text-sm text-typography-muted">
              Informe a URL do feed do seu estoque (XML ou JSON), teste a conexão e importe os primeiros veículos.
            </p>
          </div>
        </div>

        {connectedFeed ? (
          <div className="p-3 bg-green-50/80 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>
              Feed conectado ({connectedFeed.sourceType}).{' '}
              {connectedFeed._count?.vehicles
                ? `${connectedFeed._count.vehicles} veículo(s) no estoque.`
                : 'Sincronização disponível.'}
            </span>
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="block text-xs font-bold text-typography-heading">
            URL do Feed
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Link className="w-4 h-4 text-typography-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={feedUrl}
                onChange={(event) => handleFeedUrlChange(event.target.value)}
                placeholder="https://suarevenda.com.br/estoque.xml ou .json"
                disabled={disabled || isConnecting}
                className="w-full pl-9 pr-4 py-2.5 bg-surface-muted/60 border border-surface-border rounded-lg text-xs font-mono text-typography-heading focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
              />
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => void handleTestUrl()}
              loading={isValidatingUrl}
              disabled={!feedUrl.trim() || disabled || isConnecting || isValidatingUrl}
            >
              Testar Link
            </Button>
          </div>

          {urlStatus === 'VALID' && (
            <div className="p-3 bg-green-50/80 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>
                <strong>Conexão bem-sucedida!</strong>{' '}
                {getFeedValidationSuccessMessage({ vehicleCount, detectedFormat })}
              </span>
            </div>
          )}

          {urlStatus === 'INVALID' && validationMessage && (
            <div className="p-3 bg-red-50/80 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-brand-price shrink-0" />
              <span>{validationMessage}</span>
            </div>
          )}
        </div>

        {urlStatus === 'VALID' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-typography-heading">
              Sistema DMS compatível
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {visiblePresets.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={disabled || isConnecting}
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-brand-primary ring-2 ring-brand-primary/20'
                        : 'bg-surface-muted/40 border-surface-border hover:bg-surface-muted'
                    }`}
                  >
                    <p
                      className={`text-xs font-bold ${
                        isSelected ? 'text-brand-primary' : 'text-typography-heading'
                      }`}
                    >
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-typography-muted mt-0.5">{preset.provider}</p>
                    <div className="mt-2 text-[10px] font-mono text-brand-accent font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {preset.confidenceRate}% Auto-Match
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isConnecting && syncJobStatus ? (
          <div className="p-4 rounded-lg border border-surface-border bg-surface-muted/40 space-y-3">
            <div className="flex items-center gap-3 text-sm text-typography-muted">
              {syncJobStatus === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              ) : syncJobStatus === 'active' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-brand-primary shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-brand-primary animate-pulse shrink-0" />
              )}
              <span>
                {syncJobStatus === 'waiting'
                  ? 'Aguardando processamento…'
                  : syncJobStatus === 'active'
                    ? 'Importando veículos…'
                    : 'Sincronização concluída'}
              </span>
            </div>

            {syncJobStatus === 'active' && syncProgress !== null ? (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-typography-muted">
                  <span>Progresso</span>
                  <span>{syncProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(syncProgress, 100)}%` }}
                  />
                </div>
              </div>
            ) : null}

            {syncJobStatus !== 'completed' ? (
              <div className="flex items-center gap-1.5 text-[11px] text-typography-muted">
                <Timer className="w-3 h-3" />
                <span>Tempo: {formatElapsed(syncElapsed)}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-800">
            {statusMessage}
          </div>
        ) : null}

        {previewVehicles.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-typography-muted">
                Preview de veículos
              </h4>
              <Badge variant="available" size="sm">
                {previewVehicles.length} de 5
              </Badge>
            </div>
            <div className="rounded-lg border border-surface-border overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-muted/60 border-b border-surface-border text-[11px] font-bold text-typography-muted uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Veículo</th>
                    <th className="py-2.5 px-4">Preço</th>
                    <th className="py-2.5 px-4">Placa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {previewVehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={vehicle.imageUrl}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="h-10 w-14 rounded object-cover border border-surface-border bg-white"
                          />
                          <div>
                            <p className="font-semibold text-typography-heading">
                              {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-[11px] text-typography-muted">{vehicle.version}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-typography-heading">
                        {formatPrice(vehicle.promotionalPrice ?? vehicle.price)}
                      </td>
                      <td className="py-3 px-4 font-mono text-typography-muted">
                        {vehicle.licensePlate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {formError ? (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {formError}
          </p>
        ) : null}
      </Card>
    );
  },
);
