export enum TransferStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PREPARING = 'PREPARING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED'
}

export interface TransferItem {
  id?: number;
  productId: number;
  requestedQuantity: number;
  transferredQuantity?: number;
  notes?: string;
  serialNumbers?: string;
  conditionNotes?: string;
}

export interface AssetTransfer {
  id?: number;
  transferCode?: string;
  sourceWarehouseId: number;
  targetSchoolId: number;
  transferDate: string;
  notes?: string;
  status: TransferStatus;
  items: TransferItem[];
  requestedByUserId?: number;
  approvedByUserId?: number;
  deliveredByUserId?: number;
  receivedByUserId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransferRequest {
  sourceWarehouseId: number;
  targetSchoolId: number;
  transferDate: string;
  notes?: string;
  items: Omit<TransferItem, 'id'>[];
}

export interface UpdateTransferRequest {
  notes?: string;
  transferDate?: string;
  items?: TransferItem[];
}

export interface TransferStatusUpdate {
  status: TransferStatus;
  reason?: string;
}

export interface TransferItemUpdate {
  transferredQuantity: number;
}

export interface TransferFilters {
  status?: TransferStatus;
  warehouseId?: number;
  schoolId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface TransferStatistics {
  status: TransferStatus;
  count: number;
}

export interface SchoolTransferCount {
  schoolId: number;
  schoolName: string;
  transferCount: number;
}

export interface PaginatedTransfers {
  content: AssetTransfer[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
} 