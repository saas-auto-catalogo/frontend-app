import { useState } from 'react';
import { VehicleCard } from './components/ui/VehicleCard.js';
import { MetricCard } from './components/ui/MetricCard.js';
import { Button } from './components/ui/Button.js';
import { Badge } from './components/ui/Badge.js';
import {
  Car,
  Layers,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Plus,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'AVAILABLE' | 'HYBRID_EV' | 'SOLD'>('ALL');

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
    <div className="min-h-screen flex flex-col bg-surface-canvas">
      {/* Topbar / Navegação Principal (Estilo Webmotors / Localiza) */}
      <header className="bg-surface-card border-b border-surface-border sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-sm">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-typography-heading tracking-tight">Auto Catálogo</span>
                <Badge variant="primary" size="sm">SaaS PRO</Badge>
              </div>
              <p className="text-[11px] text-typography-muted -mt-0.5">Gestão de Estoque & Meta Automotive Ads</p>
            </div>
          </div>

          {/* Status do Feed & Ações */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-md border border-surface-border text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span className="text-typography-muted">Feed Meta DAA:</span>
              <span className="text-brand-accent font-semibold">Ativo (100% Sincronizado)</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => window.open('/api/v1/feeds/sample-token/meta-vehicles.xml', '_blank')}
            >
              Feed XML
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Novo Veículo
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner de Boas-Vindas & Design System Clean */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-amber-300 mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Design System Automotivo Light Mode (Webmotors / Localiza / Saga Inspired)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Catálogo de Veículos & Inventário em Tempo Real
            </h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Plataforma com interface clara, alto contraste e processamento de feeds pesados. Conectado diretamente com os Catálogos Dinâmicos do Meta Ads.
            </p>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
            <Car className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Grade de Métricas em Cards Claros */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total no Estoque"
            value="142 veículos"
            subtitle="Inventário ativo multi-loja"
            icon={<Car className="w-5 h-5" />}
            trend={{ value: "+12 novos", isPositive: true }}
            variant="default"
          />

          <MetricCard
            title="Elegíveis no Meta DAA"
            value="138 veículos"
            subtitle="Com fotos e preços válidos"
            icon={<CheckCircle2 className="w-5 h-5" />}
            trend={{ value: "97.2% taxa", isPositive: true }}
            variant="accent"
          />

          <MetricCard
            title="Sincronização XML"
            value="< 50ms (Cache)"
            subtitle="TTL Redis: 15 minutos"
            icon={<RefreshCw className="w-5 h-5" />}
            trend={{ value: "GZIP Ativo", isPositive: true }}
            variant="secondary"
          />

          <MetricCard
            title="Rejeições na Meta"
            value="0 erros"
            subtitle="Índice de conformidade 100%"
            icon={<Layers className="w-5 h-5" />}
            trend={{ value: "100% Aprovado", isPositive: true }}
            variant="primary"
          />
        </section>

        {/* Barra de Filtros & Busca */}
        <section className="bg-surface-card rounded-lg border border-surface-border p-4 shadow-subtle flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Campo de Busca */}
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

          {/* Filtros de Status (Tabs Limpas) */}
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
                  ? 'bg-brand-secondary text-white shadow-sm'
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

        {/* Grade de Veículos (Cards de Alta Conversão) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-typography-heading flex items-center gap-2">
              <span>Inventário em Destaque</span>
              <span className="text-xs font-normal text-typography-muted">
                ({filteredVehicles.length} veículos exibidos)
              </span>
            </h2>

            <Button variant="ghost" size="sm" icon={<SlidersHorizontal className="w-3.5 h-3.5" />}>
              Ordenar por Preço
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                {...vehicle}
                onViewDetails={(id) => alert(`Abrindo detalhes do veículo ${id}`)}
              />
            ))}
          </div>
        </section>

        {/* Guia de Tokens e Paleta de Cores do Design System */}
        <section className="bg-surface-card rounded-lg border border-surface-border p-6 shadow-card space-y-6">
          <div>
            <h3 className="text-base font-bold text-typography-heading">
              🎨 Design System "Auto Clean Pro" — Paleta & Identidade
            </h3>
            <p className="text-xs text-typography-muted mt-1">
              Homologado no Stitch MCP com inspiração nos portais Webmotors, Localiza Seminovos e Saga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 rounded-full bg-brand-primary" />
                <span className="font-bold text-sm text-brand-primary">Vermelho Automotivo (#DC2626)</span>
              </div>
              <p className="text-xs text-red-900">
                Inspirado no <strong>Webmotors</strong>. Utilizado para preços em destaque, CTAs de compra e badges de oferta.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 rounded-full bg-brand-secondary" />
                <span className="font-bold text-sm text-brand-secondary">Azul Corporativo (#2563EB)</span>
              </div>
              <p className="text-xs text-blue-900">
                Inspirado na <strong>Saga Primeira Mão</strong>. Utilizado para métricas de catálogo, links e dados técnicos.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-green-200 bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 rounded-full bg-brand-accent" />
                <span className="font-bold text-sm text-brand-accent">Verde Estoque (#16A34A)</span>
              </div>
              <p className="text-xs text-green-900">
                Inspirado na <strong>Localiza Seminovos</strong>. Utilizado para status "Em Estoque", garantia e aprovações.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Limpo */}
      <footer className="bg-surface-card border-t border-surface-border py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-typography-muted">
          <p>© 2026 SaaS Auto Catálogo. Todos os direitos reservados. Feeds em conformidade com Meta Automotive Ads.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
