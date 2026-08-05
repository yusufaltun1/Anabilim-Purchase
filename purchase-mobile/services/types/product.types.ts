import type { ProductTypeValue, UnitOfMeasureValue } from '@/domain/stockroom/productLabels';
import { normalizeProductType } from '@/domain/stockroom/productLabels';

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
  active?: boolean;
};

export type ProductStockDetail = {
  product: {
    id: number;
    name: string;
    code: string;
    description?: string;
    unit?: string;
    category?: string;
    productType?: string;
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
    movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
    referenceType?: string;
    referenceId?: number;
    notes?: string;
    createdAt?: string;
  }>;
};

export type ProductSearchResponse = {
  content?: ProductStockSummary[];
  items?: ProductStockSummary[];
  last?: boolean;
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  empty?: boolean;
};

export type ProductStockListResponse = {
  content: ProductStockSummary[];
  last?: boolean;
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  empty?: boolean;
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
  assignedSchoolId?: number;
  assignedSchoolName?: string;
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
  canBeCancelled?: boolean;
  hasSignedForm?: boolean;
  hasFormPhoto?: boolean;
  formPhotoUrl?: string;
  hasReturnPhoto?: boolean;
  hasReturnDocument?: boolean;
  returnNotes?: string;
};

export type ProductCategoryRef = {
  id: number;
  name?: string;
  code?: string;
  productType?: string;
};

export type ProductSupplierRef = {
  id: number;
  name?: string;
};

/** Liste / detay ürün entity */
export type Product = {
  id: number;
  name: string;
  code?: string;
  description?: string;
  serialNumber?: string;
  imageUrl?: string;
  unitOfMeasure?: string;
  productType?: string;
  categoryId?: number;
  category?: ProductCategoryRef;
  categories?: ProductCategoryRef[];
  isActive?: boolean;
  active?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  estimatedUnitPrice?: number;
  currency?: string;
  suppliers?: ProductSupplierRef[];
  createdAt?: string;
  updatedAt?: string;
  schoolName?: string;
  defaultParentLocationName?: string;
  defaultChildLocationName?: string;
  warehouseName?: string;
  stockItemStatus?: string;
};

export type CreateProductRequest = {
  name: string;
  code?: string;
  description?: string;
  categoryId: number;
  productType: ProductTypeValue;
  unitOfMeasure: UnitOfMeasureValue | string;
  minQuantity?: number;
  maxQuantity?: number;
  estimatedUnitPrice?: number;
  currency?: string;
  imageUrl?: string;
  serialNumber?: string;
  supplierIds?: number[];
};

export type UpdateProductRequest = {
  name: string;
  code: string;
  description?: string;
  categoryId: number;
  productType: ProductTypeValue;
  unitOfMeasure: UnitOfMeasureValue | string;
  minQuantity?: number;
  maxQuantity?: number;
  estimatedUnitPrice?: number;
  currency?: string;
  imageUrl?: string;
  serialNumber?: string;
  active: boolean;
  supplierIds?: number[];
};

export type ProductFormValues = {
  name: string;
  code: string;
  description: string;
  categoryId: number | null;
  productType: ProductTypeValue;
  unitOfMeasure: UnitOfMeasureValue;
  minQuantity: string;
  maxQuantity: string;
  estimatedUnitPrice: string;
  currency: string;
  imageUrl: string;
  serialNumber: string;
  supplierIds: number[];
  isActive: boolean;
};

export function emptyProductForm(): ProductFormValues {
  return {
    name: '',
    code: '',
    description: '',
    categoryId: null,
    productType: 'CONSUMABLE',
    unitOfMeasure: 'PIECE',
    minQuantity: '',
    maxQuantity: '',
    estimatedUnitPrice: '',
    currency: 'TRY',
    imageUrl: '',
    serialNumber: '',
    supplierIds: [],
    isActive: true,
  };
}

export function mapApiToProduct(api: unknown): Product {
  const raw = (api ?? {}) as Record<string, unknown>;
  const category = raw.category as ProductCategoryRef | undefined;
  const categoryId =
    typeof raw.categoryId === 'number'
      ? raw.categoryId
      : category && typeof category.id === 'number'
        ? category.id
        : undefined;

  return {
    id: Number(raw.id),
    name: String(raw.name ?? ''),
    code: raw.code != null ? String(raw.code) : undefined,
    description: raw.description != null ? String(raw.description) : undefined,
    serialNumber: raw.serialNumber != null ? String(raw.serialNumber) : undefined,
    imageUrl: raw.imageUrl != null ? String(raw.imageUrl) : undefined,
    unitOfMeasure: raw.unitOfMeasure != null ? String(raw.unitOfMeasure) : undefined,
    productType: raw.productType != null ? String(raw.productType) : undefined,
    categoryId,
    category,
    categories: Array.isArray(raw.categories) ? (raw.categories as ProductCategoryRef[]) : undefined,
    isActive: (raw.isActive as boolean | undefined) ?? (raw.active as boolean | undefined) ?? true,
    active: (raw.active as boolean | undefined) ?? (raw.isActive as boolean | undefined) ?? true,
    minQuantity: typeof raw.minQuantity === 'number' ? raw.minQuantity : undefined,
    maxQuantity: typeof raw.maxQuantity === 'number' ? raw.maxQuantity : undefined,
    estimatedUnitPrice:
      typeof raw.estimatedUnitPrice === 'number' ? raw.estimatedUnitPrice : undefined,
    currency: raw.currency != null ? String(raw.currency) : undefined,
    suppliers: Array.isArray(raw.suppliers) ? (raw.suppliers as ProductSupplierRef[]) : undefined,
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : undefined,
    schoolName: raw.schoolName != null ? String(raw.schoolName) : undefined,
    defaultParentLocationName:
      raw.defaultParentLocationName != null ? String(raw.defaultParentLocationName) : undefined,
    defaultChildLocationName:
      raw.defaultChildLocationName != null ? String(raw.defaultChildLocationName) : undefined,
    warehouseName: raw.warehouseName != null ? String(raw.warehouseName) : undefined,
    stockItemStatus: raw.stockItemStatus != null ? String(raw.stockItemStatus) : undefined,
  };
}

