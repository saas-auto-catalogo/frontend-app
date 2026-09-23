import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Rocket, CheckCircle2, X } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar.js';
import { Header } from '../components/layout/Header.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useWorkspace } from '../hooks/useWorkspace.js';
import { campaignService, validateWizardTransition } from '../services/api/campaignService.js';
import { metaIntegrationService, saveOAuthReturnTo } from '../services/api/metaIntegrationService.js';
import { vehicleService, Vehicle } from '../services/api/vehicleService.js';
import type {
  CampaignWizardState,
  MetaAdAccountItem,
  MetaLeadGenFormItem,
  MetaPageItem,
} from '../types/campaign.js';
import { WizardStepIndicator, WizardStepConfig } from '../components/campaigns/wizard/WizardStepIndicator.js';
import { Step1Objective } from '../components/campaigns/wizard/Step1Objective.js';
import { Step2AccountPage } from '../components/campaigns/wizard/Step2AccountPage.js';
import { Step3InventoryFilter } from '../components/campaigns/wizard/Step3InventoryFilter.js';
import { Step4BudgetGeo } from '../components/campaigns/wizard/Step4BudgetGeo.js';
import { Step5Creative, HEADLINE_DEFAULT, MESSAGE_DEFAULT, GREETING_DEFAULT } from '../components/campaigns/wizard/Step5Creative.js';
import { Step6Review, CampaignPublishedSuccess } from '../components/campaigns/wizard/Step6Review.js';

const STEPS: WizardStepConfig[] = [
  { label: 'Objetivo', description: 'WhatsApp ou formulário' },
  { label: 'Conta & Página', description: 'Ativos Meta' },
  { label: 'Estoque', description: 'Filtro de veículos' },
  { label: 'Orçamento', description: 'Verba e alcance' },
  { label: 'Criativo', description: 'Copy e prévia' },
  { label: 'Revisão', description: 'Publicar campanha' },
];

