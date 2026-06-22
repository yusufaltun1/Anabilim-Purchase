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
  ProductStockListResponse,
  StockItem,
  StockItemResponse,
  CreateStockItemRequest,
  StockMovementDetail
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
    // Stok hareketi için currentStock değerini hesapla
    let currentStock = 0;
    
    // Eğer request'te currentStock varsa onu kullan, yoksa varsayılan değer
    if (request.currentStock !== undefined) {
      currentStock = request.currentStock;
    } else {
      // Mevcut stok bilgisini almaya çalış
      try {
        const existingStock = await this.getWarehouseStocks(warehouseId);
        const productStock = existingStock.find(stock => stock.productId === productId);
        if (productStock) {
          currentStock = productStock.currentStock;
        }
      } catch (error) {
        console.warn('Mevcut stok bilgisi alınamadı, varsayılan değer 0 kullanılıyor:', error);
        currentStock = 0;
      }
    }

    const movementRequest = {
      warehouseId,
      productId,
      currentStock: currentStock,
      ...request
    };
    
    console.log('Stok hareketi request:', movementRequest);
    
    const response = await axiosInstance.post<StockMovement>(`${this.baseUrl}/warehouse-stocks/movements`, movementRequest);
    return {
      success: true,
      message: 'Stok hareketi başarıyla oluşturuldu',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  // Stok hareketi oluştururken currentStock değerini otomatik hesapla
  async createStockMovementWithAutoStock(warehouseId: number, productId: number, request: CreateStockMovementRequest): Promise<WarehouseResponse> {
    try {
      console.log('createStockMovementWithAutoStock called with:', { warehouseId, productId, request });
      
      // Mevcut stok bilgisini al
      const existingStock = await this.getWarehouseStocks(warehouseId);
      const productStock = existingStock.find(stock => stock.productId === productId);
      
      console.log('Existing stock found:', productStock);
      
      // currentStock değerini hesapla
      let currentStock = 0;
      if (productStock) {
        if (request.movementType === 'IN') {
          currentStock = productStock.currentStock + request.quantity;
        } else if (request.movementType === 'OUT') {
          currentStock = Math.max(0, productStock.currentStock - request.quantity);
        } else {
          currentStock = productStock.currentStock;
        }
        
        console.log('Calculated currentStock:', {
          originalStock: productStock.currentStock,
          movementType: request.movementType,
          quantity: request.quantity,
          newCurrentStock: currentStock
        });
      } else {
        console.log('No existing stock found for product in warehouse');
      }

      const movementRequest = {
        warehouseId,
        productId,
        currentStock: currentStock,
        ...request,
        serialNumbers: request.serialNumbers,
        stockItemId: request.stockItemId,
        serialNumber: request.serialNumber,
      };
      
      console.log('Otomatik stok hesaplamalı hareket request:', movementRequest);
      
      const response = await axiosInstance.post<StockMovement>(`${this.baseUrl}/warehouse-stocks/movements`, movementRequest);
      console.log('Stock movement created successfully:', response.data);
      
      return {
        success: true,
        message: 'Stok hareketi başarıyla oluşturuldu',
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Stok hareketi oluşturulurken hata:', error);
      console.error('Error details:', {
        warehouseId,
        productId,
        request,
        errorMessage: error.message,
        errorResponse: error.response?.data
      });
      throw error;
    }
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

  async updateStock(stockId: number, request: UpdateWarehouseStockRequest): Promise<WarehouseResponse> {
    const response = await axiosInstance.put<WarehouseStock>(`${this.baseUrl}/warehouse-stocks/${stockId}`, request);
    return {
      success: true,
      message: 'Stok bilgileri başarıyla güncellendi',
      data: response.data,
      timestamp: new Date().toISOString()
    };
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

  async getProductStockItems(productId: number): Promise<StockItemResponse> {
    const response = await axiosInstance.get<StockItemResponse>(
      `/api/v1/stock-items/product/${productId}`
    );
    return response.data;
  }

  async getProductStockItemsList(productId: number): Promise<StockItem[]> {
    const response = await axiosInstance.get<{ success?: boolean; data?: StockItem[] } | StockItem[]>(
      `/api/v1/stock-items/product/${productId}`
    );
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body && Array.isArray(body.data)) {
      return body.data;
    }
    if (Array.isArray(body)) {
      return body;
    }
    return [];
  }

  async getStockItemMovements(stockItemId: number): Promise<StockMovementDetail[]> {
    const response = await axiosInstance.get<{ success?: boolean; data?: StockMovementDetail[] }>(
      `/api/v1/stock-items/${stockItemId}/movements`
    );
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body && Array.isArray(body.data)) {
      return body.data;
    }
    return [];
  }

  async createStockItem(request: CreateStockItemRequest): Promise<WarehouseResponse> {
    const response = await axiosInstance.post<StockItem>('/api/v1/stock-items', request);
    return {
      success: true,
      message: 'Stok itemı başarıyla oluşturuldu',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }
}

export const warehouseService = new WarehouseService(); 