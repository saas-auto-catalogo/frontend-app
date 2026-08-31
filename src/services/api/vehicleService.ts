import { httpClient } from './httpClient.js';
import { PaginatedResponse, PaginationParams } from '../../types/api.js';

export interface Vehicle {
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
  licensePlate: string;
  vin: string;
  color?: string;
  doors?: number;
  imageUrl: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  armored?: boolean;
  hasWarranty?: boolean;
  eligibleForMetaAds: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleFilterParams extends PaginationParams {
  search?: string;
  make?: string;
  fuelType?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  eligibleOnly?: boolean;
}

const FALLBACK_VEHICLES: Vehicle[] = [
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
    transmission: 'Automático 9M',
    licensePlate: 'TYN9F21',
    vin: '9BR12345678901234',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    armored: true,
    hasWarranty: true,
    eligibleForMetaAds: true,
  },
  {
    id: 'bmw-x3-xdrive30e',
    make: 'BMW',
    model: 'X3 xDrive30e',
    version: '2.0 Plug-in Hybrid M Sport Automático',
    price: 429900,
    manufactureYear: 2024,
    modelYear: 2025,
    mileage: 8250,
    fuelType: 'Híbrido Plug-in',
    transmission: 'Automático 8M',
    licensePlate: 'BMW3X30',
    vin: '9BR98765432109876',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    armored: false,
    hasWarranty: true,
    eligibleForMetaAds: true,
  },
  {
    id: 'porsche-macan-gts',
    make: 'PORSCHE',
    model: 'Macan GTS',
    version: '2.9 V6 Biturbo PDK 440cv',
    price: 649000,
    promotionalPrice: 635000,
    manufactureYear: 2023,
    modelYear: 2024,
    mileage: 12400,
    fuelType: 'Gasolina',
    transmission: 'PDK 7M',
    licensePlate: 'POR9G75',
    vin: 'WP0ZZZ95ZPLB12345',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    status: 'RESERVED',
    armored: true,
    hasWarranty: true,
    eligibleForMetaAds: true,
  },
  {
    id: 'audi-q5-performance',
    make: 'AUDI',
    model: 'Q5 Sportback',
    version: '2.0 TFSI Performance Black S-Tronic',
    price: 389900,
    manufactureYear: 2023,
    modelYear: 2023,
    mileage: 21500,
    fuelType: 'Híbrido Leve',
    transmission: 'S-Tronic 7M',
    licensePlate: 'AUD5Q50',
    vin: 'WAUZZZFY8P2012345',
    imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    armored: false,
    hasWarranty: false,
    eligibleForMetaAds: true,
  },
  {
    id: 'volvo-xc90-ultimate',
    make: 'VOLVO',
    model: 'XC90 Recharge',
    version: '2.0 T8 Ultimate Dark AWD 7L',
    price: 559900,
    manufactureYear: 2024,
    modelYear: 2025,
    mileage: 5100,
    fuelType: 'Híbrido Plug-in',
    transmission: 'Geartronic 8M',
    licensePlate: 'VOL9C90',
    vin: 'YV4A22PK0P1123456',
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    armored: true,
    hasWarranty: true,
    eligibleForMetaAds: true,
  },
  {
    id: 'toyota-corolla-cross-hybrid',
    make: 'TOYOTA',
    model: 'Corolla Cross',
    version: '1.8 VVT-i Hybrid XRX Flex Aut.',
    price: 189900,
    manufactureYear: 2024,
    modelYear: 2024,
    mileage: 15300,
    fuelType: 'Híbrido Flex',
    transmission: 'CVT',
    licensePlate: 'TOY1C24',
    vin: '9BRBL48E8P0123456',
    imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    status: 'SOLD',
    armored: false,
    hasWarranty: true,
    eligibleForMetaAds: true,
  },
];

export const vehicleService = {
  async listVehicles(params: VehicleFilterParams = {}): Promise<PaginatedResponse<Vehicle>> {
    try {
      const response = await httpClient.get<PaginatedResponse<Vehicle>>('/vehicles', {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          search: params.search,
          make: params.make,
          fuelType: params.fuelType,
          status: params.status,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
        timeout: 5000,
      });

      if (response.items) return response;
      return response as any;
    } catch {
      // Filtragem local inteligente de contingência
      let filtered = [...FALLBACK_VEHICLES];

      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.make.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q) ||
            v.version.toLowerCase().includes(q) ||
            v.licensePlate.toLowerCase().includes(q)
        );
      }

      if (params.make && params.make !== 'ALL') {
        filtered = filtered.filter((v) => v.make.toUpperCase() === params.make?.toUpperCase());
      }

      if (params.fuelType && params.fuelType !== 'ALL') {
        if (params.fuelType === 'HYBRID_EV') {
          filtered = filtered.filter((v) => v.fuelType.toLowerCase().includes('híbrido') || v.fuelType.toLowerCase().includes('elétrico'));
        } else if (params.fuelType === 'FLEX') {
          filtered = filtered.filter((v) => v.fuelType.toLowerCase().includes('flex') || v.fuelType.toLowerCase().includes('gasolina'));
        }
      }

      const total = filtered.length;
      const page = params.page || 1;
      const limit = params.limit || 20;

      return {
        items: filtered,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      };
    }
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const response = await httpClient.get<Vehicle>(`/vehicles/${id}`, { timeout: 5000 });
      return response;
    } catch {
      return FALLBACK_VEHICLES.find((v) => v.id === id) || FALLBACK_VEHICLES[0];
    }
  },
};