const INITIAL_STATE: CampaignWizardState = {
  step: 1,
  destinationType: 'WHATSAPP_MESSAGE',
  adAccountId: '',
  pageId: '',
  whatsappNumber: '',
  metaLeadFormId: '',
  stockSelectionMode: 'ALL',
  selectedMakes: [],
  selectedBodyStyles: [],
  maxPrice: undefined,
  radiusKm: 50,
  dailyBudgetReais: 30,
  continuousPacing: true,
  endDate: undefined,
  campaignName: '',
  headlineTemplate: HEADLINE_DEFAULT,
  messageTemplate: MESSAGE_DEFAULT,
  whatsappGreeting: GREETING_DEFAULT,
};

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function CreateCampaignWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { workspaceId, workspaceName } = useWorkspace();

  const [state, setState] = useState<CampaignWizardState>(INITIAL_STATE);
  const [oauthSuccessMessage, setOauthSuccessMessage] = useState<string | null>(() => {
    const navState = location.state as { metaOAuthResult?: 'success'; message?: string } | null;
    return navState?.metaOAuthResult === 'success'
      ? navState.message ?? 'Conta Meta vinculada com sucesso.'
      : null;
  });
  const [accounts, setAccounts] = useState<MetaAdAccountItem[]>([]);
  const [pages, setPages] = useState<MetaPageItem[]>([]);
  const [leadForms, setLeadForms] = useState<MetaLeadGenFormItem[]>([]);
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [sampleVehicles, setSampleVehicles] = useState<Vehicle[]>([]);
  const [eligibleCount, setEligibleCount] = useState<number | null>(null);
  const [loadingEligible, setLoadingEligible] = useState(false);

  const [accountsLoading, setAccountsLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [formsLoading, setFormsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [formsError, setFormsError] = useState<string | null>(null);
  const [connectingMeta, setConnectingMeta] = useState(false);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [publishedCampaignId, setPublishedCampaignId] = useState<string | null>(null);

  const handleConnectMeta = useCallback(async () => {
    if (!workspaceId) return;
    setConnectingMeta(true);
    try {
      // Preserva a rota de origem para o callback OAuth devolver o lojista a
      // este wizard (e não ao Dashboard) após concluir a autenticação na Meta.
      saveOAuthReturnTo(`${window.location.pathname}${window.location.search}`);
      const { authUrl } = await metaIntegrationService.getAuthUrl(workspaceId);
      window.location.href = authUrl;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao gerar link de conexão com a Meta.';
      setAccountsError(message);
    } finally {
      setConnectingMeta(false);
    }
  }, [workspaceId]);

  const step = state.step;
  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === state.adAccountId),
    [accounts, state.adAccountId],
  );
  const selectedPage = useMemo(
    () => pages.find((page) => page.id === state.pageId),
    [pages, state.pageId],
  );
  const selectedForm = useMemo(
    () => leadForms.find((form) => form.id === state.metaLeadFormId),
    [leadForms, state.metaLeadFormId],
  );

  const sampleVehicle = useMemo<Vehicle | null>(() => sampleVehicles[0] ?? null, [sampleVehicles]);

  const reloadAccounts = useCallback(async () => {
    setAccountsLoading(true);
    setAccountsError(null);
    try {
      const result = await campaignService.listAdAccounts();
      const items = result.items ?? [];
      setAccounts(items);
      // Ao retornar do OAuth (ou recarregar com token novo), seleciona
      // automaticamente a conta padrão quando houver apenas uma conta ativa.
      const active = items.filter((account) => account.accountStatus === 1);
      if (active.length === 1) {
        setState((prev) => (prev.adAccountId ? prev : { ...prev, adAccountId: active[0].id }));
      }
    } catch (error: any) {
      setAccounts([]);
      setAccountsError(error?.message || 'Não foi possível carregar as contas de anúncios.');
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  const reloadPages = useCallback(async () => {
    setPagesLoading(true);
    setPagesError(null);
    try {
      const result = await campaignService.listPages();
      setPages(result.items ?? []);
    } catch (error: any) {
      setPages([]);
      setPagesError(error?.message || 'Não foi possível carregar as páginas.');
    } finally {
      setPagesLoading(false);
    }
  }, []);

  const reloadLeadForms = useCallback(async () => {
    if (!state.pageId) return;
    setFormsLoading(true);
    setFormsError(null);
    try {
      const result = await campaignService.listLeadForms(state.pageId);
      setLeadForms(result.items ?? []);
    } catch (error: any) {
      setLeadForms([]);
      setFormsError(error?.message || 'Não foi possível carregar os formulários.');
    } finally {
      setFormsLoading(false);
    }
  }, [state.pageId]);

  useEffect(() => {
    reloadAccounts();
  }, [reloadAccounts]);

  useEffect(() => {
    reloadPages();
  }, [reloadPages]);

  useEffect(() => {
    if (step === 2) {
      reloadPages();
    }
  }, [step, reloadPages]);

  useEffect(() => {
    if (state.destinationType === 'INSTANT_LEAD_FORM' && state.pageId && step === 2) {
      reloadLeadForms();
    }
  }, [state.destinationType, state.pageId, step, reloadLeadForms]);

  const availableBodyStyles = useMemo(() => [] as string[], []);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;

    const loadMakes = async () => {
      try {
        const makes = await vehicleService.listVehicleMakes(workspaceId);
        if (!cancelled) setAvailableMakes(makes);
      } catch {
        // silencioso: filtro se torna opcional
      }
    };

    const loadSamples = async () => {
      try {
        const result = await vehicleService.listVehicles(workspaceId, {
          page: 1,
          limit: 3,
          eligibleOnly: true,
          status: 'AVAILABLE',
        });
        if (!cancelled) setSampleVehicles(result.items ?? []);
      } catch {
        if (!cancelled) setSampleVehicles([]);
      }
    };

    loadMakes();
    loadSamples();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const loadEligibleCount = useCallback(async () => {
    if (!workspaceId) return;
    setLoadingEligible(true);
    try {
      const filters = {
        page: 1,
        limit: 1,
        eligibleOnly: true,
        status: 'AVAILABLE',
        ...(state.stockSelectionMode === 'CUSTOM_FILTER'
          ? {
              make: state.selectedMakes.length === 1 ? state.selectedMakes[0] : undefined,
              maxPrice: state.maxPrice,
            }
          : {}),
      };
      const result = await vehicleService.listVehicles(workspaceId, filters);
      const total = result.pagination?.total ?? result.items.length;
      setEligibleCount(total);
    } catch {
      setEligibleCount(null);
    } finally {
      setLoadingEligible(false);
    }
  }, [workspaceId, state.stockSelectionMode, state.selectedMakes, state.maxPrice]);

  useEffect(() => {
    loadEligibleCount();
  }, [loadEligibleCount]);

  const patch = useCallback((partial: Partial<CampaignWizardState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const goToStep = useCallback(
    (targetStep: number) => {
      if (targetStep < 1 || targetStep > STEPS.length) return;
      // Só permite voltar livremente; avanço valida abaixo
      if (targetStep <= step) {
        setPublishError(null);
        patch({ step: targetStep });
      }
    },
    [step, patch],
  );

  const handleNext = useCallback(() => {
    const transition = validateWizardTransition({
      step: state.step,
      destinationType: state.destinationType,
      whatsappNumber: state.whatsappNumber,
      metaLeadFormId: state.metaLeadFormId,
      dailyBudgetReais: state.dailyBudgetReais,
    });

    if (!transition.valid) {
      setPublishError(transition.message ?? 'Verifique os dados antes de continuar.');
      return;
    }

    if (state.step === 3 && state.stockSelectionMode === 'CUSTOM_FILTER' && eligibleCount === 0) {
      setPublishError('Selecione ao menos um veículo elegível antes de continuar.');
      return;
    }

    setPublishError(null);
    patch({ step: state.step + 1 });
  }, [state, eligibleCount, patch]);

  const handlePublish = useCallback(async () => {
    if (!workspaceId) return;

    const validation = validateWizardTransition({
      step: 6,
      destinationType: state.destinationType,
      whatsappNumber: state.whatsappNumber,
      metaLeadFormId: state.metaLeadFormId,
      dailyBudgetReais: state.dailyBudgetReais,
    });
    if (!validation.valid) {
      setPublishError(validation.message ?? 'Revise as configurações.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    try {
      const created = await campaignService.createCampaign({
        name: state.campaignName || `Campanha ${state.destinationType === 'WHATSAPP_MESSAGE' ? 'WhatsApp' : 'Leads'} - ${new Date().toLocaleDateString('pt-BR')}`,
        destinationType: state.destinationType,
        adAccountId: state.adAccountId,
        pageId: state.pageId,
        ...(state.destinationType === 'WHATSAPP_MESSAGE' ? { whatsappNumber: state.whatsappNumber } : {}),
        ...(state.destinationType === 'INSTANT_LEAD_FORM' ? { metaLeadFormId: state.metaLeadFormId } : {}),
        dailyBudget: Math.round(state.dailyBudgetReais * 100),
        startDate: new Date().toISOString(),
        ...(state.continuousPacing ? {} : state.endDate ? { endDate: new Date(state.endDate).toISOString() } : {}),
        headlineTemplate: state.headlineTemplate,
        messageTemplate: state.messageTemplate,
        whatsappGreeting: state.whatsappGreeting,
        targetingGeo: {
          customLocations: [
            {
              latitude: 0,
              longitude: 0,
              radius: state.radiusKm,
              distanceUnit: 'kilometer',
            },
          ],
        },
      });

      setPublishedCampaignId(created?.id ?? null);
      setIsPublishing(false);
    } catch (error: any) {
      setPublishError(error?.message || 'Não foi possível publicar a campanha. Tente novamente.');
      setIsPublishing(false);
    }
  }, [workspaceId, state]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSidebarTabChange = useCallback(
    (tab: string) => {
      navigate('/', { state: { tab } });
    },
    [navigate],
  );

  const dealershipName = workspaceName ?? 'Minha Revenda';

  return (
    <div className="min-h-screen flex bg-surface-canvas text-typography-body">
      <Sidebar
        activeTab="campaigns"
        onTabChange={handleSidebarTabChange}
        workspaceName={workspaceName}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          dealershipName={dealershipName}
          workspaceId={workspaceId}
          userName={user?.name}
          userEmail={user?.email}
          userInitials={user ? getUserInitials(user.name) : undefined}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-typography-heading">Nova Campanha de Anúncios</h1>
              <p className="text-xs text-typography-muted mt-0.5">
                Configure em 6 passos sua campanha de veículos na Meta Ads.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/', { state: { tab: 'campaigns' } })}
            >
              Cancelar e voltar
            </Button>
          </div>

          {oauthSuccessMessage ? (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
              <div className="flex-1">{oauthSuccessMessage}</div>
              <button
                type="button"
                onClick={() => setOauthSuccessMessage(null)}
                className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <WizardStepIndicator
              currentStep={publishedCampaignId ? 6 : step}
              steps={STEPS}
              onStepClick={goToStep}
            />

            <div className="min-w-0">
              <div className="p-5 rounded-xl border border-surface-border bg-surface-card shadow-card">
                {publishedCampaignId && (
                  <CampaignPublishedSuccess
                    campaignName={state.campaignName || 'Campanha de Anúncios'}
                    campaignId={publishedCampaignId}
                    dailyBudgetReais={state.dailyBudgetReais}
                    isContinuous={state.continuousPacing}
                    endDate={state.endDate}
                    onBack={() => {
                      setPublishedCampaignId(null);
                      setState({ ...INITIAL_STATE, step: 1 });
                    }}
                    onFinish={() => navigate('/', { state: { tab: 'campaigns', campaignCreated: true } })}
                  />
                )}

                {!publishedCampaignId && step === 1 && (
                  <Step1Objective
                    value={state.destinationType}
                    onChange={(destinationType) => patch({ destinationType })}
                  />
                )}

                {!publishedCampaignId && step === 2 && (
                  <Step2AccountPage
                    destinationType={state.destinationType}
                    adAccountId={state.adAccountId}
                    pageId={state.pageId}
                    whatsappNumber={state.whatsappNumber}
                    metaLeadFormId={state.metaLeadFormId}
                    accounts={accounts}
                    pages={pages}
                    leadForms={leadForms}
                    accountsLoading={accountsLoading}
                    pagesLoading={pagesLoading}
                    formsLoading={formsLoading}
                    accountsError={accountsError}
                    pagesError={pagesError}
                    formsError={formsError}
                    onAdAccountChange={(adAccountId) => patch({ adAccountId })}
                    onPageChange={(pageId) => patch({ pageId, metaLeadFormId: '' })}
                    onWhatsappChange={(whatsappNumber) => patch({ whatsappNumber })}
                    onLeadFormChange={(metaLeadFormId) => patch({ metaLeadFormId })}
                    onReloadAccounts={reloadAccounts}
                    onReloadPages={reloadPages}
                    onReloadForms={reloadLeadForms}
                    onConnectMeta={handleConnectMeta}
                    isConnectingMeta={connectingMeta}
                  />
                )}

                {!publishedCampaignId && step === 3 && (
                  <Step3InventoryFilter
                    mode={state.stockSelectionMode}
                    onModeChange={(stockSelectionMode) => patch({ stockSelectionMode })}
                    selectedMakes={state.selectedMakes}
                    onMakesChange={(selectedMakes) => patch({ selectedMakes })}
                    selectedBodyStyles={state.selectedBodyStyles}
                    onBodyStylesChange={(selectedBodyStyles) => patch({ selectedBodyStyles })}
                    maxPrice={state.maxPrice}
                    onMaxPriceChange={(maxPrice) => patch({ maxPrice })}
                    availableMakes={availableMakes}
                    availableBodyStyles={availableBodyStyles}
                    eligibleCount={eligibleCount}
                    loadingEligibleCount={loadingEligible}
                  />
                )}

                {!publishedCampaignId && step === 4 && (
                  <Step4BudgetGeo
                    radiusKm={state.radiusKm}
                    onRadiusChange={(radiusKm) => patch({ radiusKm })}
                    dailyBudgetReais={state.dailyBudgetReais}
                    onBudgetChange={(dailyBudgetReais) => patch({ dailyBudgetReais })}
                    continuousPacing={state.continuousPacing}
                    onPacingChange={(continuousPacing) => patch({ continuousPacing })}
                    endDate={state.endDate}
                    onEndDateChange={(endDate) => patch({ endDate })}
                  />
                )}

                {!publishedCampaignId && step === 5 && (
                  <Step5Creative
                    destinationType={state.destinationType}
                    campaignName={state.campaignName}
                    onCampaignNameChange={(campaignName) => patch({ campaignName })}
                    headlineTemplate={state.headlineTemplate}
                    onHeadlineTemplateChange={(headlineTemplate) => patch({ headlineTemplate })}
                    messageTemplate={state.messageTemplate}
                    onMessageTemplateChange={(messageTemplate) => patch({ messageTemplate })}
                    whatsappGreeting={state.whatsappGreeting}
                    onWhatsappGreetingChange={(whatsappGreeting) => patch({ whatsappGreeting })}
                    whatsappNumber={state.whatsappNumber}
                    sampleVehicle={
                      sampleVehicle
                        ? {
                            id: sampleVehicle.id,
                            make: sampleVehicle.make,
                            model: sampleVehicle.model,
                            version: sampleVehicle.version,
                            price: sampleVehicle.price,
                            promotionalPrice: sampleVehicle.promotionalPrice,
                            manufactureYear: sampleVehicle.manufactureYear,
                            modelYear: sampleVehicle.modelYear,
                            mileage: sampleVehicle.mileage,
                            fuelType: sampleVehicle.fuelType,
                            transmission: sampleVehicle.transmission,
                            heroImageUrl: sampleVehicle.heroImageUrl,
                            imageUrl: sampleVehicle.imageUrl,
                            armored: sampleVehicle.armored,
                            hasWarranty: sampleVehicle.hasWarranty,
                          }
                        : {
                            id: 'sample',
                            make: 'Veículo',
                            model: 'Disponível',
                            version: '',
                            price: 0,
                            manufactureYear: new Date().getFullYear(),
                            modelYear: new Date().getFullYear(),
                            mileage: 0,
                            fuelType: '',
                            transmission: '',
                            imageUrl: '',
                          }
                    }
                  />
                )}

                {!publishedCampaignId && step === 6 && (
                  <Step6Review
                    state={state}
                    account={selectedAccount}
                    page={selectedPage}
                    leadForm={selectedForm}
                    eligibleCount={eligibleCount}
                    isPublishing={isPublishing}
                    publishError={publishError}
                    onPublish={handlePublish}
                    onBack={() => goToStep(5)}
                  />
                )}

                {!publishedCampaignId && publishError && step < 6 && (
                  <div className="mt-4 p-3 rounded-lg border border-status-error-border bg-status-error-bg">
                    <p className="text-sm font-semibold text-status-error-text">
                      Algo precisa de atenção:
                    </p>
                    <p className="mt-0.5 text-xs text-status-error-text">{publishError}</p>
                  </div>
                )}
              </div>

              {!publishedCampaignId && step < 6 && (
                <div className="mt-5 flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => goToStep(step - 1)}
                    disabled={step <= 1}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<ArrowRight className="w-4 h-4" />}
                    onClick={handleNext}
                  >
                    {step === 5 ? 'Rever pedido' : 'Continuar'}
                  </Button>
                </div>
              )}

              {!publishedCampaignId && step === 6 && (
                <div className="mt-5 flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => goToStep(5)}
                    disabled={isPublishing}
                  >
                    Voltar ao criativo
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<Rocket className="w-4 h-4" />}
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? 'Publicando...' : 'Publicar Campanha'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}