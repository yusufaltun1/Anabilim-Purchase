export type ProductTypeValue = 'CONSUMABLE' | 'SEMI_FIXED_ASSET' | 'FIXED_ASSET';

export type UnitOfMeasureValue = 'PIECE' | 'METER' | 'LITER' | 'KILOGRAM';

export const PRODUCT_TYPE_LABELS: Record<ProductTypeValue, string> = {
  CONSUMABLE: 'Sarf Malzemesi',
  SEMI_FIXED_ASSET: 'Yarı Sabit Kıymet',
  FIXED_ASSET: 'Sabit Kıymet',
};

export const PRODUCT_TYPE_OPTIONS: { value: ProductTypeValue; label: string }[] = [
  { value: 'CONSUMABLE', label: PRODUCT_TYPE_LABELS.CONSUMABLE },
  { value: 'SEMI_FIXED_ASSET', label: PRODUCT_TYPE_LABELS.SEMI_FIXED_ASSET },
  { value: 'FIXED_ASSET', label: PRODUCT_TYPE_LABELS.FIXED_ASSET },
];

export const UNIT_OF_MEASURE_LABELS: Record<UnitOfMeasureValue, string> = {
  PIECE: 'Adet',
  METER: 'Metre',
  LITER: 'Litre',
  KILOGRAM: 'Kilogram',
};

export const UNIT_OF_MEASURE_OPTIONS: { value: UnitOfMeasureValue; label: string }[] = [
  { value: 'PIECE', label: UNIT_OF_MEASURE_LABELS.PIECE },
  { value: 'METER', label: UNIT_OF_MEASURE_LABELS.METER },
  { value: 'LITER', label: UNIT_OF_MEASURE_LABELS.LITER },
  { value: 'KILOGRAM', label: UNIT_OF_MEASURE_LABELS.KILOGRAM },
];

export const CURRENCY_OPTIONS: { value: string; label: string }[] = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

/** Kategori productType → ürün tipi (bilinen değerler) */
export function normalizeProductType(raw?: string | null): ProductTypeValue | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed === 'CONSUMABLE' || trimmed === 'SEMI_FIXED_ASSET' || trimmed === 'FIXED_ASSET') {
    return trimmed;
  }
  // Türkçe etiket / boşluk varyantları
  const upper = trimmed.toUpperCase().replace(/\s+/g, '_');
  if (upper === 'SEMI_FIXED_ASSET' || upper.startsWith('SEMI_FIXED')) return 'SEMI_FIXED_ASSET';
  if (upper === 'FIXED_ASSET' || upper.includes('DEMIRBAS') || upper.includes('DEMİRBAŞ')) {
    return 'FIXED_ASSET';
  }
  if (upper === 'CONSUMABLE' || upper.includes('SARF')) return 'CONSUMABLE';
  return null;
}

export function productTypeLabel(type?: string | null): string {
  if (!type) return '—';
  const normalized = normalizeProductType(type);
  if (normalized) return PRODUCT_TYPE_LABELS[normalized];
  return type;
}

export function unitLabel(unit?: string | null): string {
  if (!unit) return '—';
  const key = unit.toUpperCase() as UnitOfMeasureValue;
  return UNIT_OF_MEASURE_LABELS[key] ?? unit;
}
