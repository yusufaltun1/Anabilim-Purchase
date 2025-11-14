import { CreatePurchaseRequestDto, CreatePurchaseRequestResponse, PurchaseRequest } from '../types/purchase.types';
import { API_CONFIG, getAuthHeaders } from './api.config';

class PurchaseService {
  async createPurchaseRequest(
    requestData: CreatePurchaseRequestDto,
    token: string
  ): Promise<CreatePurchaseRequestResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: CreatePurchaseRequestResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Create purchase request error:', error);
      throw error;
    }
  }

  async getMyRequests(token: string): Promise<PurchaseRequest[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/my-requests`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get my purchase requests error:', error);
      throw error;
    }
  }

  async getRequestById(id: number, token: string): Promise<PurchaseRequest> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get purchase request by id error:', error);
      throw error;
    }
  }

  async getPendingApprovals(token: string): Promise<PurchaseRequest[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/pending-approvals`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get pending approvals error:', error);
      throw error;
    }
  }

  async approveRequest(id: number, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          comment: '',
          rejectionReason: '',
          approved: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Approve request error:', error);
      throw error;
    }
  }

  async rejectRequest(id: number, reason: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/purchase-requests/${id}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          comment: reason,
          rejectionReason: reason,
          approved: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Reject request error:', error);
      throw error;
    }
  }
}

export const purchaseService = new PurchaseService();
