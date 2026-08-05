import { API_CONFIG, getAuthHeaders } from './api.config';
import type { SupplierQuote } from '../types/purchase.types';

export type UpdateSupplierQuoteRequest = {
  unitPrice: number;
  quantity: number;
  currency: string;
  deliveryDate: string;
  validityDate: string;
  notes: string;
  supplierReference: string;
};

export type SupplierQuoteResponse = {
  success: boolean;
  message: string;
  data: SupplierQuote | null;
  timestamp: string;
};

function wrapResponse(ok: boolean, message: string, data: SupplierQuote | null): SupplierQuoteResponse {
  return {
    success: ok,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

class SupplierQuoteService {
  async getQuoteByUid(quoteUid: string, token?: string): Promise<SupplierQuoteResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIER_QUOTES.BY_UID(quoteUid)}`,
        { method: 'GET', headers: getAuthHeaders(token) }
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        return wrapResponse(false, data?.message || 'Teklif bilgileri alınamadı', null);
      }
      return wrapResponse(true, 'Teklif bilgileri başarıyla alındı', (data?.data ?? data) as SupplierQuote);
    } catch (error) {
      return wrapResponse(false, (error as Error).message || 'Teklif bilgileri alınamadı', null);
    }
  }

  async updateQuote(
    quoteUid: string,
    request: UpdateSupplierQuoteRequest,
    token?: string
  ): Promise<SupplierQuoteResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIER_QUOTES.BY_UID(quoteUid)}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(token),
          body: JSON.stringify(request),
        }
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        return wrapResponse(false, data?.message || 'Teklif güncellenemedi', null);
      }
      return wrapResponse(true, 'Teklif başarıyla güncellendi', (data?.data ?? data) as SupplierQuote);
    } catch (error) {
      return wrapResponse(false, (error as Error).message || 'Teklif güncellenemedi', null);
    }
  }

  async setCounterOffer(
    quoteUid: string,
    payload: { quantity: number; unitPrice: number },
    token?: string
  ): Promise<SupplierQuoteResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPPLIER_QUOTES.COUNTER_OFFER(quoteUid)}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(token),
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        return wrapResponse(false, data?.message || 'Karşı teklif kaydedilemedi', null);
      }
      return wrapResponse(true, 'Karşı teklif kaydedildi', (data?.data ?? data) as SupplierQuote);
    } catch (error) {
      return wrapResponse(false, (error as Error).message || 'Karşı teklif kaydedilemedi', null);
    }
  }
}

export const supplierQuoteService = new SupplierQuoteService();
