import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import {
  Category,
  CategoryDetail,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryResponse,
  CategoryProductType,
} from '../types/category';

class CategoryService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private mapApiCategory(apiCategory: Record<string, unknown>): Category {
    return {
      id: apiCategory.id as number,
      name: apiCategory.name as string,
      code: apiCategory.code as string,
      description: (apiCategory.description as string) || '',
      isActive: (apiCategory.active ?? apiCategory.isActive ?? true) as boolean,
      productType: apiCategory.productType as CategoryProductType,
      minStockNotifyAt: (apiCategory.minStockNotifyAt as number | null) ?? null,
      requestable: apiCategory.requestable ?? false,
      totalQuantity: (apiCategory.totalQuantity as number) ?? 0,
      assignedQuantity: (apiCategory.assignedQuantity as number) ?? 0,
      availableQuantity: (apiCategory.availableQuantity as number) ?? 0,
    };
  }

  private mapApiCategoryDetail(data: Record<string, unknown>): CategoryDetail {
    const base = this.mapApiCategory(data);
    return {
      ...base,
      warehouseBreakdown: (data.warehouseBreakdown as CategoryDetail['warehouseBreakdown']) ?? [],
      stockItems: (data.stockItems as CategoryDetail['stockItems']) ?? [],
    };
  }

  async createCategory(category: CreateCategoryRequest): Promise<CategoryResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(category),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Kategori oluşturulurken bir hata oluştu',
          data: null,
          timestamp: new Date().toISOString(),
        };
      }
      return {
        success: true,
        message: 'Kategori başarıyla oluşturuldu',
        data: this.mapApiCategory(data),
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Kategori oluşturulurken bir hata oluştu';
      return { success: false, message, data: null, timestamp: new Date().toISOString() };
    }
  }

  async updateCategory(id: number, category: UpdateCategoryRequest): Promise<CategoryResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(category),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Kategori güncellenirken bir hata oluştu',
          data: null,
          timestamp: new Date().toISOString(),
        };
      }
      return {
        success: true,
        message: 'Kategori başarıyla güncellendi',
        data: this.mapApiCategory(data),
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Kategori güncellenirken bir hata oluştu';
      return { success: false, message, data: null, timestamp: new Date().toISOString() };
    }
  }

  async deleteCategory(id: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as { message?: string }).message || 'Failed to delete category');
    }
  }

  async getCategoryById(id: number): Promise<CategoryResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Kategori bulunamadı',
          data: null,
          timestamp: new Date().toISOString(),
        };
      }
      return {
        success: true,
        message: 'Kategori başarıyla getirildi',
        data: this.mapApiCategory(data),
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Kategori getirilirken bir hata oluştu';
      return { success: false, message, data: null, timestamp: new Date().toISOString() };
    }
  }

  async getCategoryDetail(id: number): Promise<{ success: boolean; data?: CategoryDetail; message?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/${id}/detail`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Kategori detayı yüklenemedi' };
      }
      return { success: true, data: this.mapApiCategoryDetail(data) };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Kategori detayı yüklenemedi';
      return { success: false, message };
    }
  }

  async getAllCategories(): Promise<Category[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/all`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Kategoriler yüklenirken bir hata oluştu');
    }
    const data = await response.json();
    return Array.isArray(data) ? data.map((c) => this.mapApiCategory(c)) : [];
  }

  async getActiveCategories(): Promise<CategoryResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/active`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Kategoriler yüklenirken bir hata oluştu',
          data: null,
          timestamp: new Date().toISOString(),
        };
      }
      const mapped = Array.isArray(data) ? data.map((c) => this.mapApiCategory(c)) : [this.mapApiCategory(data)];
      return {
        success: true,
        message: 'Kategoriler başarıyla getirildi',
        data: mapped,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Kategoriler yüklenirken bir hata oluştu';
      return { success: false, message, data: null, timestamp: new Date().toISOString() };
    }
  }

  async searchCategories(name: string): Promise<CategoryResponse> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/categories/search?name=${encodeURIComponent(name)}`,
      { method: 'GET', headers: this.getHeaders() }
    );
    if (!response.ok) {
      throw new Error('Failed to search categories');
    }
    const data = await response.json();
    const mapped = Array.isArray(data) ? data.map((c) => this.mapApiCategory(c)) : [];
    return {
      success: true,
      message: '',
      data: mapped,
      timestamp: new Date().toISOString(),
    };
  }
}

export const categoryService = new CategoryService();
