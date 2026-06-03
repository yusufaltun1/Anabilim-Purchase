import type { StockItem } from '../types/warehouse';
import { resolveProductType } from './productType';

export function isConsumableProductType(value?: string | null): boolean {
  const t = resolveProductType(value);
  if (!t) {
    const raw = String(value || '').toLowerCase();
    return raw.includes('sarf') || raw.includes('consumable');
  }
  return t === 'CONSUMABLE' || t === 'OFFICE_SUPPLIES';
}

/** Zimmette gerçek stock_items kaydı kullanılır (demirbaş / donanım) */
export function usesSerialStockItems(value?: string | null): boolean {
  const t = resolveProductType(value);
  return t === 'FIXED_ASSET' || t === 'IT_HARDWARE';
}

/** Miktar + depo ile zimmet (sarf, yarı demirbaş veya depo stok satırı) */
export function usesQuantityBasedAssignment(value?: string | null): boolean {
  return isConsumableProductType(value) || !usesSerialStockItems(value);
}

/** Zimmet listesinde gösterilebilir / seçilebilir stok satırı */
export function isAssignableStockRow(item: StockItem): boolean {
  if (item.isStockItemRecord === false) {
    const qty = item.currentStock ?? 0;
    return qty > 0 && Boolean(item.warehouseId);
  }
  return (
    item.status === 'IN_STOCK' &&
    Boolean(item.warehouseId) &&
    item.allowsAssignment === true
  );
}

export function shouldSendStockItemIdForAssignment(
  productType: string | null | undefined,
  selected: Pick<StockItem, 'isStockItemRecord'> | null | undefined
): boolean {
  return usesSerialStockItems(productType) && selected?.isStockItemRecord === true;
}
