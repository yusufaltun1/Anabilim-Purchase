import { CreatePurchaseRequestDto, CreatePurchaseRequestResponse, PurchaseRequest } from '../types/purchase.types';
import { API_CONFIG, getAuthHeaders } from './api.config';

class PurchaseService {
  private baseUrl = API_CONFIG.BASE_URL;

  async createPurchaseRequest(
    requestData: CreatePurchaseRequestDto,
    token: string
  ): Promise<CreatePurchaseRequestResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.BASE}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP hatası! Durum: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Yanıt verisi:", JSON.stringify(responseData, null, 2));
      
      // Backend direkt data döndürüyorsa wrapper ekle
      if (responseData.success !== undefined) {
        // Zaten wrapped response
        return responseData as CreatePurchaseRequestResponse;
      } else {
        // Direkt data döndürüyor, wrapper ekle
        return {
          success: true,
          message: 'Talep başarıyla oluşturuldu',
          data: responseData as PurchaseRequest,
        };
      }
    } catch (error) {
      console.error('Talep oluşturulurken hata:', error);
      throw error;
    }
  }

  async getMyRequests(token: string): Promise<PurchaseRequest[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.MY_REQUESTS}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Taleplerim yüklenirken hata:', error);
      throw error;
    }
  }

  async getRequestById(id: number, token: string): Promise<PurchaseRequest> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.DETAIL(id)}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Talep detayı yüklenirken hata:', error);
      throw error;
    }
  }

  async getPendingApprovals(token: string): Promise<PurchaseRequest[]> {
    try {
      console.log(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.PENDING_APPROVALS}`);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.PENDING_APPROVALS}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      console.log("getPendingApprovals response", JSON.stringify(response));
      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bekleyen onaylar yüklenirken hata:', error);
      throw error;
    }
  }

  async approveRequest(id: number, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.APPROVE(id)}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          comment: '',
          rejectionReason: '',
          approved: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }
    } catch (error) {
      console.error('Talep onaylanırken hata:', error);
      throw error;
    }
  }

  async rejectRequest(id: number, reason: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.REJECT(id)}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          comment: reason,
          rejectionReason: reason,
          approved: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }
    } catch (error) {
      console.error('Talep reddedilirken hata:', error);
      throw error;
    }
  }

  async getSuppliers(token: string) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS.BASE}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Tedarikçiler yüklenirken hata:', error);
      throw error;
    }
  }
}

export const purchaseService = new PurchaseService();
