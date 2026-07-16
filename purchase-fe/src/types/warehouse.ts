export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  managerName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseRequest {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  managerName: string;
}

export interface WarehouseStock {
  id: number;
  warehouseId: number;
  warehouse: Warehouse;
  productId: number;
  product: {
    id: number;
    name: string;
    code: string;
    description: string;
    category: string;
    unit: string;
  };
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastMovementDate: string;
  createdAt: string;
  updatedAt: string;
}

// New interfaces for stock listing and detail pages
export interface ProductStock {
  id: number;
  name: string;
  code: string;
  description: string;
  unit: string;
  category: string;
  totalStock: number;
  warehouseCount: number;
  hasLowStock: boolean;
  lastMovementDate: string;
  active: boolean;
}

export interface ProductStockDetail {
  product: {
    id: number;
    name: string;
    code: string;
    description: string;
    unit: string;
    category: string;
  };
  totalStock: number;
  warehouseStocks: WarehouseStockInfo[];
  recentMovements: StockMovementDetail[];
}

export interface WarehouseStockInfo {
  stockId: number;
  warehouse: {
    id: number;
    name: string;
    code: string;
    address: string;
  };
  currentStock: number;
  minStock: number;
  maxStock: number;
  isLowStock: boolean;
  lastMovementDate: string;
}

export interface StockMovementDetail {
  id: number;
  warehouseStock: {
    id: number;
    warehouse: {
      id: number;
      name: string;
      code: string;
    };
    product: {
      id: number;
      name: string;
      code: string;
      unit: string;
    };
    currentStock: number;
    minStock: number;
    maxStock: number;
  };
  quantity: number;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  referenceType:
    | 'PURCHASE_ORDER'
    | 'SALES_ORDER'
    | 'TRANSFER'
    | 'ADJUSTMENT'
    | 'MANUAL'
    | 'ASSIGNMENT'
    | 'ASSIGNMENT_RETURN'
    | 'ASSIGNMENT_CANCEL';
  referenceId: number | null;
  notes: string;
  stockItemId?: number;
  stockItemSerialNumber?: string;
  parentLocationId?: number;
  parentLocationName?: string;
  childLocationId?: number;
  childLocationName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStockListResponse {
  content: ProductStock[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface StockMovement {
  id: number;
  quantity: number;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  referenceType: 'PURCHASE_ORDER' | 'SALES_ORDER' | 'TRANSFER' | 'ADJUSTMENT' | 'MANUAL';
  referenceId: number | null;
  notes: string;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export interface CreateStockMovementRequest {
  quantity: number;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  referenceType: 'PURCHASE_ORDER' | 'SALES_ORDER' | 'TRANSFER' | 'ADJUSTMENT' | 'MANUAL' | 'ASSIGNMENT';
  referenceId?: number;
  notes?: string;
  serialNumber?: string;
  serialNumbers?: string[];
  stockItemId?: number;
  parentLocationId?: number;
  childLocationId?: number;
  imageUrl?: string;
  currentStock?: number;
}

export interface UpdateStockRequest {
  minStock: number;
  maxStock: number;
}

export interface UpdateWarehouseStockRequest {
  minStock: number;
  maxStock: number;
}

export interface WarehouseResponse {
  success: boolean;
  message: string;
  data: Warehouse | Warehouse[] | WarehouseStock | WarehouseStock[] | StockMovement | StockMovement[] | StockItem | StockItem[];
  timestamp: string;
  errorCode?: string;
}

export interface WarehouseStockResponse {
  success: boolean;
  message: string;
  data: WarehouseStock | WarehouseStock[];
  timestamp: string;
}

export interface StockItem {
  id: number | string;
  productId: number;
  productName: string;
  productCode: string;
  serialNumber: string;
  status: 'IN_STOCK' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED' | string;
  warehouseId: number;
  warehouseName: string;
  assignedUserId: number | null;
  assignedUserName: string | null;
  assignedSchoolId: number | null;
  assignedSchoolName: string | null;
  purchasePrice: number;
  purchaseDate: string;
  warrantyExpiryDate: string;
  locationDetails: string;
  imageUrl: string | null;
  additionalImages: string[];
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isUnderWarranty: boolean;
  isAvailable: boolean;
  isAssigned: boolean;
  currentStock?: number; // Gruplandırılmış item'lar için stok miktarı
  assetLabel?: string;
  /** true: stock_items tablosu; false: warehouse_stocks satırı */
  isStockItemRecord?: boolean;
  assetConditionId?: number;
  assetConditionName?: string;
  allowsAssignment?: boolean;
  assignmentId?: number;
  assignmentStatus?: string;
  assignmentDate?: string;
  assignmentNotes?: string;
}

export interface CreateStockItemRequest {
  productId: number;
  serialNumber: string;
  warehouseId: number;
  purchasePrice?: number;
  imageUrl?: string;
  additionalImages?: string[];
  locationDetails?: string;
  notes?: string;
}

export interface StockItemResponse {
  success: boolean;
  message: string;
  data: StockItem[];
  timestamp: string;
}

export interface StockMovementResponse {
  success: boolean;
  message: string;
  data: StockMovement | StockMovement[];
  timestamp: string;
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
} 