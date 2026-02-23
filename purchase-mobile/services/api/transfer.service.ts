import { API_CONFIG, getAuthHeaders } from './api.config';

export interface AssetTransfer {
  id: number;
  transferCode: string;
  sourceWarehouse?: {
    id: number;
    name: string;
    code?: string;
    address?: string;
  };
  targetWarehouse?: {
    id: number;
    name: string;
    code?: string;
    address?: string;
  };
  targetSchool?: {
    id: number;
    name: string;
    code?: string;
    city?: string;
    district?: string;
  };
  status: string;
  statusDisplayName?: string;
  transferDate?: string;
  actualTransferDate?: string;
  notes?: string;
  requestedBy?: {
    id: number;
    fullName: string;
    email?: string;
    department?: string;
    position?: string;
  };
  approvedBy?: {
    id: number;
    fullName: string;
    email?: string;
    department?: string;
    position?: string;
  };
  deliveredBy?: {
    id: number;
    fullName: string;
    email?: string;
    department?: string;
    position?: string;
  };
  receivedBy?: {
    id: number;
    fullName: string;
    email?: string;
    department?: string;
    position?: string;
  };
  items?: AssetTransferItem[];
  totalItemCount?: number;
  totalRequestedQuantity?: number;
  totalTransferredQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetTransferItem {
  id: number;
  product?: {
    id: number;
    name: string;
    code?: string;
  };
  requestedQuantity: number;
  transferredQuantity?: number;
  receivedQuantity?: number;
  notes?: string;
  transferImagesBase64?: string[];
  receiveImagesBase64?: string[];
}

class TransferService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getAssignedTransfers(userId: number, token: string): Promise<AssetTransfer[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/asset-transfers/assigned/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Atanmış transferler yüklenirken hata:', error);
      throw error;
    }
  }

  async getAssignedTransferCount(userId: number, token: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/asset-transfers/assigned/${userId}/count`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }

      const data = await response.json();
      return typeof data === 'number' ? data : 0;
    } catch (error) {
      console.error('Atanmış transfer sayısı yüklenirken hata:', error);
      return 0;
    }
  }

  async getTransferById(transferId: number, token: string): Promise<AssetTransfer> {
    try {
      const response = await fetch(`${this.baseUrl}/api/asset-transfers/${transferId}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Transfer detayı yüklenirken hata:', error);
      throw error;
    }
  }

  async completeTransfer(transferId: number, receivedByUserId: number, token: string): Promise<AssetTransfer> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/asset-transfers/${transferId}/complete?receivedByUserId=${receivedByUserId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP hatası! Durum: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Transfer tamamlanırken hata:', error);
      throw error;
    }
  }

  async updateTransferItemImages(
    transferId: number,
    itemId: number,
    receiveImagesBase64: string[],
    token: string
  ): Promise<AssetTransfer> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/asset-transfers/${transferId}/items/${itemId}/images`,
        {
          method: 'PUT',
          headers: getAuthHeaders(token),
          body: JSON.stringify({
            receiveImagesBase64,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP hatası! Durum: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Transfer item resimleri güncellenirken hata:', error);
      throw error;
    }
  }
}

export const transferService = new TransferService();
