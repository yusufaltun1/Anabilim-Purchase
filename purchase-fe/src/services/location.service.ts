import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import { Location, CreateLocationRequest, UpdateLocationRequest, LocationResponse } from '../types/location';

function mapLocation(raw: Record<string, unknown>): Location {
  return {
    id: raw.id as number,
    name: raw.name as string,
    description: (raw.description as string) || '',
    parentId: (raw.parentId as number | null | undefined) ?? null,
    parentName: (raw.parentName as string | null | undefined) ?? null,
    level: (raw.level as number | undefined) ?? undefined,
    path: (raw.path as string | undefined) ?? undefined,
    isDefault: raw.isDefault === true,
    createdAt: raw.createdAt as string | undefined,
    updatedAt: raw.updatedAt as string | undefined,
  };
}

class LocationService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAllLocations(): Promise<LocationResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/locations`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          data: [],
          message: data.message || 'Konumlar yüklenirken hata oluştu',
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        success: true,
        data: Array.isArray(data) ? data.map((item) => mapLocation(item as Record<string, unknown>)) : [],
        message: '',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getLocationById(id: number): Promise<Location> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/locations/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Konum bulunamadı');
    }
    return mapLocation((await response.json()) as Record<string, unknown>);
  }

  async createLocation(location: CreateLocationRequest): Promise<LocationResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/locations`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(location),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Konum oluşturulurken bir hata oluştu');
      }

      return {
        success: true,
        data: mapLocation(data as Record<string, unknown>),
        message: 'Konum başarıyla oluşturuldu',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateLocation(id: number, location: UpdateLocationRequest): Promise<LocationResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/locations/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(location),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Konum güncellenirken bir hata oluştu');
      }

      return {
        success: true,
        data: mapLocation(data as Record<string, unknown>),
        message: 'Konum başarıyla güncellendi',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async deleteLocation(id: number): Promise<LocationResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/locations/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Konum silinirken bir hata oluştu');
      }

      return {
        success: true,
        data: null,
        message: 'Konum başarıyla silindi',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const locationService = new LocationService();
