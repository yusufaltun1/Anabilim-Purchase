export type ProductStockSummary = {
  id: number;
  name: string;
  code: string;
  description?: string;
  unit?: string;
  category?: string;
  productType?: string;
  totalStock?: number;
  warehouseCount?: number;
  hasLowStock?: boolean;
  lastMovementDate?: string;
  isActive?: boolean;
};

export type ProductStockDetail = {
  product: {
    id: number;
    name: string;
    code: string;
    description?: string;
    unit?: string;
    category?: string;
  };
  totalStock: number;
  warehouseStocks: Array<{
    stockId: number;
    warehouse: {
      id: number;
      name: string;
      code?: string;
      address?: string;
    };
    currentStock: number;
    minStock?: number;
    maxStock?: number;
    isLowStock?: boolean;
    lastMovementDate?: string;
  }>;
  recentMovements: Array<{
    id: number;
    warehouseStock?: {
      id: number;
      warehouse: {
        id: number;
        name: string;
      };
      product?: {
        id: number;
        name: string;
        code?: string;
        unit?: string;
      };
      currentStock?: number;
    };
    quantity: number;
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
    referenceType?: string;
    referenceId?: number;
    notes?: string;
    createdAt?: string;
  }>;
};

export type ProductSearchResponse = {
  content?: ProductStockSummary[];
  items?: ProductStockSummary[];
};

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  EXPIRED = 'EXPIRED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
  TRANSFERRED = 'TRANSFERRED',
}

export type Assignment = {
  id: number;
  stockItemId?: number;
  serialNumber?: string;
  productId: number;
  productName: string;
  productCode: string;
  assignedUserId?: number;
  assignedUserName?: string;
  assignedLocationId?: number;
  assignedLocationName?: string;
  locationName?: string;
  locationDetails?: string;
  assignmentDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: AssignmentStatus;
  quantity: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  isExpired: boolean;
  isUserAssignment: boolean;
  isLocationAssignment: boolean;
  canBeReturned: boolean;
};
