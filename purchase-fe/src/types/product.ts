import { Category } from './category';

export enum ProductType {
  CONSUMABLE = 'CONSUMABLE',
  FIXED_ASSET = 'FIXED_ASSET',
  SEMI_FIXED_ASSET  = 'SEMI_FIXED_ASSET '
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, { label: string; description: string }> = {
  [ProductType.CONSUMABLE]: { label: 'Sarf Malzemesi', description: 'Tüketilen malzemeler' },
  [ProductType.FIXED_ASSET]: { label: 'Demirbaş', description: 'Sabit kıymet olarak kayıtlanan malzemeler' },
  [ProductType.SEMI_FIXED_ASSET ]: { label: 'Yarı Sabit Kıymet', description: 'Yarı sabit kıymet olarak kayıtlanan malzemeler' },
  
};

// Helper function to map Turkish labels back to enum keys
export const getProductTypeFromLabel = (label: string): ProductType => {
  const entry = Object.entries(PRODUCT_TYPE_LABELS).find(([key, value]) => value.label === label);
  return entry ? (entry[0] as ProductType) : ProductType.CONSUMABLE;
};

export interface Product {
  id: number;
  name: string;
  description: string;
  code: string;
  serialNumber?: string;
  imageUrl?: string;
  unitOfMeasure: string;
  productType?: ProductType | string; // Backend'den string (Türkçe label) veya enum değeri gelebilir
  category?: Category;
  categories?: Category[];
  isActive?: boolean;
  active?: boolean; // Backend'den gelen alan
  createdAt?: string;
  updatedAt?: string;
  estimatedUnitPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  suppliers?: any[];
  imageUrls?: string[];
  assetLabel?: string;
  domainName?: string;
  deviceModelId?: number;
  deviceModelName?: string;
  assetConditionId?: number;
  assetConditionName?: string;
  allowsAssignment?: boolean;
  purchaseRequestId?: number;
  purchaseRequestTitle?: string;
  notes?: string;
  schoolId?: number;
  schoolName?: string;
  orderNumber?: string;
  byod?: boolean;
  warrantyMonths?: number;
  lifespanEndDate?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  primarySupplierId?: number;
  primarySupplierName?: string;
  defaultParentLocationId?: number;
  defaultChildLocationId?: number;
  stockItemStatus?: string;
  stockItemId?: number;
  currentStock?: number;
  canAssign?: boolean;
  mustReturnFirst?: boolean;
  assignBlockers?: string[];
  ipAddress?: string;
  macAddress?: string;
  warrantyExpiryDate?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  code: string;
  serialNumber?: string;
  imageUrl?: string;
  imageUrls?: string[];
  unitOfMeasure: string;
  productType: ProductType;
  categoryId: number | null;
  minQuantity: number;
  maxQuantity: number;
  estimatedUnitPrice: number;
  currency: string;
  assetLabel?: string;
  domainName?: string;
  deviceModelId?: number | null;
  assetConditionId?: number | null;
  defaultParentLocationId?: number | null;
  defaultChildLocationId?: number | null;
  warrantyExpiryDate?: string;
  warrantyMonths?: number | null;
  lifespanEndDate?: string;
  purchaseDate?: string;
  purchasePrice?: number | null;
  orderNumber?: string;
  byod?: boolean;
  schoolId?: number | null;
  warehouseId?: number | null;
  notes?: string;
  supplierIds?: number[];
  ipAddress?: string;
  macAddress?: string;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  code: string;
  serialNumber?: string;
  imageUrl?: string;
  unitOfMeasure: string;
  productType: ProductType;
  categoryId: number | null;
  minQuantity?: number;
  maxQuantity?: number;
  estimatedUnitPrice?: number;
  currency?: string;
  active: boolean;
  imageUrls?: string[];
  assetLabel?: string;
  domainName?: string;
  deviceModelId?: number | null;
  assetConditionId?: number | null;
  defaultParentLocationId?: number | null;
  defaultChildLocationId?: number | null;
  warrantyExpiryDate?: string;
  warrantyMonths?: number | null;
  lifespanEndDate?: string;
  purchaseDate?: string;
  purchasePrice?: number | null;
  orderNumber?: string;
  byod?: boolean;
  schoolId?: number | null;
  warehouseId?: number | null;
  notes?: string;
  supplierIds?: number[];
  ipAddress?: string;
  macAddress?: string;
  serialnumber?: string;
}

export interface ProductProcurementSummary {
  purchaseRequests: RelatedPurchaseRequestRow[];
  purchaseOrders: RelatedPurchaseOrderRow[];
}

export interface RelatedPurchaseRequestRow {
  requestId: number;
  title: string;
  status: string;
  requestItemId: number;
  quantity?: number;
  requestCreatedAt?: string;
}

export interface RelatedPurchaseOrderRow {
  orderId: number;
  orderCode: string;
  status: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  currency?: string;
  createdAt?: string;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product | Product[] | null;
  timestamp: string;
  fieldErrors?: Record<string, string>;
} 