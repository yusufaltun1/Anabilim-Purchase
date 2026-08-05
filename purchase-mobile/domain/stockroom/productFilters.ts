export type ProductFilterable = {
  name?: string;
  code?: string;
  description?: string;
  categoryId?: number | null;
  category?: { id?: number; name?: string } | string | null;
  productType?: string | null;
  isActive?: boolean;
  active?: boolean;
};

export type ProductListFilters = {
  search: string;
  categoryId: number | null;
  productType: string | null;
  /** null = hepsi, true = aktif, false = pasif */
  isActive: boolean | null;
};

export function emptyProductListFilters(): ProductListFilters {
  return {
    search: '',
    categoryId: null,
    productType: null,
    isActive: null,
  };
}

function resolveCategoryId(p: ProductFilterable): number | null {
  if (typeof p.categoryId === 'number') return p.categoryId;
  if (p.category && typeof p.category === 'object' && typeof p.category.id === 'number') {
    return p.category.id;
  }
  return null;
}

function resolveIsActive(p: ProductFilterable): boolean {
  return p.isActive ?? p.active ?? true;
}

export function matchesProductSearch(p: ProductFilterable, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const categoryName =
    typeof p.category === 'string'
      ? p.category
      : p.category && typeof p.category === 'object'
        ? p.category.name ?? ''
        : '';
  const haystack = [p.name, p.code, p.description, categoryName]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export function filterProducts<T extends ProductFilterable>(
  products: T[],
  filters: ProductListFilters
): T[] {
  return products.filter((p) => {
    if (!matchesProductSearch(p, filters.search)) return false;
    if (filters.categoryId != null && resolveCategoryId(p) !== filters.categoryId) return false;
    if (filters.productType && (p.productType ?? '') !== filters.productType) return false;
    if (filters.isActive !== null && resolveIsActive(p) !== filters.isActive) return false;
    return true;
  });
}
