import { CATEGORY_PRODUCT_TYPE_OPTIONS, CategoryProductType } from '../types/category';

const ASSET_PRODUCT_TYPES: CategoryProductType[] = [
  'FIXED_ASSET',
  'SEMI_FIXED_ASSET',
  'IT_HARDWARE',
];

export function normalizeProductType(value?: string | null): string {
  if (!value) return '';
  return String(value).trim().toUpperCase();
}

/** Enum kodu veya Türkçe etiketten standart ürün tipi kodu üretir */
export function resolveProductType(value?: string | null): CategoryProductType | '' {
  if (!value) return '';
  const trimmed = String(value).trim();
  const upper = normalizeProductType(trimmed);
  const byCode = CATEGORY_PRODUCT_TYPE_OPTIONS.find((o) => o.value === upper);
  if (byCode) return byCode.value;
  const byLabel = CATEGORY_PRODUCT_TYPE_OPTIONS.find(
    (o) => o.label === trimmed || o.label.toLowerCase() === trimmed.toLowerCase()
  );
  if (byLabel) return byLabel.value;
  return upper as CategoryProductType;
}

export function isAssetProductType(value?: string | null): boolean {
  const resolved = resolveProductType(value);
  return ASSET_PRODUCT_TYPES.includes(resolved as CategoryProductType);
}
