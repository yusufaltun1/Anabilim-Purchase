import { Category, CATEGORY_PRODUCT_TYPE_OPTIONS } from '../types/category';
import { Location } from '../types/location';
import { Product, PRODUCT_TYPE_LABELS, ProductType } from '../types/product';
import { LOCATION_LEVEL_LABELS, resolveProductLocationLevels } from './locationHierarchy';
import { normalizeProductType } from './productType';

export interface ProductListFilters {
  search: string;
  categoryId: number | null;
  productType: string;
  activeStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  minPrice: string;
  maxPrice: string;
  minPurchasePrice: string;
  maxPurchasePrice: string;
  unitOfMeasure: string;
  schoolId: number | null;
  supplierId: number | null;
  deviceModelId: number | null;
  assetConditionId: number | null;
  /** 1. seviye (üst konum) */
  parentLocationId: number | null;
  /** 2. seviye (alt konum) */
  middleLocationId: number | null;
  /** 3. seviye (detay konum) */
  childLocationId: number | null;
  orderNumber: string;
  byod: 'ALL' | 'YES' | 'NO';
  assignmentStatus: 'ALL' | 'CAN_ASSIGN' | 'IN_USE' | 'NOT_ASSIGNABLE';
  stockStatus: 'ALL' | 'IN_STOCK' | 'ASSIGNED' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';
  hasAssetLabel: 'ALL' | 'YES' | 'NO';
  sortBy: 'name' | 'code' | 'price' | 'purchasePrice' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export const defaultProductListFilters = (): ProductListFilters => ({
  search: '',
  categoryId: null,
  productType: 'ALL',
  activeStatus: 'ALL',
  minPrice: '',
  maxPrice: '',
  minPurchasePrice: '',
  maxPurchasePrice: '',
  unitOfMeasure: '',
  schoolId: null,
  supplierId: null,
  deviceModelId: null,
  assetConditionId: null,
  parentLocationId: null,
  middleLocationId: null,
  childLocationId: null,
  orderNumber: '',
  byod: 'ALL',
  assignmentStatus: 'ALL',
  stockStatus: 'ALL',
  hasAssetLabel: 'ALL',
  sortBy: 'name',
  sortOrder: 'asc',
});

export interface FilterLookup {
  categories: Category[];
  schools: { id: number; name: string }[];
  suppliers: { id: number; name: string }[];
  models: { id: number; name: string; brand?: string }[];
  conditions: { id: number; name: string }[];
  parentLocs: { id: number; name: string }[];
  middleLocs: { id: number; name: string }[];
  childLocs: { id: number; name: string }[];
}

function categorySearchFields(category: Category | undefined): string[] {
  if (!category) return [];
  const fields: (string | undefined | null)[] = [
    category.name,
    category.code,
    category.description,
  ];
  if (category.productType) {
    fields.push(category.productType);
    fields.push(
      CATEGORY_PRODUCT_TYPE_OPTIONS.find((o) => o.value === category.productType)?.label
    );
  }
  return fields.filter((f): f is string => !!f && String(f).trim().length > 0);
}

function matchesSearch(p: Product, q: string): boolean {
  const fields: (string | undefined | null)[] = [
    p.name,
    p.code,
    p.description,
    p.serialNumber,
    p.assetLabel,
    p.domainName,
    p.orderNumber,
    p.notes,
    p.schoolName,
    p.deviceModelName,
    p.assetConditionName,
    p.primarySupplierName,
    p.ipAddress,
    p.macAddress,
    p.stockItemStatus,
    ...categorySearchFields(p.category),
    ...(p.categories?.flatMap((c) => categorySearchFields(c)) ?? []),
  ];

  if (p.productType) {
    fields.push(String(p.productType));
    const productTypeLabel = PRODUCT_TYPE_LABELS[p.productType as ProductType]?.label;
    if (productTypeLabel) fields.push(productTypeLabel);
  }

  return fields.some((f) => f && String(f).toLowerCase().includes(q));
}

export function applyProductListFilters(
  products: Product[],
  filters: ProductListFilters,
  chipSearch: string,
  locations: Location[] = []
): Product[] {
  let filtered = [...products];

  const searchQ = filters.search.trim().toLowerCase();
  if (searchQ) {
    filtered = filtered.filter((p) => matchesSearch(p, searchQ));
  }
  const chipQ = chipSearch.trim().toLowerCase();
  if (chipQ) {
    filtered = filtered.filter((p) => matchesSearch(p, chipQ));
  }

  if (filters.categoryId) {
    filtered = filtered.filter((p) => p.category?.id === filters.categoryId);
  }

  if (filters.productType !== 'ALL') {
    const want = normalizeProductType(filters.productType);
    filtered = filtered.filter((p) => normalizeProductType(p.productType) === want);
  }

  if (filters.activeStatus !== 'ALL') {
    filtered = filtered.filter((p) => {
      const isActive = p.active !== undefined ? p.active : p.isActive !== false;
      return filters.activeStatus === 'ACTIVE' ? isActive : !isActive;
    });
  }

  if (filters.schoolId) {
    filtered = filtered.filter((p) => p.schoolId === filters.schoolId);
  }

  if (filters.supplierId) {
    filtered = filtered.filter(
      (p) =>
        p.primarySupplierId === filters.supplierId ||
        p.suppliers?.some((s) => s.id === filters.supplierId)
    );
  }

  if (filters.deviceModelId) {
    filtered = filtered.filter((p) => p.deviceModelId === filters.deviceModelId);
  }

  if (filters.assetConditionId) {
    filtered = filtered.filter((p) => p.assetConditionId === filters.assetConditionId);
  }

  if (filters.parentLocationId || filters.middleLocationId || filters.childLocationId) {
    filtered = filtered.filter((p) => {
      if (locations.length === 0) {
        if (filters.parentLocationId && p.defaultParentLocationId !== filters.parentLocationId) {
          return false;
        }
        if (filters.middleLocationId && p.defaultChildLocationId !== filters.middleLocationId) {
          return false;
        }
        if (filters.childLocationId && p.defaultChildLocationId !== filters.childLocationId) {
          return false;
        }
        return true;
      }

      const levels = resolveProductLocationLevels(
        locations,
        p.defaultParentLocationId ?? null,
        p.defaultChildLocationId ?? null
      );
      if (filters.parentLocationId && levels.rootId !== filters.parentLocationId) {
        return false;
      }
      if (filters.middleLocationId && levels.middleId !== filters.middleLocationId) {
        return false;
      }
      if (filters.childLocationId && levels.leafId !== filters.childLocationId) {
        return false;
      }
      return true;
    });
  }

  if (filters.orderNumber.trim()) {
    const on = filters.orderNumber.trim().toLowerCase();
    filtered = filtered.filter((p) => p.orderNumber?.toLowerCase().includes(on));
  }

  if (filters.byod === 'YES') {
    filtered = filtered.filter((p) => p.byod === true);
  } else if (filters.byod === 'NO') {
    filtered = filtered.filter((p) => !p.byod);
  }

  if (filters.hasAssetLabel === 'YES') {
    filtered = filtered.filter((p) => !!p.assetLabel?.trim());
  } else if (filters.hasAssetLabel === 'NO') {
    filtered = filtered.filter((p) => !p.assetLabel?.trim());
  }

  if (filters.assignmentStatus === 'CAN_ASSIGN') {
    filtered = filtered.filter((p) => p.canAssign === true);
  } else if (filters.assignmentStatus === 'IN_USE') {
    filtered = filtered.filter((p) => p.mustReturnFirst === true);
  } else if (filters.assignmentStatus === 'NOT_ASSIGNABLE') {
    filtered = filtered.filter((p) => p.allowsAssignment === false);
  }

  if (filters.stockStatus !== 'ALL') {
    filtered = filtered.filter((p) => p.stockItemStatus === filters.stockStatus);
  }

  if (filters.minPrice) {
    const min = parseFloat(filters.minPrice);
    if (!Number.isNaN(min)) {
      filtered = filtered.filter((p) => (p.estimatedUnitPrice || 0) >= min);
    }
  }
  if (filters.maxPrice) {
    const max = parseFloat(filters.maxPrice);
    if (!Number.isNaN(max)) {
      filtered = filtered.filter((p) => (p.estimatedUnitPrice || 0) <= max);
    }
  }

  if (filters.minPurchasePrice) {
    const min = parseFloat(filters.minPurchasePrice);
    if (!Number.isNaN(min)) {
      filtered = filtered.filter((p) => (p.purchasePrice || 0) >= min);
    }
  }
  if (filters.maxPurchasePrice) {
    const max = parseFloat(filters.maxPurchasePrice);
    if (!Number.isNaN(max)) {
      filtered = filtered.filter((p) => (p.purchasePrice ?? 0) <= max);
    }
  }

  if (filters.unitOfMeasure) {
    filtered = filtered.filter((p) => p.unitOfMeasure === filters.unitOfMeasure);
  }

  filtered.sort((a, b) => {
    let comparison = 0;
    switch (filters.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'tr');
        break;
      case 'code':
        comparison = a.code.localeCompare(b.code, 'tr');
        break;
      case 'price':
        comparison = (a.estimatedUnitPrice || 0) - (b.estimatedUnitPrice || 0);
        break;
      case 'purchasePrice':
        comparison = (a.purchasePrice || 0) - (b.purchasePrice || 0);
        break;
      case 'createdAt': {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateA - dateB;
        break;
      }
    }
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

export function countActiveProductFilters(filters: ProductListFilters): number {
  let n = 0;
  if (filters.search) n++;
  if (filters.categoryId) n++;
  if (filters.productType !== 'ALL') n++;
  if (filters.activeStatus !== 'ALL') n++;
  if (filters.minPrice || filters.maxPrice) n++;
  if (filters.minPurchasePrice || filters.maxPurchasePrice) n++;
  if (filters.unitOfMeasure) n++;
  if (filters.schoolId) n++;
  if (filters.supplierId) n++;
  if (filters.deviceModelId) n++;
  if (filters.assetConditionId) n++;
  if (filters.parentLocationId) n++;
  if (filters.middleLocationId) n++;
  if (filters.childLocationId) n++;
  if (filters.orderNumber.trim()) n++;
  if (filters.byod !== 'ALL') n++;
  if (filters.assignmentStatus !== 'ALL') n++;
  if (filters.stockStatus !== 'ALL') n++;
  if (filters.hasAssetLabel !== 'ALL') n++;
  return n;
}

export function hasActiveProductFilters(filters: ProductListFilters): boolean {
  return countActiveProductFilters(filters) > 0;
}

export interface FilterChipDef {
  key: string;
  label: string;
}

export function buildProductFilterChips(filters: ProductListFilters, lookup: FilterLookup): FilterChipDef[] {
  const chips: FilterChipDef[] = [];
  if (filters.search) chips.push({ key: 'search', label: `Arama: ${filters.search}` });
  if (filters.categoryId) {
    const cat = lookup.categories.find((c) => c.id === filters.categoryId);
    chips.push({ key: 'categoryId', label: `Kategori: ${cat?.name || filters.categoryId}` });
  }
  if (filters.productType !== 'ALL') {
    const label =
      CATEGORY_PRODUCT_TYPE_OPTIONS.find((o) => o.value === filters.productType)?.label ||
      PRODUCT_TYPE_LABELS[filters.productType as ProductType]?.label ||
      filters.productType;
    chips.push({ key: 'productType', label: `Tip: ${label}` });
  }
  if (filters.activeStatus !== 'ALL') {
    chips.push({ key: 'activeStatus', label: filters.activeStatus === 'ACTIVE' ? 'Aktif' : 'Pasif' });
  }
  if (filters.schoolId) {
    const s = lookup.schools.find((x) => x.id === filters.schoolId);
    chips.push({ key: 'schoolId', label: `Şirket: ${s?.name || filters.schoolId}` });
  }
  if (filters.supplierId) {
    const s = lookup.suppliers.find((x) => x.id === filters.supplierId);
    chips.push({ key: 'supplierId', label: `Tedarikçi: ${s?.name || filters.supplierId}` });
  }
  if (filters.deviceModelId) {
    const m = lookup.models.find((x) => x.id === filters.deviceModelId);
    const modelLabel = m?.brand ? `${m.brand} — ${m.name}` : m?.name;
    chips.push({ key: 'deviceModelId', label: `Model: ${modelLabel || filters.deviceModelId}` });
  }
  if (filters.assetConditionId) {
    const c = lookup.conditions.find((x) => x.id === filters.assetConditionId);
    chips.push({ key: 'assetConditionId', label: `Durum: ${c?.name || filters.assetConditionId}` });
  }
  if (filters.parentLocationId) {
    const l = lookup.parentLocs.find((x) => x.id === filters.parentLocationId);
    chips.push({
      key: 'parentLocationId',
      label: `${LOCATION_LEVEL_LABELS[1]}: ${l?.name || filters.parentLocationId}`,
    });
  }
  if (filters.middleLocationId) {
    const l = lookup.middleLocs.find((x) => x.id === filters.middleLocationId);
    chips.push({
      key: 'middleLocationId',
      label: `${LOCATION_LEVEL_LABELS[2]}: ${l?.name || filters.middleLocationId}`,
    });
  }
  if (filters.childLocationId) {
    const l = lookup.childLocs.find((x) => x.id === filters.childLocationId);
    chips.push({
      key: 'childLocationId',
      label: `${LOCATION_LEVEL_LABELS[3]}: ${l?.name || filters.childLocationId}`,
    });
  }
  if (filters.orderNumber.trim()) {
    chips.push({ key: 'orderNumber', label: `Sipariş no: ${filters.orderNumber}` });
  }
  if (filters.byod === 'YES') chips.push({ key: 'byod', label: 'BYOD: Evet' });
  if (filters.byod === 'NO') chips.push({ key: 'byod', label: 'BYOD: Hayır' });
  if (filters.hasAssetLabel === 'YES') chips.push({ key: 'hasAssetLabel', label: 'Etiketli' });
  if (filters.hasAssetLabel === 'NO') chips.push({ key: 'hasAssetLabel', label: 'Etiketsiz' });
  if (filters.assignmentStatus === 'CAN_ASSIGN') chips.push({ key: 'assignmentStatus', label: 'Zimmetlenebilir' });
  if (filters.assignmentStatus === 'IN_USE') chips.push({ key: 'assignmentStatus', label: 'Kullanımda' });
  if (filters.assignmentStatus === 'NOT_ASSIGNABLE') {
    chips.push({ key: 'assignmentStatus', label: 'Dağıtılamaz' });
  }
  if (filters.stockStatus !== 'ALL') {
    const statusLabels: Record<string, string> = {
      IN_STOCK: 'Stokta',
      ASSIGNED: 'Zimmetli',
      IN_USE: 'Kullanımda',
      MAINTENANCE: 'Bakımda',
      RETIRED: 'Emekli',
    };
    chips.push({ key: 'stockStatus', label: `Stok durumu: ${statusLabels[filters.stockStatus] || filters.stockStatus}` });
  }
  if (filters.minPrice) chips.push({ key: 'minPrice', label: `Min tahmini: ${filters.minPrice} ₺` });
  if (filters.maxPrice) chips.push({ key: 'maxPrice', label: `Max tahmini: ${filters.maxPrice} ₺` });
  if (filters.minPurchasePrice) chips.push({ key: 'minPurchasePrice', label: `Min alış: ${filters.minPurchasePrice} ₺` });
  if (filters.maxPurchasePrice) chips.push({ key: 'maxPurchasePrice', label: `Max alış: ${filters.maxPurchasePrice} ₺` });
  if (filters.unitOfMeasure) chips.push({ key: 'unitOfMeasure', label: `Birim: ${filters.unitOfMeasure}` });
  return chips;
}

export function clearProductFilterKey(
  filters: ProductListFilters,
  key: string
): ProductListFilters {
  const next = { ...filters };
  switch (key) {
    case 'search':
      next.search = '';
      break;
    case 'categoryId':
      next.categoryId = null;
      break;
    case 'productType':
      next.productType = 'ALL';
      break;
    case 'activeStatus':
      next.activeStatus = 'ALL';
      break;
    case 'schoolId':
      next.schoolId = null;
      break;
    case 'supplierId':
      next.supplierId = null;
      break;
    case 'deviceModelId':
      next.deviceModelId = null;
      break;
    case 'assetConditionId':
      next.assetConditionId = null;
      break;
    case 'parentLocationId':
      next.parentLocationId = null;
      next.middleLocationId = null;
      next.childLocationId = null;
      break;
    case 'middleLocationId':
      next.middleLocationId = null;
      next.childLocationId = null;
      break;
    case 'childLocationId':
      next.childLocationId = null;
      break;
    case 'orderNumber':
      next.orderNumber = '';
      break;
    case 'byod':
      next.byod = 'ALL';
      break;
    case 'hasAssetLabel':
      next.hasAssetLabel = 'ALL';
      break;
    case 'assignmentStatus':
      next.assignmentStatus = 'ALL';
      break;
    case 'stockStatus':
      next.stockStatus = 'ALL';
      break;
    case 'minPrice':
      next.minPrice = '';
      break;
    case 'maxPrice':
      next.maxPrice = '';
      break;
    case 'minPurchasePrice':
      next.minPurchasePrice = '';
      break;
    case 'maxPurchasePrice':
      next.maxPurchasePrice = '';
      break;
    case 'unitOfMeasure':
      next.unitOfMeasure = '';
      break;
  }
  return next;
}
