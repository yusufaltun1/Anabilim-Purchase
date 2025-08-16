import { API_CONFIG } from '../config/api.config';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest, SupplierResponse } from '../types/supplier';
import { authService } from './auth.service';

class SupplierService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private mapRequestToApi(request: CreateSupplierRequest | UpdateSupplierRequest) {
    const apiRequest = {
      ...request,
      active: 'isActive' in request ? request.isActive : undefined,
      preferred: request.isPreferred,
      categoryIds: request.categoryIds
    };

    // Remove the original fields that we've mapped
    if ('isActive' in apiRequest) delete apiRequest.isActive;
    if ('isPreferred' in apiRequest) delete apiRequest.isPreferred;

    return apiRequest;
  }

  private mapApiToSupplier(apiResponse: any): Supplier {
    return {
      ...apiResponse,
      isActive: apiResponse.active,
      isPreferred: apiResponse.preferred
    };
  }

  async createSupplier(supplier: CreateSupplierRequest): Promise<SupplierResponse> {
    try {
      const apiRequest = this.mapRequestToApi(supplier);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/suppliers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(apiRequest),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Tedarikçi oluşturulurken bir hata oluştu');
      }

      return {
        success: true,
        data: this.mapApiToSupplier(data),
        message: 'Tedarikçi başarıyla oluşturuldu',
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

  async updateSupplier(id: number, supplier: UpdateSupplierRequest): Promise<SupplierResponse> {
    try {
      const apiRequest = this.mapRequestToApi(supplier);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/suppliers/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(apiRequest),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Tedarikçi güncellenirken bir hata oluştu');
      }

      return {
        success: true,
        data: this.mapApiToSupplier(data),
        message: 'Tedarikçi başarıyla güncellendi',
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

  async deleteSupplier(id: number): Promise<SupplierResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Tedarikçi silinirken bir hata oluştu');
      }

      return {
        success: true,
        data: null,
        message: 'Tedarikçi başarıyla silindi',
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

  async getSupplierById(id: number): Promise<Supplier> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/suppliers/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Tedarikçi bulunamadı');
    }

    const data = await response.json();
    return this.mapApiToSupplier(data);
  }

  async getSupplierByTaxNumber(taxNumber: string): Promise<Supplier> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/suppliers/tax-number/${taxNumber}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Tedarikçi bulunamadı');
    }

    const data = await response.json();
    return this.mapApiToSupplier(data);
  }

  async getAllSuppliers(): Promise<SupplierResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/suppliers`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return {
        success: true,
        data: Array.isArray(data) ? data.map(this.mapApiToSupplier) : this.mapApiToSupplier(data),
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

  async getActiveSuppliers(): Promise<SupplierResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/suppliers/active`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return {
        success: true,
        data: Array.isArray(data) ? data.map(this.mapApiToSupplier) : this.mapApiToSupplier(data),
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

  async getSuppliersByCategory(categoryId: number): Promise<SupplierResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/suppliers/by-category/${categoryId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Tedarikçiler yüklenirken bir hata oluştu');
      }

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
}

export const supplierService = new SupplierService(); 