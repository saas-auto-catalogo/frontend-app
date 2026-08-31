import { Badge } from './Badge.js';
import { Button } from './Button.js';
import { Calendar, Gauge, Fuel, Eye, CheckCircle2, Shield } from 'lucide-react';

export interface VehicleCardProps {
  id: string;
  make: string;
  model: string;
  version: string;
  price: number;
  promotionalPrice?: number;
  manufactureYear: number;
  modelYear: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  heroImageUrl: string;
  licensePlate?: string;
  vin?: string;
  status: 'AVAILABLE' | 'SOLD' | 'SYNCING';
  armored?: boolean;
  hasWarranty?: boolean;
  eligibleForMetaAds?: boolean;
  onViewDetails?: (id: string) => void;
}

export function VehicleCard({
  id,
  make,
  model,
  version,
  price,
  promotionalPrice,
  manufactureYear,
  modelYear,
  mileage,
  fuelType,
  transmission,
  heroImageUrl,
  licensePlate,
  status,
  armored,
  hasWarranty,
  eligibleForMetaAds = true,
  onViewDetails,
}: VehicleCardProps) {
  const isAvailable = status === 'AVAILABLE';

  return (
    <div className="bg-surface-card rounded-lg border border-surface-border shadow-card hover:shadow-cardHover hover:border-surface-borderHover transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Container de Imagem (16:9) */}
      <div className="relative aspect-[16/10] bg-surface-muted overflow-hidden">
        <img
          src={heroImageUrl}
          alt={`${make} ${model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges Flutuantes sobre a foto */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {isAvailable ? (
            <Badge variant="available" size="sm" dot>
              Em Estoque
            </Badge>
          ) : (
            <Badge variant="sold" size="sm">
              Vendido
            </Badge>
          )}

          {armored && (
            <Badge variant="neutral" size="sm" icon={<Shield className="w-3 h-3 text-brand-primary" />}>
              Blindado
            </Badge>
          )}

          {hasWarranty && (
            <Badge variant="secondary" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-brand-secondary" />}>
              Garantia
            </Badge>
          )}
        </div>

        {/* Badge de Elegibilidade Meta Ads */}
        {eligibleForMetaAds && (
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-medium">
              Meta DAA Ready
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo do Anúncio */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Marca & Modelo */}
          <div className="text-xs font-semibold text-typography-muted uppercase tracking-wider mb-1">
            {make}
          </div>
          <h3 className="text-base font-bold text-typography-heading line-clamp-1 group-hover:text-brand-primary transition-colors">
            {model}
          </h3>
          <p className="text-xs text-typography-muted line-clamp-1 mt-0.5">
            {version}
          </p>

          {/* Preço em Destaque (Vermelho Automotivo Webmotors) */}
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-brand-primary tracking-tight">
              {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            {promotionalPrice && promotionalPrice > 0 && promotionalPrice < price && (
              <span className="text-xs text-typography-muted line-through">
                {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            )}
          </div>

          {/* Grade de Especificações Rápidas */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-surface-border text-xs text-typography-body">
            <div className="flex items-center gap-1.5 text-typography-muted">
              <Calendar className="w-3.5 h-3.5 text-typography-subtle shrink-0" />
              <span>{manufactureYear}/{modelYear}</span>
            </div>

            <div className="flex items-center gap-1.5 text-typography-muted">
              <Gauge className="w-3.5 h-3.5 text-typography-subtle shrink-0" />
              <span>{mileage.toLocaleString('pt-BR')} km</span>
            </div>

            <div className="flex items-center gap-1.5 text-typography-muted">
              <Fuel className="w-3.5 h-3.5 text-typography-subtle shrink-0" />
              <span className="truncate">{transmission || fuelType}</span>
            </div>
          </div>
        </div>

        {/* Rodapé do Card com Dados Técnicos Mono e Ação */}
        <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
          <span className="text-[11px] font-mono text-typography-subtle font-medium">
            {licensePlate ? `PLACA: ${licensePlate}` : `ID: ${id.substring(0, 8)}`}
          </span>

          <Button
            variant="outline"
            size="sm"
            icon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => onViewDetails && onViewDetails(id)}
          >
            Ver Anúncio
          </Button>
        </div>
      </div>
    </div>
  );
}
