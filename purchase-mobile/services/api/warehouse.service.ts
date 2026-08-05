import { API_CONFIG, getAuthHeaders } from './api.config';
import type {
  ManualStockMovementPayload,
  StockItem,
  StockMovementDetail,
} from '../types/assignment.types';
import type { ProductStockListResponse, ProductStockSummary } from '../types/product.types';

export type Warehouse = {
  id: number;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  /** Backend alanı; `isActive` ile senkron tutulur */
  active?: boolean;
  isActive?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateWarehousePayload = {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  managerName: string;
};

export type WarehouseStockProduct = {
  id: number;
  name: string;
  code?: string;
  description?: string;
  category?: string;
  unit?: string;
  productType?: string;
};

export type WarehouseStock = {
  id: number;
  warehouseId?: number;
  productId?: number;
  product: WarehouseStockProduct;
  currentStock: number;
  minStock?: number;
  maxStock?: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  lastMovementDate?: string;
};

export type WarehouseStockMovement = {
  id: number;
  quantity: number;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | string;
  referenceType?: string;
  referenceId?: number | null;
  notes?: string;
  createdAt?: string;
  createdBy?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

export type CreateStockMovementPayload = {
  quantity: number;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
  referenceType: 'PURCHASE_ORDER' | 'MANUAL' | 'ADJUSTMENT' | 'ASSIGNMENT';
  referenceId?: number;
  notes?: string;
  stockItemId?: number;
  serialNumber?: string;
  parentLocationId?: number;
  childLocationId?: number;
};

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as { data?: unknown; content?: unknown };
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.content)) return obj.content as T[];
  }
  return [];
}

function normalizeWarehouse(raw: Warehouse): Warehouse {
  const active = Boolean(raw.isActive ?? raw.active ?? true);
  return {
    ...raw,
    active,
    isActive: active,
  };
}

function unwrapWarehouse(data: unknown): Warehouse | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as { data?: unknown };
  const candidate = obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data) ? obj.data : data;
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
  const w = candidate as Warehouse;
  if (typeof w.id !== 'number' || typeof w.name !== 'string') return null;
  return normalizeWarehouse(w);
}

export type CreateStockItemPayload = {
  productId: number;
  serialNumber: string;
  warehouseId: number;
  imageUrl?: string;
  notes?: string;
};

class WarehouseService {
  async getWarehouses(token: string): Promise<Warehouse[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.BASE}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Depolar yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return (list as Warehouse[]).map(normalizeWarehouse);
  }

  async getWarehouseById(id: number, token: string): Promise<Warehouse> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.BASE}/${id}`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    );
    if (!response.ok) {
      throw new Error(`Depo yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    const warehouse = unwrapWarehouse(data);
    if (!warehouse) {
      throw new Error('Depo bulunamadı');
    }
    return warehouse;
  }

  async createWarehouse(payload: CreateWarehousePayload, token: string): Promise<Warehouse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.BASE}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
          ? data.message
          : null) || `Depo oluşturulamadı (${response.status})`
      );
    }
    const warehouse = unwrapWarehouse(data);
    if (!warehouse) {
      throw new Error('Depo oluşturuldu ancak yanıt çözümlenemedi');
    }
    return warehouse;
  }

  async updateWarehouseStatus(id: number, token: string): Promise<Warehouse> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.BASE}/${id}/status`,
      {
        method: 'PUT',
        headers: getAuthHeaders(token),
      }
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
          ? data.message
          : null) || `Depo durumu güncellenemedi (${response.status})`
      );
    }
    const warehouse = unwrapWarehouse(data);
    if (!warehouse) {
      throw new Error('Depo durumu güncellendi ancak yanıt çözümlenemedi');
    }
    return warehouse;
  }

  async getWarehouseStocks(warehouseId: number, token: string): Promise<WarehouseStock[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/warehouse-stocks/warehouse/${warehouseId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    );
    if (!response.ok) {
      throw new Error(`Depo stokları yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    if (Array.isArray(data)) return data as WarehouseStock[];
    if (Array.isArray(data?.data)) return data.data as WarehouseStock[];
    if (Array.isArray(data?.content)) return data.content as WarehouseStock[];
    return [];
  }

  async getStockMovements(
    stockId: number,
    token: string,
    page = 0,
    size = 10
  ): Promise<WarehouseStockMovement[]> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/warehouse-stocks/${stockId}/movements?${params.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    );
    if (!response.ok) {
      throw new Error(`Stok hareketleri yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    return unwrapList<WarehouseStockMovement>(data);
  }

  async getActiveWarehouses(token: string): Promise<Warehouse[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.ACTIVE}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        if (list.length) return (list as Warehouse[]).map(normalizeWarehouse);
      }
    } catch {
      // fallback below
    }
    const all = await this.getWarehouses(token);
    return all.filter((w) => (w.isActive ?? w.active) !== false);
  }

  async createStockMovement(
    warehouseId: number,
    productId: number,
    payload: CreateStockMovementPayload | ManualStockMovementPayload,
    token: string
  ): Promise<unknown> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.STOCK_MOVEMENTS}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          warehouseId,
          productId,
          currentStock: 0,
          referenceId: 0,
          ...payload,
        }),
      }
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || `Stok hareketi oluşturulamadı (${response.status})`);
    }
    return data;
  }

  async getProductStockItems(productId: number, token: string): Promise<StockItem[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.STOCK_ITEMS}/product/${productId}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Stok kalemleri yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    return unwrapList<StockItem>(data);
  }

  async getStockItemMovements(stockItemId: number, token: string): Promise<StockMovementDetail[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.STOCK_ITEMS}/${stockItemId}/movements`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Stok hareketleri yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    return unwrapList<StockMovementDetail>(data);
  }

  async createStockItem(payload: CreateStockItemPayload, token: string): Promise<unknown> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.STOCK_ITEMS}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || `Stok kalemi oluşturulamadı (${response.status})`);
    }
    return data;
  }

  async getProductStocksList(
    page: number,
    size: number,
    token: string
  ): Promise<ProductStockListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WAREHOUSES.PRODUCT_STOCKS}?${params.toString()}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Stok listesi yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return { content: data as ProductStockSummary[], last: true, number: page, size };
    }
    const content = Array.isArray(data?.content)
      ? (data.content as ProductStockSummary[])
      : Array.isArray(data?.items)
        ? (data.items as ProductStockSummary[])
        : [];
    return {
      content,
      last: Boolean(data?.last ?? content.length < size),
      totalElements: data?.totalElements,
      totalPages: data?.totalPages,
      number: typeof data?.number === 'number' ? data.number : page,
      size: typeof data?.size === 'number' ? data.size : size,
      empty: data?.empty ?? content.length === 0,
    };
  }
}

export const warehouseService = new WarehouseService();
