import { useState } from 'react';
import { Card } from '../ui/Card.js';
import { VehicleCard } from '../ui/VehicleCard.js';
import { InventoryTable } from './InventoryTable.js';
import { MetaAdSimulator, VehicleAdData } from './MetaAdSimulator.js';
import { Button } from '../ui/Button.js';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Car
} from 'lucide-react';

export interface InventoryManagerProps {
  initialVehicles: VehicleAdData[];
}

export function InventoryManager({ initialVehicles }: InventoryManagerProps) {
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('ALL');
  const [selectedFuel, setSelectedFuel] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleAdData>(initialVehicles[0]);

  // Marcas únicas disponíveis
  const makes = Array.from(new Set(initialVehicles.map((v) => v.make)));

  const filteredVehicles = initialVehicles.filter((v) => {
    const matchesSearch =
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedMake !== 'ALL' && v.make !== selectedMake) return false;
    if (selectedFuel === 'HYBRID_EV' && !v.fuelType.includes('Híbrido') && !v.fuelType.includes('Elétrico')) return false;

    return true;
  });

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
              <option value="ALL">Todas as Marcas ({makes.length})</option>
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

            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Cadastrar Veículo
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
              <span>Inventário da Revenda ({filteredVehicles.length} veículos)</span>
            </h2>

            <span className="text-xs text-typography-muted">
              Clique em um veículo para simular o anúncio
            </span>
          </div>

          {viewMode === 'GRID' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredVehicles.map((vehicle) => {
                const isSelected = selectedVehicle.id === vehicle.id;
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
                vehicles={filteredVehicles}
                selectedVehicleId={selectedVehicle.id}
                onSelectVehicle={setSelectedVehicle}
                onViewDetails={() => {}}
              />
            </Card>
          )}
        </div>

        {/* Coluna Direita: Simulador de Anúncios Meta Ads Fixo (5/12 ou ~40%) */}
        <div className="lg:col-span-5 sticky top-20">
          <MetaAdSimulator vehicle={selectedVehicle} />
        </div>
      </div>
    </div>
  );
}
