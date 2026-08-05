import {
  CATEGORY_PRODUCT_TYPE_OPTIONS,
  type CategoryProductType,
} from '@/services/types/category.types';

export function getCategoryProductTypeLabel(type?: CategoryProductType | string | null): string {
  if (!type) return '—';
  return CATEGORY_PRODUCT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function isFixedAssetCategoryType(type?: CategoryProductType | string | null): boolean {
  return type === 'FIXED_ASSET' || type === 'IT_HARDWARE';
}
