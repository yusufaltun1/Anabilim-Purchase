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

export type UnitOfMeasureType =
  | 'PIECE'
  | 'BOX'
  | 'PACKAGE'
  | 'KILOGRAM'
  | 'LITER'
  | 'METER'
  | 'SET'
  | 'PAIR'
  | 'ROLL'
  | 'BOTTLE';

export const UNIT_OF_MEASURE_OPTIONS: { value: UnitOfMeasureType; label: string }[] = [
  { value: 'PIECE', label: 'Adet' },
  { value: 'BOX', label: 'Kutu' },
  { value: 'PACKAGE', label: 'Paket' },
  { value: 'KILOGRAM', label: 'Kilogram' },
  { value: 'LITER', label: 'Litre' },
  { value: 'METER', label: 'Metre' },
  { value: 'SET', label: 'Takım' },
  { value: 'PAIR', label: 'Çift' },
  { value: 'ROLL', label: 'Rulo' },
  { value: 'BOTTLE', label: 'Şişe' },
];

export const CURRENCY_OPTIONS: { value: string; label: string }[] = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

export const DEFAULT_CATEGORY_STOCK = {
  unitOfMeasure: 'PIECE' as UnitOfMeasureType,
  minQuantity: 1,
  maxQuantity: 100,
  currency: 'TRY',
};

export type CategoryWarehouseStock = {
  warehouseId: number;
  warehouseName: string;
  totalQuantity: number;
  assignedQuantity: number;
  availableQuantity: number;
};

export type CategoryStockItem = {
  id: number;
  productId: number;
  productName?: string;
  productCode?: string;
  serialNumber?: string;
  status?: string;
  warehouseName?: string;
};

export type Category = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  code?: string;
  productType?: CategoryProductType;
  minStockNotifyAt?: number | null;
  requestable?: boolean;
  unitOfMeasure?: string;
  minQuantity?: number;
  maxQuantity?: number;
  currency?: string;
  totalQuantity?: number;
  assignedQuantity?: number;
  availableQuantity?: number;
  activeProductCount?: number;
  /** Legacy / unused on stockroom screens */
  parentId?: number;
};

export type CategoryDetail = Category & {
  warehouseBreakdown?: CategoryWarehouseStock[];
  stockItems?: CategoryStockItem[];
};

export type CreateCategoryRequest = {
  name: string;
  description: string;
  code: string;
  productType: CategoryProductType;
  minStockNotifyAt?: number | null;
  requestable?: boolean;
  unitOfMeasure?: string;
  minQuantity?: number;
  maxQuantity?: number;
  currency?: string;
};

export type UpdateCategoryRequest = {
  name: string;
  description: string;
  productType: CategoryProductType;
  minStockNotifyAt?: number | null;
  requestable?: boolean;
  unitOfMeasure?: string;
  minQuantity?: number;
  maxQuantity?: number;
  currency?: string;
  isActive: boolean;
};

export type CategoryFormValues = {
  name: string;
  code: string;
  description: string;
  productType: CategoryProductType;
  minStockNotifyAt: number | null;
  requestable: boolean;
  unitOfMeasure: string;
  minQuantity: number;
  maxQuantity: number;
  currency: string;
  isActive: boolean;
};

export function getUnitOfMeasureLabel(unit?: string | null): string {
  if (!unit) return UNIT_OF_MEASURE_OPTIONS[0].label;
  const found = UNIT_OF_MEASURE_OPTIONS.find((o) => o.value === unit.toUpperCase().trim());
  return found?.label ?? unit;
}

export function emptyCategoryForm(): CategoryFormValues {
  return {
    name: '',
    code: '',
    description: '',
    productType: 'CONSUMABLE',
    minStockNotifyAt: null,
    requestable: false,
    unitOfMeasure: DEFAULT_CATEGORY_STOCK.unitOfMeasure,
    minQuantity: DEFAULT_CATEGORY_STOCK.minQuantity,
    maxQuantity: DEFAULT_CATEGORY_STOCK.maxQuantity,
    currency: DEFAULT_CATEGORY_STOCK.currency,
    isActive: true,
  };
}

export function categoryToForm(category: Category): CategoryFormValues {
  return {
    name: category.name || '',
    code: category.code || '',
    description: category.description || '',
    productType: category.productType || 'CONSUMABLE',
    minStockNotifyAt: category.minStockNotifyAt ?? null,
    requestable: category.requestable ?? false,
    unitOfMeasure: category.unitOfMeasure ?? DEFAULT_CATEGORY_STOCK.unitOfMeasure,
    minQuantity: category.minQuantity ?? DEFAULT_CATEGORY_STOCK.minQuantity,
    maxQuantity: category.maxQuantity ?? DEFAULT_CATEGORY_STOCK.maxQuantity,
    currency: category.currency ?? DEFAULT_CATEGORY_STOCK.currency,
    isActive: category.isActive ?? true,
  };
}

export function generateCategoryCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function validateCategoryForm(
  form: CategoryFormValues,
  mode: 'create' | 'edit'
): { ok: true } | { ok: false; message: string } {
  if (!form.name.trim()) return { ok: false, message: 'Kategori adı zorunludur' };
  if (mode === 'create' && !form.code.trim()) {
    return { ok: false, message: 'Kategori kodu zorunludur' };
  }
  if (!form.productType) return { ok: false, message: 'Ürün tipi seçilmelidir' };
  if (form.minQuantity < 0 || form.maxQuantity < 0) {
    return { ok: false, message: 'Miktar değerleri negatif olamaz' };
  }
  if (form.maxQuantity < form.minQuantity) {
    return { ok: false, message: 'Max. miktar min. miktardan küçük olamaz' };
  }
  return { ok: true };
}

export function mapApiCategory(apiCategory: Record<string, unknown>): Category {
  return {
    id: apiCategory.id as number,
    name: apiCategory.name as string,
    code: (apiCategory.code as string) || undefined,
    description: (apiCategory.description as string) || '',
    isActive: (apiCategory.active ?? apiCategory.isActive ?? true) as boolean,
    productType: apiCategory.productType as CategoryProductType | undefined,
    minStockNotifyAt: (apiCategory.minStockNotifyAt as number | null) ?? null,
    requestable: (apiCategory.requestable as boolean | undefined) ?? false,
    unitOfMeasure: (apiCategory.unitOfMeasure as string | undefined) ?? 'PIECE',
    minQuantity: (apiCategory.minQuantity as number | undefined) ?? 1,
    maxQuantity: (apiCategory.maxQuantity as number | undefined) ?? 100,
    currency: (apiCategory.currency as string | undefined) ?? 'TRY',
    totalQuantity: (apiCategory.totalQuantity as number) ?? 0,
    assignedQuantity: (apiCategory.assignedQuantity as number) ?? 0,
    availableQuantity: (apiCategory.availableQuantity as number) ?? 0,
    activeProductCount: (apiCategory.activeProductCount as number) ?? 0,
    parentId: apiCategory.parentId as number | undefined,
  };
}

export function mapApiCategoryDetail(data: Record<string, unknown>): CategoryDetail {
  const base = mapApiCategory(data);
  return {
    ...base,
    activeProductCount: (data.activeProductCount as number) ?? base.activeProductCount ?? 0,
    warehouseBreakdown: (data.warehouseBreakdown as CategoryDetail['warehouseBreakdown']) ?? [],
    stockItems: (data.stockItems as CategoryDetail['stockItems']) ?? [],
  };
}
