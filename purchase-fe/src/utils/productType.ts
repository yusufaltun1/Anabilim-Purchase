import { CategoryProductType } from '../types/category';

const ASSET_PRODUCT_TYPES: CategoryProductType[] = [
  'FIXED_ASSET',
  'SEMI_FIXED_ASSET',
  'IT_HARDWARE',
];

export function normalizeProductType(value?: string | null): string {
  if (!value) return '';
  return String(value).trim().toUpperCase();
}

export function isAssetProductType(value?: string | null): boolean {
  const normalized = normalizeProductType(value);
  return ASSET_PRODUCT_TYPES.includes(normalized as CategoryProductType);
}
