import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authService.getToken()}`,
  };
}

export interface DeviceModel {
  id: number;
  name: string;
  brand?: string;
  enableIp?: boolean;
  enableMac?: boolean;
}

export interface AssetCondition {
  id: number;
  name: string;
  allowsAssignment?: boolean;
}

export interface LocationOption {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
}

export const inventoryService = {
  async getDeviceBrands(): Promise<string[]> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/inventory/device-brands`, { headers: headers() });
    return res.ok ? res.json() : [];
  },

  async getDeviceModels(): Promise<DeviceModel[]> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/inventory/device-models`, { headers: headers() });
    return res.ok ? res.json() : [];
  },

  async createDeviceModel(body: { name: string; brand: string; enableIp?: boolean; enableMac?: boolean }) {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/inventory/device-models`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { message?: string }).message || 'Model oluşturulamadı');
    }
    return res.json() as Promise<DeviceModel>;
  },

  async getAssetConditions(): Promise<AssetCondition[]> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/inventory/asset-conditions`, { headers: headers() });
    return res.ok ? res.json() : [];
  },

  async createAssetCondition(body: { name: string; allowsAssignment?: boolean }) {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/inventory/asset-conditions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Durum oluşturulamadı');
    return res.json();
  },

  async getParentLocations(): Promise<LocationOption[]> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/inventory/locations/parents`, { headers: headers() });
    return res.ok ? res.json() : [];
  },

  async getChildLocations(parentId: number): Promise<LocationOption[]> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/inventory/locations/children?parentId=${parentId}`, {
      headers: headers(),
    });
    return res.ok ? res.json() : [];
  },

  async createLocation(body: { name: string; description?: string; parentId?: number }) {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/inventory/locations`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Konum oluşturulamadı');
    return res.json();
  },

};
