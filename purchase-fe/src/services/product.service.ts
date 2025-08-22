import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import { Product, CreateProductRequest, UpdateProductRequest, ProductResponse } from '../types/product';

class ProductService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async createProduct(product: CreateProductRequest): Promise<ProductResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/products`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(product),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ürün oluşturulurken bir hata oluştu');
      }

      return {
        success: true,
        data,
        message: 'Ürün başarıyla oluşturuldu',
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

  async updateProduct(id: number, product: UpdateProductRequest): Promise<ProductResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(product),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Ürün güncellenirken bir hata oluştu');
      }

      return {
        success: true,
        data,
        message: 'Ürün başarıyla güncellendi',
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

  async deleteProduct(id: number): Promise<ProductResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Ürün silinirken bir hata oluştu');
      }

      return {
        success: true,
        data: null,
        message: 'Ürün başarıyla silindi',
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

  async getProductById(id: number): Promise<Product> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Ürün bulunamadı');
    }
    return await response.json();
  }

  async getAllProducts(): Promise<ProductResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/products`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return {
        success: true,
        data,
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

  async getProductByCode(code: string): Promise<ProductResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/code/${code}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    return await response.json();
  }

  async getActiveProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/active`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active products');
      }

      const data = await response.json();
      console.log('Active products response:', data);
      
      // Backend'den gelen response formatını kontrol et
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.error('Unexpected active products data format:', data);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching active products:', error);
      return [];
    }
  }

  async getProductsByCategory(categoryId: number): Promise<ProductResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/category/${categoryId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products by category');
    }

    return await response.json();
  }

  async getProductsBySupplier(supplierId: number): Promise<ProductResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/supplier/${supplierId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products by supplier');
    }

    return await response.json();
  }

  async searchProducts(name: string): Promise<ProductResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/search?name=${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search products');
    }

    return await response.json();
  }

  async addSupplierToProduct(productId: number, supplierId: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/${productId}/suppliers/${supplierId}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add supplier to product');
    }
  }

  async removeSupplierFromProduct(productId: number, supplierId: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/${productId}/suppliers/${supplierId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to remove supplier from product');
    }
  }
}

export const productService = new ProductService(); 