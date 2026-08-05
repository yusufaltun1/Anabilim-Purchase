import { API_CONFIG, getAuthHeaders } from './api.config';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED'
  | string;

export type CreatePurchaseOrderRequest = {
  supplierQuoteId: number;
  quantity: number;
  deliveryWarehouseId: number;
  expectedDeliveryDate: string;
  notes?: string;
};

export type PurchaseOrderProduct = {
  id: number;
  name?: string;
  code?: string;
  description?: string;
  productType?: string;
  category?: { id: number; name?: string } | null;
};

export type PurchaseOrderSupplier = {
  id: number;
  companyName?: string;
  name?: string;
  taxNumber?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type PurchaseOrderQuote = {
  id: number;
  quoteUid?: string;
  currency?: string;
  supplierReference?: string;
  product?: PurchaseOrderProduct | null;
  supplier?: PurchaseOrderSupplier | null;
};

export type PurchaseOrderWarehouse = {
  id: number;
  name?: string;
  code?: string;
  address?: string;
  managerName?: string;
};

export type PurchaseOrder = {
  id: number;
  orderCode?: string;
  status?: PurchaseOrderStatus;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  supplierQuote?: PurchaseOrderQuote | null;
  deliveryWarehouse?: PurchaseOrderWarehouse | null;
};

export type PurchaseOrderResponse = {
  success: boolean;
  message: string;
  data: PurchaseOrder | PurchaseOrder[] | null;
};

function normalizeList(data: unknown): PurchaseOrder[] {
  if (Array.isArray(data)) return data as PurchaseOrder[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as PurchaseOrder[];
    if (Array.isArray(obj.content)) return obj.content as PurchaseOrder[];
    if (obj.id != null) return [obj as unknown as PurchaseOrder];
  }
  return [];
}

class PurchaseOrderService {
  async createOrder(request: CreatePurchaseOrderRequest, token: string): Promise<PurchaseOrderResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS.BASE}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(request),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || `Sipariş oluşturulamadı (${response.status})`);
    }
    if (data?.success !== undefined) return data as PurchaseOrderResponse;
    return { success: true, message: 'Sipariş başarıyla oluşturuldu', data: data as PurchaseOrder };
  }

  async getAllOrders(token: string): Promise<PurchaseOrder[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS.BASE}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error(`Siparişler yüklenemedi (${response.status})`);
    return normalizeList(await response.json());
  }

  async getOrdersByStatus(status: string, token: string): Promise<PurchaseOrder[]> {
    if (!status || status === 'ALL') return this.getAllOrders(token);
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS.BY_STATUS(status)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new Error(`Siparişler yüklenemedi (${response.status})`);
    return normalizeList(await response.json());
  }

  async getOrderById(id: number, token: string): Promise<PurchaseOrder> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS.BY_ID(id)}`,
      { method: 'GET', headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new Error(`Sipariş bulunamadı (${response.status})`);
    const data = await response.json();
    return (data?.data ?? data) as PurchaseOrder;
  }

  async updateOrderStatus(
    id: number,
    payload: { status: string; comment?: string },
    token: string
  ): Promise<PurchaseOrder> {
    const params = new URLSearchParams({ status: payload.status });
    if (payload.comment) params.append('comment', payload.comment);
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS.UPDATE_STATUS(id)}?${params.toString()}`,
      { method: 'PUT', headers: getAuthHeaders(token) }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Durum güncellenemedi (${response.status})`);
    }
    const data = await response.json().catch(() => null);
    return (data?.data ?? data ?? { id, status: payload.status }) as PurchaseOrder;
  }
}

export const purchaseOrderService = new PurchaseOrderService();
