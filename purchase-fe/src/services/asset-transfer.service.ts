import axios, { AxiosInstance } from 'axios';
import { authService } from './auth.service';
import {
  AssetTransfer,
  CreateTransferRequest,
  PaginatedTransfers,
  SchoolTransferCount,
  TransferFilters,
  TransferItemUpdate,
  TransferStatistics,
  TransferStatus,
  UpdateTransferRequest
} from '../types/asset-transfer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance with auth token
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AssetTransferService = {
  // Create new transfer
  createTransfer: async (request: CreateTransferRequest): Promise<AssetTransfer> => {
    const response = await axiosInstance.post('/asset-transfers', request);
    return response.data;
  },

  // Update transfer status
  updateStatus: async (transferId: number, status: TransferStatus, reason?: string): Promise<AssetTransfer> => {
    const response = await axiosInstance.put(`/asset-transfers/${transferId}/status`, null, {
      params: { status, reason }
    });
    return response.data;
  },

  // Approve transfer
  approveTransfer: async (transferId: number, approvedByUserId: number): Promise<AssetTransfer> => {
    const response = await axiosInstance.put(`/asset-transfers/${transferId}/approve`, null, {
      params: { approvedByUserId }
    });
    return response.data;
  },

  // Start transfer (set to IN_TRANSIT)
  startTransfer: async (transferId: number, deliveredByUserId: number): Promise<AssetTransfer> => {
    const response = await axiosInstance.put(`/asset-transfers/${transferId}/start`, null, {
      params: { deliveredByUserId }
    });
    return response.data;
  },

  // Complete transfer
  completeTransfer: async (transferId: number, receivedByUserId: number): Promise<AssetTransfer> => {
    const response = await axiosInstance.put(`/asset-transfers/${transferId}/complete`, null, {
      params: { receivedByUserId }
    });
    return response.data;
  },

  // Cancel transfer
  cancelTransfer: async (transferId: number, reason: string): Promise<AssetTransfer> => {
    const response = await axiosInstance.put(`/asset-transfers/${transferId}/cancel`, null, {
      params: { reason }
    });
    return response.data;
  },

  // Delete transfer
  deleteTransfer: async (transferId: number): Promise<void> => {
    await axiosInstance.delete(`/asset-transfers/${transferId}`);
  },

  // Get transfer by ID
  getTransferById: async (transferId: number): Promise<AssetTransfer> => {
    const response = await axiosInstance.get(`/asset-transfers/${transferId}`);
    return response.data;
  },

  // Get transfer by code
  getTransferByCode: async (transferCode: string): Promise<AssetTransfer> => {
    const response = await axiosInstance.get(`/asset-transfers/code/${transferCode}`);
    return response.data;
  },

  // Get all transfers with pagination and filters
  getTransfers: async (filters: TransferFilters): Promise<PaginatedTransfers> => {
    const response = await axiosInstance.get('/asset-transfers/all', { params: filters });
    return response.data;
  },

  // Get transfers by status
  getTransfersByStatus: async (status: TransferStatus, page = 0, size = 10): Promise<PaginatedTransfers> => {
    const response = await axiosInstance.get(`/asset-transfers/status/${status}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get transfers by warehouse
  getTransfersByWarehouse: async (warehouseId: number, page = 0, size = 10): Promise<PaginatedTransfers> => {
    const response = await axiosInstance.get(`/asset-transfers/warehouse/${warehouseId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get transfers by school
  getTransfersBySchool: async (schoolId: number, page = 0, size = 10): Promise<PaginatedTransfers> => {
    const response = await axiosInstance.get(`/asset-transfers/school/${schoolId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Search transfers
  searchTransfers: async (query: string, page = 0, size = 10): Promise<PaginatedTransfers> => {
    const response = await axiosInstance.get('/asset-transfers/search', {
      params: { query, page, size }
    });
    return response.data;
  },

  // Get pending transfers
  getPendingTransfers: async (): Promise<AssetTransfer[]> => {
    const response = await axiosInstance.get('/asset-transfers/pending');
    return response.data;
  },

  // Get overdue transfers
  getOverdueTransfers: async (): Promise<AssetTransfer[]> => {
    const response = await axiosInstance.get('/asset-transfers/overdue');
    return response.data;
  },

  // Update transfer item
  updateTransferItem: async (transferId: number, itemId: number, update: TransferItemUpdate): Promise<AssetTransfer> => {
    const response = await axiosInstance.put(`/asset-transfers/${transferId}/items/${itemId}`, null, {
      params: update
    });
    return response.data;
  },

  // Get transfer count by status
  getTransferCountByStatus: async (status: TransferStatus): Promise<number> => {
    const response = await axiosInstance.get(`/asset-transfers/statistics/count/${status}`);
    return response.data;
  },

  // Get transfer counts by all statuses
  getTransferCountsByStatus: async (): Promise<TransferStatistics[]> => {
    const response = await axiosInstance.get('/asset-transfers/statistics/count-by-status');
    return response.data;
  },

  // Get top schools by transfer count
  getTopSchoolsByTransferCount: async (startDate?: string): Promise<SchoolTransferCount[]> => {
    const response = await axiosInstance.get('/asset-transfers/statistics/top-schools', {
      params: { startDate }
    });
    return response.data;
  }
}; 