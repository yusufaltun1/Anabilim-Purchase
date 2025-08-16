import { axiosInstance } from './axios-instance';
import { 
  CreatePurchaseOrderRequest, 
  PurchaseOrder, 
  PurchaseOrderResponse, 
  PurchaseOrderStatus, 
  UpdatePurchaseOrderStatusRequest 
} from '../types/purchase-order';

class PurchaseOrderService {
  private readonly baseUrl = '/api/v1/purchase-orders';

  async createOrder(request: CreatePurchaseOrderRequest): Promise<PurchaseOrderResponse> {
    const response = await axiosInstance.post<PurchaseOrder>(this.baseUrl, request);
    return {
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getOrderById(id: number): Promise<PurchaseOrderResponse> {
    const response = await axiosInstance.get<PurchaseOrder>(`${this.baseUrl}/${id}`);
    return {
      success: true,
      message: 'Sipariş başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getOrderByCode(orderCode: string): Promise<PurchaseOrderResponse> {
    const response = await axiosInstance.get<PurchaseOrder>(`${this.baseUrl}/code/${orderCode}`);
    return {
      success: true,
      message: 'Sipariş başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getAllOrders(): Promise<PurchaseOrderResponse> {
    const response = await axiosInstance.get<PurchaseOrder[]>(this.baseUrl);
    return {
      success: true,
      message: 'Siparişler başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getOrdersByStatus(status: PurchaseOrderStatus): Promise<PurchaseOrderResponse> {
    const response = await axiosInstance.get<PurchaseOrder[]>(`${this.baseUrl}/status/${status}`);
    return {
      success: true,
      message: 'Siparişler başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getOrdersByWarehouse(warehouseId: number): Promise<PurchaseOrderResponse> {
    const response = await axiosInstance.get<PurchaseOrder[]>(`${this.baseUrl}/warehouse/${warehouseId}`);
    return {
      success: true,
      message: 'Siparişler başarıyla getirildi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async updateOrderStatus(id: number, request: UpdatePurchaseOrderStatusRequest): Promise<PurchaseOrderResponse> {
    const response = await axiosInstance.put<PurchaseOrder>(
      `${this.baseUrl}/${id}/status`,
      null,
      { params: { status: request.status, comment: request.comment } }
    );
    return {
      success: true,
      message: 'Sipariş durumu başarıyla güncellendi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async deleteOrder(id: number): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }
}

export const purchaseOrderService = new PurchaseOrderService(); 