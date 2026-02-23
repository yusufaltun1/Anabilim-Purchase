import { CreatePurchaseRequestDto, CreatePurchaseRequestResponse, ParentApproverCandidate, PurchaseRequest } from '../types/purchase.types';
import { API_CONFIG, getAuthHeaders } from './api.config';

class PurchaseService {
  private baseUrl = API_CONFIG.BASE_URL;

  private normalizePagedResponse<T>(data: any, page: number, size: number) {
    if (data && Array.isArray(data.items)) {
      return {
        items: data.items as T[],
        page: data.page ?? page,
        size: data.size ?? size,
        totalElements: data.totalElements ?? data.items.length,
        totalPages: data.totalPages ?? 1,
        hasNext: data.hasNext ?? false,
      };
    }

    if (Array.isArray(data)) {
      return {
        items: data as T[],
        page,
        size,
        totalElements: data.length,
        totalPages: 1,
        hasNext: false,
      };
    }

    return {
      items: [] as T[],
      page,
      size,
      totalElements: 0,
      totalPages: 0,
      hasNext: false,
    };
  }

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

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
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

  async getFirstApproverCandidates(token: string): Promise<ParentApproverCandidate[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.FIRST_APPROVER_CANDIDATES}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `HTTP hatası! Durum: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data?.data ?? [];
    } catch (error) {
      console.error('İlk onaycı adayları yüklenirken hata:', error);
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

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Bekleyen onaylar yüklenirken hata:', error);
      throw error;
    }
  }

  async getMyRequestsPage(token: string, page = 0, size = 20) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.MY_REQUESTS}/paged?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP hatası! Durum: ${response.status}`);
    }

    const data = await response.json();
    return this.normalizePagedResponse<PurchaseRequest>(data, page, size);
  }

  async getPendingApprovalsPage(token: string, page = 0, size = 20) {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.PENDING_APPROVALS}/paged?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP hatası! Durum: ${response.status}`);
    }

    const data = await response.json();
    return this.normalizePagedResponse<PurchaseRequest>(data, page, size);
  }

  async approveRequest(
    id: number,
    token: string,
    payload: { comment?: string; nextApproverUserId?: number | null; sendToUserId?: number | null } = {}
  ): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.APPROVE(id)}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          comment: payload.comment ?? '',
          rejectionReason: '',
          approved: true,
          nextApproverUserId: payload.nextApproverUserId ?? undefined,
          sendToUserId: payload.sendToUserId ?? undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `HTTP hatası! Durum: ${response.status}`);
      }
    } catch (error) {
      console.error('Talep onaylanırken hata:', error);
      throw error;
    }
  }

  async rejectRequest(
    id: number,
    token: string,
    payload: { comment: string; rejectionReason?: string; returnToUserId?: number | null }
  ): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.REJECT(id)}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          comment: payload.comment,
          rejectionReason: payload.rejectionReason ?? payload.comment,
          approved: false,
          returnToUserId: payload.returnToUserId ?? undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `HTTP hatası! Durum: ${response.status}`);
      }
    } catch (error) {
      console.error('Talep reddedilirken hata:', error);
      throw error;
    }
  }

  async resubmitRequest(id: number, token: string): Promise<PurchaseRequest> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.BASE}/${id}/resubmit`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP hatası! Durum: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Talep tekrar gönderilirken hata:', error);
      throw error;
    }
  }

  async updatePurchaseRequest(
    id: number,
    updateData: {
      title: string;
      description: string;
      items: any[];
    },
    token: string
  ): Promise<PurchaseRequest> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.BASE}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP hatası! Durum: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Talep güncellenirken hata:', error);
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
