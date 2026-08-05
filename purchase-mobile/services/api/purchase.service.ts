import {
  CreatePurchaseRequestDto,
  CreatePurchaseRequestResponse,
  ParentApproverCandidate,
  PurchaseRequest,
  PurchaseRequestAttachment,
} from '../types/purchase.types';
import { API_CONFIG, getAuthHeaders, getAuthHeadersMultipart } from './api.config';

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
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.DETAIL(id)}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }

      const json = await response.json();
      if (json != null && typeof json === 'object' && json.data != null && !json.id && json.data.id != null) {
        return json.data as PurchaseRequest;
      }
      return json as PurchaseRequest;
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

  /** Üst onaycıdan iletilmiş talepler — satın alma personeli Home/Dashboard */
  async getSeniorForwardedPendingApprovals(token: string): Promise<PurchaseRequest[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.SENIOR_FORWARDED_PENDING_APPROVALS}`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

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
      console.error('Üst onaydan iletilen talepler yüklenirken hata:', error);
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

  async updateItems(
    id: number,
    updateData: {
      title: string;
      description: string;
      items: any[];
    },
    token: string
  ): Promise<PurchaseRequest> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.UPDATE_ITEMS(id)}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(updateData),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Kalemler güncellenemedi (${response.status})`);
    }
    const data = await response.json();
    return (data?.data ?? data) as PurchaseRequest;
  }

  async deleteRequest(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.DELETE(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Talep silinemedi (${response.status})`);
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

  async getActiveSuppliers(token: string): Promise<import('../types/purchase.types').Supplier[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS.ACTIVE}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) {
      // fallback
      const all = await this.getSuppliers(token);
      return Array.isArray(all) ? all : Array.isArray(all?.data) ? all.data : [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  }

  async getSuppliersByCategory(
    categoryId: number,
    token: string
  ): Promise<import('../types/purchase.types').Supplier[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIERS.BY_CATEGORY(categoryId)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      return this.getActiveSuppliers(token);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  }

  async uploadAttachment(
    requestId: number,
    token: string,
    file: { uri: string; name: string; type: string }
  ): Promise<PurchaseRequestAttachment> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.ATTACHMENTS(requestId)}`,
      {
        method: 'POST',
        headers: getAuthHeadersMultipart(token),
        body: formData,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Yükleme hatası: ${response.status}`);
    }

    return response.json();
  }

  getAttachmentDownloadUrl(requestId: number, attachmentId: number): string {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE.ATTACHMENT_DOWNLOAD(requestId, attachmentId)}`;
  }
}

export const purchaseService = new PurchaseService();
