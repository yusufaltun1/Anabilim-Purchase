import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryResponse } from '../types/category';

class CategoryService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private mapApiCategoryToCategory(apiCategory: any): Category {
    return {
      id: apiCategory.id,
      name: apiCategory.name,
      code: apiCategory.code,
      description: apiCategory.description || '',
      parentId: apiCategory.parent ? apiCategory.parent.id : null,
      isActive: apiCategory.active ?? true,
      subCategories: apiCategory.subCategories ? apiCategory.subCategories.map((sub: any) => this.mapApiCategoryToCategory(sub)) : [],
      productCount: apiCategory.productCount
    };
  }

  async createCategory(category: CreateCategoryRequest): Promise<CategoryResponse> {
    try {
      console.log('Creating category with data:', category);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(category),
      });

      const data = await response.json();
      console.log('Create category API response:', data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Kategori oluşturulurken bir hata oluştu',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Kategori başarıyla oluşturuldu',
        data: this.mapApiCategoryToCategory(data),
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error in createCategory:', error);
      return {
        success: false,
        message: error.message || 'Kategori oluşturulurken bir hata oluştu',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateCategory(id: number, category: UpdateCategoryRequest): Promise<CategoryResponse> {
    try {
      console.log('Updating category with data:', { id, category });
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(category),
      });

      const data = await response.json();
      console.log('Update category API response:', data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Kategori güncellenirken bir hata oluştu',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Kategori başarıyla güncellendi',
        data: this.mapApiCategoryToCategory(data),
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error in updateCategory:', error);
      return {
        success: false,
        message: error.message || 'Kategori güncellenirken bir hata oluştu',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async deleteCategory(id: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete category');
    }
  }

  async getCategoryById(id: number): Promise<CategoryResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      console.log('Get category by ID raw response:', data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Kategori bulunamadı',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      // API yanıtını Category tipine dönüştür
      const mappedCategory = this.mapApiCategoryToCategory(data);
      console.log('Get category by ID mapped data:', mappedCategory);

      return {
        success: true,
        message: 'Kategori başarıyla getirildi',
        data: mappedCategory,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error in getCategoryById:', error);
      return {
        success: false,
        message: error.message || 'Kategori getirilirken bir hata oluştu',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getCategoryByCode(code: string): Promise<CategoryResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/code/${code}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch category');
    }

    return await response.json();
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/all`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Kategoriler yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Kategoriler yüklenirken bir hata oluştu');
    }
  }

  async getActiveCategories(): Promise<CategoryResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/active`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      console.log('Active categories API response:', data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Kategoriler yüklenirken bir hata oluştu',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      // API yanıtını Category[] tipine dönüştür
      const mappedCategories = Array.isArray(data) 
        ? data.map(category => this.mapApiCategoryToCategory(category))
        : [this.mapApiCategoryToCategory(data)];

      return {
        success: true,
        message: 'Kategoriler başarıyla getirildi',
        data: mappedCategories,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error in getActiveCategories:', error);
      return {
        success: false,
        message: error.message || 'Kategoriler yüklenirken bir hata oluştu',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getRootCategories(): Promise<CategoryResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/root`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch root categories');
    }

    return await response.json();
  }

  async getSubCategories(parentId: number): Promise<CategoryResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/sub/${parentId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sub-categories');
    }

    return await response.json();
  }

  async searchCategories(name: string): Promise<CategoryResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/categories/search?name=${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search categories');
    }

    return await response.json();
  }
}

export const categoryService = new CategoryService(); 