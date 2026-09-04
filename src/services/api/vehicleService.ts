import { env } from '../../config/env.js';
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
  heroImageUrl?: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  armored?: boolean;
  hasWarranty?: boolean;
  eligibleForMetaAds: boolean;
  validationWarnings?: string[];
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
];

function buildQueryParams(params: VehicleFilterParams = {}) {
  return {
    page: params.page || 1,
    limit: params.limit || 20,
    search: params.search,
    make: params.make,
    fuelType: params.fuelType,
    status: params.status,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    ...(params.eligibleOnly !== undefined
      ? { eligibleOnly: params.eligibleOnly ? 'true' : 'false' }
      : {}),
  };
}

export const vehicleService = {
  async listVehicles(
    workspaceId: string,
    params: VehicleFilterParams = {},
  ): Promise<PaginatedResponse<Vehicle>> {
    try {
      return await httpClient.get<PaginatedResponse<Vehicle>>(
        `/workspaces/${workspaceId}/vehicles`,
        {
          params: buildQueryParams(params),
        },
      );
    } catch (error) {
      if (!env.enableMockFallback) throw error;

      let filtered = [...FALLBACK_VEHICLES];

      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.make.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q) ||
            v.version.toLowerCase().includes(q) ||
            v.licensePlate.toLowerCase().includes(q),
        );
      }

      if (params.make && params.make !== 'ALL') {
        filtered = filtered.filter((v) => v.make.toUpperCase() === params.make?.toUpperCase());
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

  async listVehicleMakes(workspaceId: string): Promise<string[]> {
    try {
      const data = await httpClient.get<{ makes: string[] }>(
        `/workspaces/${workspaceId}/vehicles/makes`,
      );
      return data.makes;
    } catch (error) {
      if (!env.enableMockFallback) throw error;
      return Array.from(new Set(FALLBACK_VEHICLES.map((v) => v.make)));
    }
  },
  async getVehicleById(workspaceId: string, id: string): Promise<Vehicle | null> {
    try {
      return await httpClient.get<Vehicle>(`/workspaces/${workspaceId}/vehicles/${id}`);
    } catch (error) {
      if (!env.enableMockFallback) throw error;
      return FALLBACK_VEHICLES.find((v) => v.id === id) || null;
    }
  },
};
