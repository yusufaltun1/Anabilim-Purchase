import { API_CONFIG, getAuthHeaders } from './api.config';
import { Assignment, ProductSearchResponse, ProductStockDetail, ProductStockSummary } from '../types/product.types';

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
    // Backend'den ApiResponse formatında geliyor
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }

  async createProduct(productData: {
    name: string;
    code?: string;
    description?: string;
    categoryId: number;
    productType: 'CONSUMABLE' | 'SEMI_FIXED_ASSET' | 'FIXED_ASSET';
    unitOfMeasure: 'PIECE' | 'METER' | 'LITER' | 'KILOGRAM';
    minQuantity?: number;
    maxQuantity?: number;
    estimatedUnitPrice?: number;
    currency?: string;
    imageUrl?: string;
    serialNumber?: string;
  }, token: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/products`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP hatası! Durum: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ürün oluşturulurken hata:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();
