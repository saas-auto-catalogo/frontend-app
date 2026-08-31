import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { MetricCard } from './components/ui/MetricCard.js';
import { MetaConnectionCard } from './components/dashboard/MetaConnectionCard.js';
import { PendingIssuesTable } from './components/dashboard/PendingIssuesTable.js';
import { ActivityTimeline } from './components/dashboard/ActivityTimeline.js';
import { VehicleCard } from './components/ui/VehicleCard.js';
import { Button } from './components/ui/Button.js';
import {
  Car,
  RefreshCw,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

import { XmlMapperStudio } from './components/xml-mapper/XmlMapperStudio.js';

const SAMPLE_VEHICLES = [
  {
    id: 'mercedes-glc-300',
    make: 'MERCEDES-BENZ',
    model: 'GLC 300 Coupé',
    version: '2.0 MHEV AMG Line 4Matic 9G-Tronic',
    price: 489700,
    promotionalPrice: 479900,
    manufactureYear: 2025,
    modelYear: 2026,
    mileage: 4686,
    fuelType: 'Híbrido Leve',
    transmission: 'Automática',
    heroImageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80',
    licensePlate: 'TYN9F21',
    status: 'AVAILABLE' as const,
    armored: false,
    hasWarranty: true,
    eligibleForMetaAds: true
  },
  {
    id: 'porsche-911-sport',
    make: 'PORSCHE',
    model: '911 Carrera',
    version: '3.0 Carrera S PDK',
    price: 1150000,
    manufactureYear: 2024,
    modelYear: 2025,
    mileage: 1200,
    fuelType: 'Gasolina',
    transmission: 'PDK 8 Velocidades',
    heroImageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    licensePlate: 'PORS911',
    status: 'AVAILABLE' as const,
    armored: false,
    hasWarranty: true,
    eligibleForMetaAds: true
  },
  {
    id: 'audi-q5-tfsie',
    make: 'AUDI',
    model: 'Q5 Performance',
    version: '2.0 TFSIe S-Tronic Quattro Híbrido Plug-in',
    price: 289990,
    manufactureYear: 2023,
    modelYear: 2024,
    mileage: 17881,
    fuelType: 'Híbrido Plug-in',
    transmission: 'S-Tronic 7 Vel.',
    heroImageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=80',
    licensePlate: 'FXZ3B45',
    status: 'AVAILABLE' as const,
    armored: false,
    hasWarranty: true,
    eligibleForMetaAds: true
  },
  {
    id: 'byd-dolphin-ev',
    make: 'BYD',
    model: 'Dolphin EV',
    version: 'GS 100% Elétrico Bateria Blade',
    price: 149990,
    manufactureYear: 2026,
    modelYear: 2027,
    mileage: 20,
    fuelType: '100% Elétrico',
    transmission: 'Automática',
    heroImageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1000&q=80',
    licensePlate: 'BYD2026',
    status: 'AVAILABLE' as const,
    armored: false,
    hasWarranty: true,
    eligibleForMetaAds: true
  },
  {
    id: 'toyota-corolla-cross',
    make: 'TOYOTA',
    model: 'Corolla Cross',
    version: 'XRX Hybrid 1.8 16V Flex Aut.',
    price: 178900,
    manufactureYear: 2023,
    modelYear: 2024,
    mileage: 28400,
    fuelType: 'Híbrido Flex',
    transmission: 'CVT',
    heroImageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
    licensePlate: 'COR4400',
    status: 'AVAILABLE' as const,
    armored: false,
    hasWarranty: true,
    eligibleForMetaAds: true
  },
  {
    id: 'bmw-320i-m-sport',
    make: 'BMW',
    model: '320i M Sport',
    version: '2.0 TwinPower Turbo ActiveFlex',
    price: 319900,
    manufactureYear: 2024,
    modelYear: 2025,
    mileage: 8500,
    fuelType: 'Flex',
    transmission: 'Steptronic 8 Vel.',
    heroImageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
    licensePlate: 'BMW3200',
    status: 'SOLD' as const,
    armored: true,
    hasWarranty: false,
    eligibleForMetaAds: true
  }
];

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'AVAILABLE' | 'HYBRID_EV' | 'SOLD'>('ALL');

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('✅ Sincronização com o DMS e Meta Ads concluída com sucesso! Feed atualizado.');
    }, 1500);
  };

  const filteredVehicles = SAMPLE_VEHICLES.filter((v) => {
    const matchesSearch =
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'AVAILABLE') return v.status === 'AVAILABLE';
    if (selectedFilter === 'SOLD') return v.status === 'SOLD';
    if (selectedFilter === 'HYBRID_EV') return v.fuelType.includes('Híbrido') || v.fuelType.includes('Elétrico');

    return true;
  });

  return (
    <div className="min-h-screen flex bg-surface-canvas text-typography-body">
      {/* Sidebar Lateral Corporativa */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingIssuesCount={4}
      />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior */}
        <Header
          dealershipName="Auto Elite Motors - Matriz Jardins"
          onRefreshSync={handleTriggerSync}
          isSyncing={isSyncing}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB 1: VISÃO GERAL (DASHBOARD PRINCIPAL DO LOJISTA) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Linha 1: Cards de KPIs */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total no Estoque"
                  value="142 veículos"
                  subtitle="Inventário ativo multi-loja"
                  icon={<Car className="w-5 h-5 text-brand-primary" />}
                  trend={{ value: "+12 novos este mês", isPositive: true }}
                />

                <MetricCard
                  title="Elegíveis no Meta DAA"
                  value="138 veículos"
                  subtitle="Fotos e preços válidos"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  trend={{ value: "97.2% aprovados", isPositive: true }}
                  variant="accent"
                />

                <MetricCard
                  title="Pendências de Dados"
                  value="4 veículos"
                  subtitle="Requerem correção rápida"
                  icon={<AlertTriangle className="w-5 h-5 text-brand-price" />}
                  trend={{ value: "0 erros críticos", isPositive: false }}
                  variant="primary"
                />

                <MetricCard
                  title="Última Sincronização"
                  value="Há 4 min"
                  subtitle="DMS AutoCerto (28ms)"
                  icon={<RefreshCw className="w-5 h-5 text-brand-primary" />}
                  trend={{ value: "Status: Sucesso", isPositive: true }}
                />
              </section>

              {/* Linha 2: Conexão Meta Commerce Manager + Timeline de Atividades */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <MetaConnectionCard
                    onTriggerSync={handleTriggerSync}
                    isSyncing={isSyncing}
                  />
                </div>
                <div>
                  <ActivityTimeline />
                </div>
              </section>

              {/* Linha 3: Tabela de Diagnóstico de Pendências */}
              <section>
                <PendingIssuesTable />
              </section>
            </div>
          )}

          {/* TAB 2: ESTOQUE DE VEÍCULOS */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Barra de Filtros & Busca */}
              <section className="bg-surface-card rounded-lg border border-surface-border p-4 shadow-subtle flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-typography-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por marca, modelo, versão ou placa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-surface-muted/50 border border-surface-border rounded-md text-sm text-typography-body placeholder:text-typography-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setSelectedFilter('ALL')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                      selectedFilter === 'ALL'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-surface-muted text-typography-muted hover:text-typography-heading'
                    }`}
                  >
                    Todos ({SAMPLE_VEHICLES.length})
                  </button>

                  <button
                    onClick={() => setSelectedFilter('AVAILABLE')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                      selectedFilter === 'AVAILABLE'
                        ? 'bg-brand-accent text-white shadow-sm'
                        : 'bg-surface-muted text-typography-muted hover:text-typography-heading'
                    }`}
                  >
                    Em Estoque ({SAMPLE_VEHICLES.filter((v) => v.status === 'AVAILABLE').length})
                  </button>

                  <button
                    onClick={() => setSelectedFilter('HYBRID_EV')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                      selectedFilter === 'HYBRID_EV'
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-surface-muted text-typography-muted hover:text-typography-heading'
                    }`}
                  >
                    Híbridos & Elétricos (3)
                  </button>

                  <button
                    onClick={() => setSelectedFilter('SOLD')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                      selectedFilter === 'SOLD'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-surface-muted text-typography-muted hover:text-typography-heading'
                    }`}
                  >
                    Vendidos ({SAMPLE_VEHICLES.filter((v) => v.status === 'SOLD').length})
                  </button>
                </div>
              </section>

              {/* Grade de Cards de Veículos */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-typography-heading flex items-center gap-2">
                    <span>Veículos em Catálogo</span>
                    <span className="text-xs font-normal text-typography-muted">
                      ({filteredVehicles.length} de {SAMPLE_VEHICLES.length} listados)
                    </span>
                  </h2>

                  <Button variant="ghost" size="sm" icon={<SlidersHorizontal className="w-3.5 h-3.5" />}>
                    Filtrar por Preço
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      {...vehicle}
                      onViewDetails={(id) => alert(`Visualizando detalhes do anúncio ${id}`)}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: FEED META DAA */}
          {activeTab === 'meta-feed' && (
            <div className="space-y-6">
              <MetaConnectionCard
                onTriggerSync={handleTriggerSync}
                isSyncing={isSyncing}
              />
              <PendingIssuesTable />
            </div>
          )}

          {/* TAB 4: PENDÊNCIAS */}
          {activeTab === 'issues' && (
            <div className="space-y-6">
              <PendingIssuesTable />
            </div>
          )}

          {/* TAB 5: MAPEADOR INTELIGENTE XML (DE/PARA) */}
          {activeTab === 'xml-mapper' && (
            <div className="space-y-6">
              <XmlMapperStudio />
            </div>
          )}

          {/* OUTRAS TABS */}
          {(activeTab === 'sync-dms' || activeTab === 'reports' || activeTab === 'settings') && (
            <div className="p-12 text-center bg-surface-card rounded-lg border border-surface-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-typography-heading capitalize">
                  Módulo: {activeTab}
                </h3>
                <p className="text-xs text-typography-muted mt-1 max-w-md mx-auto">
                  Este módulo está em produção e conectado com os serviços de banco de dados e APIs do backend.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('dashboard')}>
                Voltar para o Dashboard
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
