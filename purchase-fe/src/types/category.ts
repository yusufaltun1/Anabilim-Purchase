export type CategoryProductType =
  | 'CONSUMABLE'
  | 'FIXED_ASSET'
  | 'SEMI_FIXED_ASSET'
  | 'SOFTWARE'
  | 'OTHER'
  | 'OFFICE_SUPPLIES'
  | 'FURNITURE'
  | 'IT_HARDWARE';

export const CATEGORY_PRODUCT_TYPE_OPTIONS: { value: CategoryProductType; label: string }[] = [
  { value: 'CONSUMABLE', label: 'Sarf Malzemesi' },
  { value: 'FIXED_ASSET', label: 'Demirbaş' },
  { value: 'SEMI_FIXED_ASSET', label: 'Yarı Demirbaş' },
  { value: 'SOFTWARE', label: 'Yazılım' },
  { value: 'OTHER', label: 'Diğer' },
  { value: 'OFFICE_SUPPLIES', label: 'Ofis Malzemeleri' },
  { value: 'FURNITURE', label: 'Mobilya' },
  { value: 'IT_HARDWARE', label: 'Donanım' },
];

export interface CategoryWarehouseStock {
  warehouseId: number;
  warehouseName: string;
  totalQuantity: number;
  assignedQuantity: number;
  availableQuantity: number;
}

export interface CategoryStockItem {
  id: number;
  productId: number;
  productName?: string;
  productCode?: string;
  serialNumber?: string;
  status?: string;
  warehouseName?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  code?: string;
  productType?: CategoryProductType;
  minStockNotifyAt?: number | null;
  requestable?: boolean;
  totalQuantity?: number;
  assignedQuantity?: number;
  availableQuantity?: number;
  activeProductCount?: number;
}

export interface CategoryDetail extends Category {
  warehouseBreakdown?: CategoryWarehouseStock[];
  stockItems?: CategoryStockItem[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  code: string;
  productType: CategoryProductType;
  minStockNotifyAt?: number | null;
  requestable?: boolean;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
  productType: CategoryProductType;
  minStockNotifyAt?: number | null;
  requestable?: boolean;
  isActive: boolean;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category | Category[] | null;
  timestamp: string;
}
