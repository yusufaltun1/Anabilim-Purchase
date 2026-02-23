import { API_CONFIG, getAuthHeaders } from './api.config';

export interface Category {
  id: number;
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
}

class CategoryService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getAllCategories(token: string): Promise<Category[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories/all`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      throw error;
    }
  }

  async getActiveCategories(token: string): Promise<Category[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/categories/active`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Aktif kategoriler yüklenirken hata:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
