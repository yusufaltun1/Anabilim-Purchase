import { API_CONFIG, getAuthHeaders } from './api.config';
import {
  mapApiToProduct,
  type Assignment,
  type CreateProductRequest,
  type Product,
  type ProductSearchResponse,
  type ProductStockDetail,
  type ProductStockSummary,
  type UpdateProductRequest,
} from '../types/product.types';

function unwrapArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as { data?: unknown; content?: unknown; items?: unknown };
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.content)) return obj.content as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

function unwrapEntity<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'data' in data && (data as { data: unknown }).data != null) {
    return (data as { data: T }).data;
  }
  return data as T;
}

class ProductService {
  private baseUrl = API_CONFIG.BASE_URL;

  async searchProducts(query: string, token: string): Promise<ProductStockSummary[]> {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.append('search', query.trim());
    }
    params.append('page', '0');
    params.append('size', '50');

    const response = await fetch(`${this.baseUrl}/api/warehouse-stocks/products?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`HTTP hatası! Durum: ${response.status}`);
    }

    const data: ProductSearchResponse = await response.json();
    if (Array.isArray(data?.content)) {
      return data.content;
    }
    if (Array.isArray(data?.items)) {
      return data.items;
    }
    if (Array.isArray(data as unknown)) {
      return data as unknown as ProductStockSummary[];
    }
    return [];
  }

  async getProductStockDetail(productId: number, token: string): Promise<ProductStockDetail> {
    const response = await fetch(`${this.baseUrl}/api/warehouse-stocks/product/${productId}/detail`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`HTTP hatası! Durum: ${response.status}`);
    }

    return response.json();
  }

  async getAssignmentsByProduct(productId: number, token: string): Promise<Assignment[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/assignments/product/${productId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`HTTP hatası! Durum: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }

  async getAllProducts(token: string): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PRODUCTS.BASE}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Ürünler yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    return unwrapArray(data).map(mapApiToProduct);
  }

  async createProduct(productData: CreateProductRequest, token: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PRODUCTS.BASE}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(productData),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { message?: string }).message || `Ürün oluşturulamadı (${response.status})`
      );
    }
    return mapApiToProduct(unwrapEntity(data));
  }

  async updateProduct(id: number, payload: UpdateProductRequest, token: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { message?: string }).message || `Ürün güncellenemedi (${response.status})`
      );
    }
    return mapApiToProduct(unwrapEntity(data));
  }

  async deleteProduct(id: number, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        (data as { message?: string }).message || `Ürün silinemedi (${response.status})`
      );
    }
  }

  async getProductProcurement(id: number, token: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PRODUCTS.PROCUREMENT(id)}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Satın alma geçmişi yüklenemedi (${response.status})`);
    }
    return response.json();
  }

  async getActiveProducts(token: string): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PRODUCTS.ACTIVE}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Aktif ürünler yüklenemedi (${response.status})`);
    }
    const data = await response.json();
    return unwrapArray(data).map(mapApiToProduct);
  }

  async getProductById(id: number, token: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id)}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error(`Ürün bulunamadı (${response.status})`);
    const data = await response.json();
    return mapApiToProduct(unwrapEntity(data));
  }

  async addSupplierToProduct(productId: number, supplierId: number, token: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.PRODUCTS.ADD_SUPPLIER(productId, supplierId)}`,
      { method: 'POST', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        (data as { message?: string }).message || `Tedarikçi eklenemedi (${response.status})`
      );
    }
  }
}

export const productService = new ProductService();
