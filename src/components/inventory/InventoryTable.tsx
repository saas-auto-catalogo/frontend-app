import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { Eye, Smartphone } from 'lucide-react';
import { VehicleAdData } from './MetaAdSimulator.js';

export interface InventoryTableProps {
  vehicles: VehicleAdData[];
  selectedVehicleId?: string;
  onSelectVehicle: (vehicle: VehicleAdData) => void;
  onViewDetails?: (id: string) => void;
}

export function InventoryTable({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onViewDetails,
}: InventoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-muted/60 border-b border-surface-border text-[11px] font-bold text-typography-muted uppercase tracking-wider">
            <th className="py-3 px-4">Veículo</th>
            <th className="py-3 px-4">Placa / Chassi</th>
            <th className="py-3 px-4">Ano / KM</th>
            <th className="py-3 px-4">Preço (BRL)</th>
            <th className="py-3 px-4">Meta DAA</th>
            <th className="py-3 px-4 text-right">Simulador & Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border text-xs">
          {vehicles.map((vehicle) => {
            const isSelected = selectedVehicleId === vehicle.id;
            return (
              <tr
                key={vehicle.id}
                onClick={() => onSelectVehicle(vehicle)}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50/60 font-medium'
                    : 'hover:bg-surface-muted/40'
                }`}
              >
                {/* Miniatura + Modelo */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-9 rounded-md bg-surface-muted border border-surface-border overflow-hidden shrink-0">
                      <img
                        src={vehicle.heroImageUrl}
                        alt={vehicle.model}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-typography-heading">{vehicle.make} {vehicle.model}</p>
                      <p className="text-[11px] text-typography-muted line-clamp-1">{vehicle.version}</p>
                    </div>
                  </div>
                </td>

                {/* Placa / VIN */}
                <td className="py-3.5 px-4">
                  <span className="font-mono text-xs font-semibold text-typography-body bg-surface-muted px-2 py-0.5 rounded border border-surface-border">
                    {vehicle.licensePlate || vehicle.id.substring(0, 8)}
                  </span>
                </td>

                {/* Ano e KM */}
                <td className="py-3.5 px-4 whitespace-nowrap text-typography-body">
                  <p>{vehicle.manufactureYear}/{vehicle.modelYear}</p>
                  <p className="text-[11px] text-typography-muted">{vehicle.mileage.toLocaleString('pt-BR')} km</p>
                </td>

                {/* Preço em Vermelho */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-bold text-brand-price text-sm">
                    {vehicle.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </td>

                {/* Status no Meta DAA */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <Badge variant="available" size="sm" dot>
                    Elegível
                  </Badge>
                </td>

                {/* Botões de Ação */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      icon={<Smartphone className="w-3.5 h-3.5" />}
                      onClick={() => onSelectVehicle(vehicle)}
                    >
                      {isSelected ? 'Simulando' : 'Simular'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => onViewDetails && onViewDetails(vehicle.id)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
