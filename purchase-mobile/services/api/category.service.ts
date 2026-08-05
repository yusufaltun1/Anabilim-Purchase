import { API_CONFIG, getAuthHeaders } from './api.config';
import {
  mapApiCategory,
  mapApiCategoryDetail,
  type Category,
  type CategoryDetail,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
} from '../types/category.types';

export type { Category } from '../types/category.types';

function normalizeList(data: unknown): Category[] {
  const raw = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)
      ? ((data as { data: unknown[] }).data)
      : [];
  return raw.map((item) => mapApiCategory(item as Record<string, unknown>));
}

function unwrapEntity(data: unknown): Record<string, unknown> {
  if (data && typeof data === 'object' && 'data' in data && (data as { data: unknown }).data) {
    return (data as { data: Record<string, unknown> }).data;
  }
  return (data as Record<string, unknown>) ?? {};
}

class CategoryService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getAllCategories(token: string): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/api/categories/all`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Kategoriler yüklenirken bir hata oluştu (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getActiveCategories(token: string): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/api/categories/active`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      throw new Error(`Aktif kategoriler yüklenirken bir hata oluştu (${response.status})`);
    }
    return normalizeList(await response.json());
  }

  async getCategoryById(id: number, token: string): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/api/categories/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (data as { message?: string })?.message || `Kategori bulunamadı (${response.status})`
      );
    }
    return mapApiCategory(unwrapEntity(data));
  }

  async getCategoryDetail(id: number, token: string): Promise<CategoryDetail> {
    const response = await fetch(`${this.baseUrl}/api/categories/${id}/detail`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (data as { message?: string })?.message || `Kategori detayı yüklenemedi (${response.status})`
      );
    }
    return mapApiCategoryDetail(unwrapEntity(data));
  }

  async createCategory(payload: CreateCategoryRequest, token: string): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/api/categories`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (data as { message?: string })?.message ||
          (data as { error?: string })?.error ||
          `Kategori oluşturulamadı (${response.status})`
      );
    }
    return mapApiCategory(unwrapEntity(data));
  }

  async updateCategory(id: number, payload: UpdateCategoryRequest, token: string): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/api/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        (data as { message?: string })?.message || `Kategori güncellenemedi (${response.status})`
      );
    }
    return mapApiCategory(unwrapEntity(data));
  }

  async deleteCategory(id: number, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { message?: string }).message || `Kategori silinemedi (${response.status})`
      );
    }
  }

  async searchCategories(name: string, token: string): Promise<Category[]> {
    const response = await fetch(
      `${this.baseUrl}/api/categories/search?name=${encodeURIComponent(name)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      throw new Error(`Kategori araması başarısız (${response.status})`);
    }
    return normalizeList(await response.json());
  }
}

export const categoryService = new CategoryService();
