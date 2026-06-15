import type { Category } from '../types/category';
import type { UnitOfMeasureType } from '../types/enums';

export const DEFAULT_CATEGORY_STOCK = {
  unitOfMeasure: 'PIECE' as UnitOfMeasureType,
  minQuantity: 1,
  maxQuantity: 100,
  currency: 'TRY',
};

export function resolveCategoryStockSettings(category?: Pick<
  Category,
  'unitOfMeasure' | 'minQuantity' | 'maxQuantity' | 'currency'
> | null) {
  return {
    unitOfMeasure: category?.unitOfMeasure ?? DEFAULT_CATEGORY_STOCK.unitOfMeasure,
    minQuantity: category?.minQuantity ?? DEFAULT_CATEGORY_STOCK.minQuantity,
    maxQuantity: category?.maxQuantity ?? DEFAULT_CATEGORY_STOCK.maxQuantity,
    currency: category?.currency ?? DEFAULT_CATEGORY_STOCK.currency,
  };
}