export function productToForm(p: Product): ProductFormValues {
  const type = normalizeProductType(p.productType) ?? 'CONSUMABLE';
  const unit = (p.unitOfMeasure?.toUpperCase() || 'PIECE') as UnitOfMeasureValue;
  const validUnit: UnitOfMeasureValue = ['PIECE', 'METER', 'LITER', 'KILOGRAM'].includes(unit)
    ? unit
    : 'PIECE';

  return {
    name: p.name || '',
    code: p.code || '',
    description: p.description || '',
    categoryId: p.categoryId ?? p.category?.id ?? null,
    productType: type,
    unitOfMeasure: validUnit,
    minQuantity: p.minQuantity != null ? String(p.minQuantity) : '',
    maxQuantity: p.maxQuantity != null ? String(p.maxQuantity) : '',
    estimatedUnitPrice: p.estimatedUnitPrice != null ? String(p.estimatedUnitPrice) : '',
    currency: p.currency || 'TRY',
    imageUrl: p.imageUrl || '',
    serialNumber: p.serialNumber || '',
    supplierIds: (p.suppliers ?? []).map((s) => s.id),
    isActive: p.isActive ?? p.active ?? true,
  };
}

export function validateProductForm(
  form: ProductFormValues,
  mode: 'create' | 'edit'
): { ok: true } | { ok: false; message: string } {
  if (!form.name.trim()) return { ok: false, message: 'Ürün adı gereklidir' };
  if (mode === 'edit' && !form.code.trim()) {
    return { ok: false, message: 'Ürün kodu gereklidir' };
  }
  if (!form.categoryId || form.categoryId === 0) {
    return { ok: false, message: 'Kategori seçmelisiniz' };
  }
  if (!form.productType) return { ok: false, message: 'Ürün tipi gereklidir' };
  if (!form.unitOfMeasure) return { ok: false, message: 'Birim seçmelisiniz' };

  if (form.minQuantity) {
    const n = Number(form.minQuantity);
    if (Number.isNaN(n) || n < 0) return { ok: false, message: "Minimum miktar 0'dan küçük olamaz" };
  }
  if (form.maxQuantity) {
    const n = Number(form.maxQuantity);
    if (Number.isNaN(n) || n < 0) return { ok: false, message: "Maksimum miktar 0'dan küçük olamaz" };
  }
  if (form.minQuantity && form.maxQuantity) {
    const min = Number(form.minQuantity);
    const max = Number(form.maxQuantity);
    if (!Number.isNaN(min) && !Number.isNaN(max) && max < min) {
      return { ok: false, message: 'Maksimum miktar minimumdan küçük olamaz' };
    }
  }
  if (form.estimatedUnitPrice) {
    const n = Number(form.estimatedUnitPrice.replace(',', '.'));
    if (Number.isNaN(n) || n < 0) {
      return { ok: false, message: "Tahmini birim fiyat 0'dan küçük olamaz" };
    }
  }
  return { ok: true };
}

export function formToCreateRequest(form: ProductFormValues): CreateProductRequest {
  return {
    name: form.name.trim(),
    code: form.code.trim() || undefined,
    description: form.description.trim() || undefined,
    categoryId: form.categoryId!,
    productType: form.productType,
    unitOfMeasure: form.unitOfMeasure,
    minQuantity: form.minQuantity ? Number(form.minQuantity) : undefined,
    maxQuantity: form.maxQuantity ? Number(form.maxQuantity) : undefined,
    estimatedUnitPrice: form.estimatedUnitPrice
      ? Number(form.estimatedUnitPrice.replace(',', '.'))
      : undefined,
    currency: form.currency || 'TRY',
    imageUrl: form.imageUrl || undefined,
    serialNumber: form.serialNumber.trim() || undefined,
    supplierIds: form.supplierIds.length ? form.supplierIds : undefined,
  };
}

export function formToUpdateRequest(form: ProductFormValues): UpdateProductRequest {
  return {
    name: form.name.trim(),
    code: form.code.trim(),
    description: form.description.trim() || undefined,
    categoryId: form.categoryId!,
    productType: form.productType,
    unitOfMeasure: form.unitOfMeasure,
    minQuantity: form.minQuantity ? Number(form.minQuantity) : undefined,
    maxQuantity: form.maxQuantity ? Number(form.maxQuantity) : undefined,
    estimatedUnitPrice: form.estimatedUnitPrice
      ? Number(form.estimatedUnitPrice.replace(',', '.'))
      : undefined,
    currency: form.currency || 'TRY',
    imageUrl: form.imageUrl || undefined,
    serialNumber: form.serialNumber.trim() || undefined,
    active: form.isActive,
    supplierIds: form.supplierIds,
  };
}

export type StockStatusKind = 'passive' | 'low' | 'normal';

export function resolveStockStatus(stock: {
  isActive?: boolean;
  active?: boolean;
  hasLowStock?: boolean;
}): StockStatusKind {
  const active = stock.isActive ?? stock.active ?? true;
  if (!active) return 'passive';
  if (stock.hasLowStock) return 'low';
  return 'normal';
}
