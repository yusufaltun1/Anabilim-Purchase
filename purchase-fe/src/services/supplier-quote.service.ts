import { API_CONFIG } from '../config/api.config';
import { SupplierQuote, SupplierQuoteResponse, UpdateSupplierQuoteRequest } from '../types/supplier-quote';

class SupplierQuoteService {
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json'
    };
  }

  async getQuoteByUid(quoteUid: string): Promise<SupplierQuoteResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/supplier-quotes/${quoteUid}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Teklif bilgileri alınamadı',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Teklif bilgileri başarıyla alındı',
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Teklif bilgileri alınamadı',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateQuote(quoteUid: string, request: UpdateSupplierQuoteRequest): Promise<SupplierQuoteResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/supplier-quotes/${quoteUid}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(request)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Teklif güncellenemedi',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Teklif başarıyla güncellendi',
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Teklif güncellenemedi',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const supplierQuoteService = new SupplierQuoteService(); 