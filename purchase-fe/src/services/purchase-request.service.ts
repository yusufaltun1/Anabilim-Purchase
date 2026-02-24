import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import {
  PurchaseRequest,
  PurchaseRequestResponse,
  CreatePurchaseRequest,
  AddItemsRequest,
  ApprovalAction,
  PurchaseRequestHistory,
  UpdatePurchaseRequestItemsRequest,
  PurchaseRequestItemsResponse,
  ParentApproverCandidate,
  PurchaseRequestAttachment
} from '../types/purchase-request';

class PurchaseRequestService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private getHeadersMultipart(): HeadersInit {
    const token = authService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async getFirstApproverCandidates(): Promise<ParentApproverCandidate[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/first-approver-candidates`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'İlk onaycı adayları alınamadı');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data ?? data ?? []);
  }

  async createRequest(request: CreatePurchaseRequest): Promise<PurchaseRequestResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Satın alma talebi oluşturulurken bir hata oluştu');
      }

      return {
        success: true,
        message: 'Satın alma talebi başarıyla oluşturuldu',
        data: data.data || data,
        timestamp: new Date().toISOString(),
        errorCode: null
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Satın alma talebi oluşturulurken bir hata oluştu',
        data: null,
        timestamp: new Date().toISOString(),
        errorCode: 'CREATE_ERROR'
      };
    }
  }

  async getAllRequests(): Promise<PurchaseRequestResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch purchase requests');
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Success',
      data: data,
      timestamp: new Date().toISOString(),
      errorCode: null
    };
  }

  async getRequestById(id: number): Promise<PurchaseRequestResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch purchase request');
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Success',
      data: data,
      timestamp: new Date().toISOString(),
      errorCode: null
    };
  }

  async getMyRequests(): Promise<PurchaseRequestResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/my-requests`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      console.log('getMyRequests raw response:', data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Taleplerim alınamadı',
          data: [],
          timestamp: new Date().toISOString(),
          errorCode: 'FETCH_ERROR'
        };
      }

      // Backend'den gelen veriyi doğru formata çevir
      return {
        success: true,
        message: 'Taleplerim başarıyla alındı',
        data: Array.isArray(data) ? data : (data.data || []),
        timestamp: new Date().toISOString(),
        errorCode: null
      };
    } catch (error: any) {
      console.error('Error in getMyRequests:', error);
      return {
        success: false,
        message: error.message || 'Taleplerim alınamadı',
        data: [],
        timestamp: new Date().toISOString(),
        errorCode: 'FETCH_ERROR'
      };
    }
  }

  async getPendingApprovals(): Promise<PurchaseRequestResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/pending-approvals`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      console.log('getPendingApprovals raw response:', data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Onay bekleyen talepler alınamadı',
          data: [],
          timestamp: new Date().toISOString(),
          errorCode: 'FETCH_ERROR'
        };
      }

      // Backend'den gelen veriyi doğru formata çevir
      return {
        success: true,
        message: 'Onay bekleyen talepler başarıyla alındı',
        data: Array.isArray(data) ? data : (data.data || []),
        timestamp: new Date().toISOString(),
        errorCode: null
      };
    } catch (error: any) {
      console.error('Error in getPendingApprovals:', error);
      return {
        success: false,
        message: error.message || 'Onay bekleyen talepler alınamadı',
        data: [],
        timestamp: new Date().toISOString(),
        errorCode: 'FETCH_ERROR'
      };
    }
  }

  async approveRequest(id: number, action: ApprovalAction): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${id}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(action),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to approve request');
    }
  }

  async rejectRequest(id: number, action: ApprovalAction): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${id}/reject`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(action),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to reject request');
    }
  }

  async addItems(id: number, items: AddItemsRequest): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${id}/items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add items');
    }
  }

  async cancelRequest(id: number, action: ApprovalAction): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${id}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(action),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to cancel request');
    }
  }

  async getRequestHistory(id: number): Promise<PurchaseRequestHistory[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${id}/history`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch request history');
    }

    const data = await response.json();
    return data.data;
  }

  async getPurchaseRequestById(id: number): Promise<PurchaseRequestResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Satın alma talebi yüklenirken bir hata oluştu');
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
        data: null,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateItems(id: number, request: UpdatePurchaseRequestItemsRequest): Promise<PurchaseRequestItemsResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${id}/items`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Satın alma talebi ürünleri güncellenirken bir hata oluştu');
      }

      return {
        success: true,
        data,
        message: 'Satın alma talebi ürünleri başarıyla güncellendi',
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

  async uploadAttachment(requestId: number, file: File): Promise<PurchaseRequestAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${requestId}/attachments`, {
      method: 'POST',
      headers: this.getHeadersMultipart(),
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Belge yüklenirken hata oluştu');
    }
    return response.json();
  }

  /** İndirme için blob URL ve dosya adı döner; sayfa link tıklayıp URL.revokeObjectURL yapabilir */
  async downloadAttachment(requestId: number, attachmentId: number): Promise<{ blobUrl: string; fileName: string }> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/purchase-requests/${requestId}/attachments/${attachmentId}`,
      { headers: this.getHeaders() }
    );
    if (!response.ok) {
      throw new Error('Belge indirilirken hata oluştu');
    }
    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `attachment-${attachmentId}`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (match) fileName = match[1].trim();
    }
    const blobUrl = URL.createObjectURL(blob);
    return { blobUrl, fileName };
  }
}

export const purchaseRequestService = new PurchaseRequestService(); 