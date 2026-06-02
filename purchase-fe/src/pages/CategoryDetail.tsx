import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { CategoryProductListSection } from '../components/product/CategoryProductListSection';
import { categoryService } from '../services/category.service';
import { productService } from '../services/product.service';
import { authService } from '../services/auth.service';
import type { CategoryDetail as CategoryDetailData } from '../types/category';
import { CATEGORY_PRODUCT_TYPE_OPTIONS } from '../types/category';
import { Product } from '../types/product';

const isFixedAssetType = (type?: string) =>
  type === 'FIXED_ASSET' || type === 'IT_HARDWARE';

const productTypeLabel = (type?: string) =>
  CATEGORY_PRODUCT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type ?? '-';

export const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canInventoryManage = authService.hasCapability('INVENTORY_MANAGE');
  const categoryId = id ? parseInt(id, 10) : NaN;

  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CategoryDetailData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = useCallback(async () => {
    if (!categoryId || Number.isNaN(categoryId)) return;
    try {
      setProductsLoading(true);
      const list = await productService.getProductsByCategory(categoryId);
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [categoryId]);

  const loadDetail = useCallback(async () => {
    if (!categoryId || Number.isNaN(categoryId)) return;
    try {
      setLoading(true);
      setError(null);
      const [detailRes] = await Promise.all([
        categoryService.getCategoryDetail(categoryId),
        loadProducts(),
      ]);
      if (detailRes.success && detailRes.data) {
        setDetail(detailRes.data);
      } else {
        setError(detailRes.message ?? 'Detay yüklenemedi');
      }
    } catch {
      setError('Kategori detayı yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [categoryId, loadProducts]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const refreshAll = () => {
    loadDetail();
  };

  if (loading && !detail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-12 px-4 text-center text-gray-500">{error ?? 'Kategori bulunamadı'}</div>
      </div>
    );
  }

  const showWarehouseBreakdown = !isFixedAssetType(detail.productType);
  const lowStock =
    detail.minStockNotifyAt != null && (detail.availableQuantity ?? 0) <= detail.minStockNotifyAt;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{detail.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {detail.code} · {productTypeLabel(detail.productType)}
              </p>
              {lowStock && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  Düşük stok: kalan {detail.availableQuantity}, bildirim eşiği {detail.minStockNotifyAt}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => navigate('/categories')} className="px-4 py-2 border rounded-md text-sm bg-white">
                Geri
              </button>
              <button
                type="button"
                onClick={() => navigate(`/categories/edit/${detail.id}`)}
                className="px-4 py-2 rounded-md text-sm text-white bg-indigo-600"
              >
                Düzenle
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-sm text-gray-500">Ürün sayısı</p>
              <p className="text-2xl font-semibold">{detail.activeProductCount ?? products.length}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-sm text-gray-500">Toplam (stok)</p>
              <p className="text-2xl font-semibold">{detail.totalQuantity ?? 0}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-sm text-gray-500">Atanan</p>
              <p className="text-2xl font-semibold">{detail.assignedQuantity ?? 0}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-sm text-gray-500">Kalan</p>
              <p className={`text-2xl font-semibold ${lowStock ? 'text-red-600' : ''}`}>
                {detail.availableQuantity ?? 0}
              </p>
            </div>
          </div>

          {detail.description && (
            <div className="mb-6 bg-white shadow rounded-lg p-4">
              <p className="text-sm text-gray-500">Açıklama</p>
              <p className="mt-1 text-gray-900">{detail.description}</p>
            </div>
          )}

          <div className="mb-6">
            <CategoryProductListSection
              products={products}
              loading={productsLoading}
              showAssetFilters={isFixedAssetType(detail.productType)}
              onRefresh={refreshAll}
              headerAction={
                canInventoryManage ? (
                  <button
                    type="button"
                    onClick={() => navigate('/products/create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Yeni ürün
                  </button>
                ) : undefined
              }
            />
          </div>

          {showWarehouseBreakdown && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 border-b">
                <h3 className="text-lg font-medium text-gray-900">Depo özeti</h3>
              </div>
              {(detail.warehouseBreakdown?.length ?? 0) === 0 ? (
                <p className="p-6 text-gray-500 text-sm">Depo stok bilgisi yok.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Depo</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Toplam</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Atanan</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Kalan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {detail.warehouseBreakdown?.map((row) => (
                      <tr key={row.warehouseId}>
                        <td className="px-4 py-3 text-sm font-medium">{row.warehouseName}</td>
                        <td className="px-4 py-3 text-sm text-right">{row.totalQuantity}</td>
                        <td className="px-4 py-3 text-sm text-right">{row.assignedQuantity}</td>
                        <td className="px-4 py-3 text-sm text-right">{row.availableQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
