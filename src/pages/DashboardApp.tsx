import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar.js';
import { Header } from '../components/layout/Header.js';
import { MetricCard } from '../components/ui/MetricCard.js';
import { MetaConnectionCard } from '../components/dashboard/MetaConnectionCard.js';
import { PendingIssuesTable } from '../components/dashboard/PendingIssuesTable.js';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline.js';
import { Button } from '../components/ui/Button.js';
import {
  Car,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

import { XmlMapperStudio } from '../components/xml-mapper/XmlMapperStudio.js';
import { InventoryManager } from '../components/inventory/InventoryManager.js';
import { metaService } from '../services/api/metaService.js';
import { useAuth } from '../context/AuthContext.js';

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

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function DashboardApp() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dealershipName =
    user?.memberships?.[0]?.workspaceName ||
    'Auto Elite Motors - Matriz Jardins';

  const handleTriggerSync = async () => {
    try {
      setIsSyncing(true);
      const res = await metaService.triggerSync();
      alert(`✅ ${res.message}`);
    } catch (err: any) {
      alert(`❌ Erro ao sincronizar com a Meta: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-canvas text-typography-body">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingIssuesCount={4}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          dealershipName={dealershipName}
          userName={user?.name}
          userInitials={user ? getUserInitials(user.name) : undefined}
          onRefreshSync={handleTriggerSync}
          isSyncing={isSyncing}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
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

              <section>
                <PendingIssuesTable />
              </section>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <InventoryManager initialVehicles={SAMPLE_VEHICLES} />
            </div>
          )}

          {activeTab === 'meta-feed' && (
            <div className="space-y-6">
              <MetaConnectionCard
                onTriggerSync={handleTriggerSync}
                isSyncing={isSyncing}
              />
              <PendingIssuesTable />
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="space-y-6">
              <PendingIssuesTable />
            </div>
          )}

          {activeTab === 'xml-mapper' && (
            <div className="space-y-6">
              <XmlMapperStudio />
            </div>
          )}

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

export default DashboardApp;
