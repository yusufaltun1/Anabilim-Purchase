import { axiosInstance } from './axios-instance';
import { 
  Warehouse, 
  WarehouseStock, 
  StockMovement, 
  CreateWarehouseRequest, 
  CreateStockMovementRequest,
  UpdateWarehouseStockRequest,
  WarehouseResponse,
  ProductStock,
  ProductStockDetail,
  ProductStockListResponse
} from '../types/warehouse';

class WarehouseService {
  private readonly baseUrl = '/api';

  async getWarehouses(): Promise<Warehouse[]> {
    const response = await axiosInstance.get<Warehouse[]>(`${this.baseUrl}/warehouses`);
    return response.data;
  }

  async getActiveWarehouses(): Promise<Warehouse[]> {
    const response = await axiosInstance.get<Warehouse[]>(`${this.baseUrl}/warehouses/active`);
    return response.data;
  }

  async getWarehouseById(id: number): Promise<Warehouse> {
    const response = await axiosInstance.get<Warehouse>(`${this.baseUrl}/warehouses/${id}`);
    return response.data;
  }

  async createWarehouse(request: CreateWarehouseRequest): Promise<WarehouseResponse> {
    const response = await axiosInstance.post<Warehouse>(`${this.baseUrl}/warehouses`, request);
    return {
      success: true,
      message: 'Depo başarıyla oluşturuldu',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async updateWarehouseStatus(id: number): Promise<WarehouseResponse> {
    const response = await axiosInstance.put<Warehouse>(`${this.baseUrl}/warehouses/${id}/status`);
    return {
      success: true,
      message: 'Depo durumu başarıyla güncellendi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getWarehouseStocks(warehouseId: number): Promise<WarehouseStock[]> {
    const response = await axiosInstance.get<WarehouseStock[]>(`${this.baseUrl}/warehouse-stocks/warehouse/${warehouseId}`);
    return response.data;
  }

  async getProductStocks(productId: number): Promise<WarehouseStock[]> {
    const response = await axiosInstance.get<WarehouseStock[]>(`${this.baseUrl}/warehouse-stocks/product/${productId}`);
    return response.data;
  }

  async getLowStocks(): Promise<WarehouseStock[]> {
    const response = await axiosInstance.get<WarehouseStock[]>(`${this.baseUrl}/warehouse-stocks/low-stock`);
    return response.data;
  }

  async updateWarehouseStock(stockId: number, request: UpdateWarehouseStockRequest): Promise<WarehouseResponse> {
    const response = await axiosInstance.put<WarehouseStock>(`${this.baseUrl}/warehouse-stocks/${stockId}`, request);
    return {
      success: true,
      message: 'Stok bilgileri başarıyla güncellendi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async createStockMovement(warehouseId: number, productId: number, request: CreateStockMovementRequest): Promise<WarehouseResponse> {
    const movementRequest = {
      warehouseId,
      productId,
      ...request
    };
    
    const response = await axiosInstance.post<StockMovement>(`${this.baseUrl}/warehouse-stocks/movements`, movementRequest);
    return {
      success: true,
      message: 'Stok hareketi başarıyla oluşturuldu',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  async getStockMovements(stockId: number, referenceType?: string, referenceId?: number, page = 0, size = 10): Promise<StockMovement[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (referenceType) params.append('referenceType', referenceType);
    if (referenceId) params.append('referenceId', referenceId.toString());

    const response = await axiosInstance.get<StockMovement[]>(`${this.baseUrl}/warehouse-stocks/${stockId}/movements?${params}`);
    return response.data;
  }

  // New methods for stock listing and detail pages
  async getProductStocksList(page = 0, size = 20): Promise<ProductStockListResponse> {
    const response = await axiosInstance.get<ProductStockListResponse>(
      `${this.baseUrl}/warehouse-stocks/products?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getProductStockDetail(productId: number): Promise<ProductStockDetail> {
    const response = await axiosInstance.get<ProductStockDetail>(
      `${this.baseUrl}/warehouse-stocks/product/${productId}/detail`
    );
    return response.data;
  }
}

export const warehouseService = new WarehouseService(); 