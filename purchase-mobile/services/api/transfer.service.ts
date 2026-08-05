import { API_CONFIG, getAuthHeaders } from './api.config';

export interface AssetTransfer {
  id: number;
  transferCode: string;
  sourceWarehouseId?: number;
  targetWarehouseId?: number;
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
  selfManaged?: boolean;
  receiverUserId?: number | null;
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
  productId?: number;
  product?: {
    id: number;
    name: string;
    code?: string;
    productType?: string;
  };
  requestedQuantity: number;
  transferredQuantity?: number;
  receivedQuantity?: number;
  notes?: string;
  serialNumbers?: string;
  conditionNotes?: string;
  transferImagesBase64?: string[];
  receiveImagesBase64?: string[];
}

export type CreateTransferItemPayload = {
  productId: number;
  requestedQuantity: number;
  serialNumbers?: string;
  conditionNotes?: string;
  transferImagesBase64?: string[] | null;
  notes?: string;
};

export type CreateTransferPayload = {
  sourceWarehouseId: number;
  targetWarehouseId: number;
  transferDate: string;
  notes?: string;
  selfManaged: boolean;
  receiverUserId?: number | null;
  items: CreateTransferItemPayload[];
};

export type TransferListFilters = {
  status?: string;
  startDate?: string;
  endDate?: string;
};

export type PaginatedTransfers = {
  content: AssetTransfer[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

function unwrapTransferList(data: unknown): AssetTransfer[] {
  if (Array.isArray(data)) return data as AssetTransfer[];
  if (data && typeof data === 'object') {
    const obj = data as { data?: unknown; content?: unknown };
    if (Array.isArray(obj.content)) return obj.content as AssetTransfer[];
    if (Array.isArray(obj.data)) return obj.data as AssetTransfer[];
  }
  return [];
}

function unwrapPaginated(data: unknown, page = 0, size = 20): PaginatedTransfers {
  if (Array.isArray(data)) {
    return {
      content: data as AssetTransfer[],
      totalElements: data.length,
      totalPages: 1,
      size,
      number: page,
    };
  }
  if (data && typeof data === 'object') {
    const obj = data as PaginatedTransfers & { data?: unknown };
    if (Array.isArray(obj.content)) {
      return {
        content: obj.content,
        totalElements: obj.totalElements ?? obj.content.length,
        totalPages: obj.totalPages ?? 1,
        size: obj.size ?? size,
        number: obj.number ?? page,
      };
    }
    if (Array.isArray(obj.data)) {
      const list = obj.data as AssetTransfer[];
      return {
        content: list,
        totalElements: list.length,
        totalPages: 1,
        size,
        number: page,
      };
    }
  }
  return { content: [], totalElements: 0, totalPages: 0, size, number: page };
}

function applyClientFilters(list: AssetTransfer[], filters?: TransferListFilters): AssetTransfer[] {
  if (!filters) return list;
  return list.filter((t) => {
    if (filters.status && filters.status !== 'ALL' && t.status !== filters.status) {
      return false;
    }
    if (filters.startDate && t.transferDate) {
      if (new Date(t.transferDate) < new Date(filters.startDate)) return false;
    }
    if (filters.endDate && t.transferDate) {
      if (new Date(t.transferDate) > new Date(filters.endDate)) return false;
    }
    return true;
  });
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

      return unwrapTransferList(await response.json());
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

  async getAllTransfers(token: string, filters?: TransferListFilters): Promise<AssetTransfer[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    params.append('page', '0');
    params.append('size', '100');
    params.append('sort', 'createdAt,desc');

    const qs = params.toString();
    const response = await fetch(`${this.baseUrl}/api/asset-transfers/all?${qs}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Transferler yüklenemedi (${response.status})`);
    }

    const data = await response.json();
    const list = unwrapPaginated(data).content;
    return applyClientFilters(list, filters);
  }

  async searchTransfers(
    query: string,
    token: string,
    page = 0,
    size = 20
  ): Promise<PaginatedTransfers> {
    const params = new URLSearchParams({
      query,
      page: String(page),
      size: String(size),
    });
    const response = await fetch(`${this.baseUrl}/api/asset-transfers/search?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Transfer araması başarısız (${response.status})`);
    }

    return unwrapPaginated(await response.json(), page, size);
  }

  async createTransfer(payload: CreateTransferPayload, token: string): Promise<AssetTransfer> {
    const response = await fetch(`${this.baseUrl}/api/asset-transfers`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { message?: string }).message || `Transfer oluşturulamadı (${response.status})`
      );
    }
    return data as AssetTransfer;
  }

  async updateStatus(
    id: number,
    status: string,
    token: string,
    reason?: string
  ): Promise<AssetTransfer> {
    const params = new URLSearchParams({ status });
    if (reason) params.append('reason', reason);

    const response = await fetch(
      `${this.baseUrl}/api/asset-transfers/${id}/status?${params.toString()}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(token),
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { message?: string }).message || `Durum güncellenemedi (${response.status})`
      );
    }
    return data as AssetTransfer;
  }

  async updateTransferItem(
    transferId: number,
    itemId: number,
    update: { transferredQuantity: number },
    token: string
  ): Promise<AssetTransfer> {
    const params = new URLSearchParams({
      transferredQuantity: String(update.transferredQuantity),
    });
    const response = await fetch(
      `${this.baseUrl}/api/asset-transfers/${transferId}/items/${itemId}?${params.toString()}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(token),
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        (data as { message?: string }).message || `Kalem güncellenemedi (${response.status})`
      );
    }
    return data as AssetTransfer;
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

  async completeTransfer(
    transferId: number,
    receivedByUserId: number,
    token: string
  ): Promise<AssetTransfer> {
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
        throw new Error(
          (errorData as { message?: string }).message || `HTTP hatası! Durum: ${response.status}`
        );
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
        throw new Error(
          (errorData as { message?: string }).message || `HTTP hatası! Durum: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Transfer item resimleri güncellenirken hata:', error);
      throw error;
    }
  }
}

export const transferService = new TransferService();
