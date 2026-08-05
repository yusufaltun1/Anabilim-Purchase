import { API_CONFIG, getAuthHeaders } from './api.config';
import {
  mapApiToLocation,
  mapApiToLocationProduct,
  type CreateLocationRequest,
  type Location,
  type LocationProductSummary,
  type UpdateLocationRequest,
} from '../types/location.types';

function normalizeList(data: unknown): Location[] {
  const raw = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)
      ? ((data as { data: unknown[] }).data)
      : [];
  return raw.map((item) => mapApiToLocation(item as Record<string, unknown>));
}

class LocationService {
  private readonly basePath = '/api/locations';

  private url(path = ''): string {
    return `${API_CONFIG.BASE_URL}${this.basePath}${path}`;
  }

  async getAllLocations(token: string): Promise<Location[]> {
    const response = await fetch(this.url(), {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Konumlar yüklenemedi (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getLocationById(id: number, token: string): Promise<Location> {
    const response = await fetch(this.url(`/${id}`), {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message || `Konum bulunamadı (${response.status})`
      );
    }
    const data = await response.json();
    return mapApiToLocation((data?.data ?? data) as Record<string, unknown>);
  }

  async getProductsByLocationId(id: number, token: string): Promise<LocationProductSummary[]> {
    const response = await fetch(this.url(`/${id}/products`), {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message ||
          `Konum ürünleri yüklenemedi (${response.status})`
      );
    }
    const data = await response.json();
    const raw = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)
        ? (data as { data: unknown[] }).data
        : [];
    return raw.map((item) => mapApiToLocationProduct(item as Record<string, unknown>));
  }

  async createLocation(payload: CreateLocationRequest, token: string): Promise<Location> {
    const response = await fetch(this.url(), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { message?: string }).message || `Konum oluşturulamadı (${response.status})`
      );
    }
    return mapApiToLocation((data?.data ?? data) as Record<string, unknown>);
  }

  async updateLocation(
    id: number,
    payload: UpdateLocationRequest,
    token: string
  ): Promise<Location> {
    const response = await fetch(this.url(`/${id}`), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { message?: string }).message || `Konum güncellenemedi (${response.status})`
      );
    }
    return mapApiToLocation((data?.data ?? data) as Record<string, unknown>);
  }

  async deleteLocation(id: number, token: string): Promise<void> {
    const response = await fetch(this.url(`/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        (data as { message?: string }).message || `Konum silinemedi (${response.status})`
      );
    }
  }
}

export const locationService = new LocationService();
