import { CreatePurchaseRequestDto, CreatePurchaseRequestResponse, PurchaseRequest } from '../types/purchase.types';
import { API_CONFIG, getAuthHeaders } from './api.config';

class PurchaseService {
  private baseUrl = API_CONFIG.BASE_URL;

  async createPurchaseRequest(
    requestData: CreatePurchaseRequestDto,
    token: string
  ): Promise<CreatePurchaseRequestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/purchase-requests`, {
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

  async getPurchaseRequests(token: string): Promise<PurchaseRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/purchase-requests`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Get purchase requests error:', error);
      throw error;
    }
  }

  async getPurchaseRequestById(id: number, token: string): Promise<PurchaseRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/purchase-requests/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Get purchase request error:', error);
      throw error;
    }
  }

  async getSuppliers(token: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/suppliers`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Get suppliers error:', error);
      throw error;
    }
  }
}

export const purchaseService = new PurchaseService();
