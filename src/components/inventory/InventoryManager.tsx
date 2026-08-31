import { useState, useEffect } from 'react';
import { Card } from '../ui/Card.js';
import { VehicleCard } from '../ui/VehicleCard.js';
import { InventoryTable } from './InventoryTable.js';
import { MetaAdSimulator, VehicleAdData } from './MetaAdSimulator.js';
import { Button } from '../ui/Button.js';
import {
  Search,
  LayoutGrid,
  List,
  Car,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { vehicleService, Vehicle } from '../../services/api/vehicleService.js';

export interface InventoryManagerProps {
  initialVehicles?: VehicleAdData[];
}

export function InventoryManager({ initialVehicles }: InventoryManagerProps) {
  const [vehicles, setVehicles] = useState<VehicleAdData[]>(initialVehicles || []);
  const [loading, setLoading] = useState<boolean>(!initialVehicles || initialVehicles.length === 0);
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('ALL');
  const [selectedFuel, setSelectedFuel] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleAdData | null>(
    initialVehicles && initialVehicles.length > 0 ? initialVehicles[0] : null
  );

  const loadVehiclesFromApi = async () => {
    try {
      setLoading(true);
      const res = await vehicleService.listVehicles({
        search: searchQuery,
        make: selectedMake !== 'ALL' ? selectedMake : undefined,
        fuelType: selectedFuel !== 'ALL' ? selectedFuel : undefined,
      });

      const formattedVehicles: VehicleAdData[] = res.items.map((v: Vehicle) => ({
        id: v.id,
        make: v.make,
        model: v.model,
        version: v.version,
        price: v.price,
        promotionalPrice: v.promotionalPrice,
        manufactureYear: v.manufactureYear,
        modelYear: v.modelYear,
        mileage: v.mileage,
        fuelType: v.fuelType,
        transmission: v.transmission,
        licensePlate: v.licensePlate,
        imageUrl: v.imageUrl,
        armored: v.armored,
        hasWarranty: v.hasWarranty,
      }));

      setVehicles(formattedVehicles);
      if (formattedVehicles.length > 0 && !selectedVehicle) {
        setSelectedVehicle(formattedVehicles[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVehiclesFromApi();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedMake, selectedFuel]);

  // Marcas únicas disponíveis
  const makes = Array.from(new Set(vehicles.map((v) => v.make)));

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Avançados */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Busca por Texto */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-typography-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo, versão ou placa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-muted/60 border border-surface-border rounded-md text-xs text-typography-body placeholder:text-typography-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>

          {/* Filtros de Marca e Combustível */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="text-xs px-3 py-2 bg-surface-muted/60 border border-surface-border rounded-md text-typography-body focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium"
            >
              <option value="ALL">Todas as Marcas ({makes.length || 'Todas'})</option>
              {makes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="text-xs px-3 py-2 bg-surface-muted/60 border border-surface-border rounded-md text-typography-body focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium"
            >
              <option value="ALL">Todos os Combustíveis</option>
              <option value="HYBRID_EV">Híbridos & Elétricos</option>
              <option value="FLEX">Flex / Gasolina</option>
            </select>

            {/* Alternância de Modo de Visão (Grid vs Tabela) */}
            <div className="flex items-center p-1 bg-surface-muted rounded-md border border-surface-border">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'GRID' ? 'bg-white shadow-sm text-brand-primary' : 'text-typography-muted'
                }`}
                title="Visão em Grade de Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'TABLE' ? 'bg-white shadow-sm text-brand-primary' : 'text-typography-muted'
                }`}
                title="Visão em Tabela Analítica"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={loadVehiclesFromApi}
              loading={loading}
            >
              Re-Sync Estoque
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid Principal: Gestão de Estoque (65%) + Simulador Meta Ads (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Listagem do Estoque (7/12 ou ~60%) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-typography-heading flex items-center gap-2">
              <Car className="w-4 h-4 text-brand-primary" />
              <span>Inventário da Revenda ({vehicles.length} veículos)</span>
            </h2>

            <span className="text-xs text-typography-muted">
              Clique em um veículo para simular o anúncio
            </span>
          </div>

          {loading && vehicles.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center bg-white rounded-xl border border-surface-border gap-2 text-typography-muted">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              <p className="text-xs font-semibold">Carregando catálogo de veículos da API...</p>
            </div>
          ) : viewMode === 'GRID' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((vehicle) => {
                const isSelected = selectedVehicle?.id === vehicle.id;
                return (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`cursor-pointer rounded-xl transition-all ${
                      isSelected ? 'ring-4 ring-brand-primary/30 shadow-md' : ''
                    }`}
                  >
                    <VehicleCard
                      {...vehicle}
                      status="AVAILABLE"
                      onViewDetails={() => setSelectedVehicle(vehicle)}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <InventoryTable
                vehicles={vehicles}
                selectedVehicleId={selectedVehicle?.id}
                onSelectVehicle={setSelectedVehicle}
                onViewDetails={() => {}}
              />
            </Card>
          )}
        </div>

        {/* Coluna Direita: Simulador de Anúncios Meta Ads Fixo (5/12 ou ~40%) */}
        <div className="lg:col-span-5 sticky top-20">
          {selectedVehicle ? (
            <MetaAdSimulator vehicle={selectedVehicle} />
          ) : (
            <Card className="p-8 text-center text-xs text-typography-muted">
              Selecione um veículo para visualizar a simulação.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
