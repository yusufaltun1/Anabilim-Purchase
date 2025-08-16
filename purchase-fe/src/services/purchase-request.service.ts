import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import {
  PurchaseRequest,
  PurchaseRequestResponse,
  CreatePurchaseRequest,
  AddItemsRequest,
  ApprovalAction,
  PurchaseRequestHistory,
  CreatePurchaseRequestRequest,
  UpdatePurchaseRequestRequest,
  UpdatePurchaseRequestItemsRequest,
  PurchaseRequestItemsResponse
} from '../types/purchase-request';

class PurchaseRequestService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async createRequest(request: CreatePurchaseRequest): Promise<PurchaseRequestResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create purchase request');
    }

    return await response.json();
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
      timestamp: new Date().toISOString()
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
      timestamp: new Date().toISOString()
    };
  }

  async getMyRequests(): Promise<PurchaseRequestResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/my-requests`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch my purchase requests');
    }

    return await response.json();
  }

  async getPendingApprovals(): Promise<PurchaseRequestResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/pending-approvals`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending approvals');
    }

    return await response.json();
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
}

export const purchaseRequestService = new PurchaseRequestService(); 