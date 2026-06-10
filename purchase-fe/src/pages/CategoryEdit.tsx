import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { categoryService } from '../services/category.service';
import {
  UpdateCategoryRequest,
  CATEGORY_PRODUCT_TYPE_OPTIONS,
  CategoryProductType,
} from '../types/category';
import { UnitOfMeasureLabels } from '../types/enums';
import { DEFAULT_CATEGORY_STOCK } from '../utils/categoryStockDefaults';

export const CategoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateCategoryRequest>({
    name: '',
    description: '',
    productType: 'CONSUMABLE',
    minStockNotifyAt: undefined,
    isActive: true,
    requestable: false,
    unitOfMeasure: DEFAULT_CATEGORY_STOCK.unitOfMeasure,
    minQuantity: DEFAULT_CATEGORY_STOCK.minQuantity,
    maxQuantity: DEFAULT_CATEGORY_STOCK.maxQuantity,
    currency: DEFAULT_CATEGORY_STOCK.currency,
  });

  useEffect(() => {
    loadCategoryData();
  }, [id]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategoryById(parseInt(id!, 10));
      if (response.success && response.data && !Array.isArray(response.data)) {
        const category = response.data;
        setFormData({
          name: category.name,
          description: category.description,
          productType: category.productType || 'CONSUMABLE',
          minStockNotifyAt: category.minStockNotifyAt ?? undefined,
          requestable: category.requestable ?? false,
          unitOfMeasure: category.unitOfMeasure ?? DEFAULT_CATEGORY_STOCK.unitOfMeasure,
          minQuantity: category.minQuantity ?? DEFAULT_CATEGORY_STOCK.minQuantity,
          maxQuantity: category.maxQuantity ?? DEFAULT_CATEGORY_STOCK.maxQuantity,
          currency: category.currency ?? DEFAULT_CATEGORY_STOCK.currency,
          isActive: category.isActive,
        });
      } else {
        setError(response.message);
      }
    } catch {
      setError('Kategori bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Kategori adı zorunludur');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.updateCategory(parseInt(id!, 10), {
        ...formData,
        minStockNotifyAt:
          formData.minStockNotifyAt !== undefined && formData.minStockNotifyAt !== null
            ? Number(formData.minStockNotifyAt)
            : null,
        requestable: formData.requestable ?? false,
        unitOfMeasure: formData.unitOfMeasure ?? DEFAULT_CATEGORY_STOCK.unitOfMeasure,
        minQuantity: formData.minQuantity ?? DEFAULT_CATEGORY_STOCK.minQuantity,
        maxQuantity: formData.maxQuantity ?? DEFAULT_CATEGORY_STOCK.maxQuantity,
        currency: formData.currency ?? DEFAULT_CATEGORY_STOCK.currency,
      });
      if (response.success) {
        setSuccessMessage('Kategori başarıyla güncellendi');
        setTimeout(() => navigate(`/categories/${id}`), 1500);
      } else {
        setError(response.message || 'Kategori güncellenirken bir hata oluştu');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kategori güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'minStockNotifyAt' || name === 'minQuantity' || name === 'maxQuantity'
            ? value === ''
              ? undefined
              : parseInt(value, 10)
            : name === 'productType'
              ? (value as CategoryProductType)
              : value,
    }));
  };

  if (loading && !formData.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Kategori Düzenle</h1>
            <button
              type="button"
              onClick={() => navigate(`/categories/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white"
            >
              Geri
            </button>
          </div>

          {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">{error}</div>}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-800">{successMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="productType" className="block text-sm font-medium text-gray-700">
                  Ürün Tipi *
                </label>
                <select
                  name="productType"
                  id="productType"
                  required
                  value={formData.productType}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                >
                  {CATEGORY_PRODUCT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700">
                  Ölçü birimi *
                </label>
                <select
                  name="unitOfMeasure"
                  id="unitOfMeasure"
                  required
                  value={formData.unitOfMeasure ?? DEFAULT_CATEGORY_STOCK.unitOfMeasure}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                >
                  {Object.entries(UnitOfMeasureLabels).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700">
                  Min. miktar *
                </label>
                <input
                  type="number"
                  name="minQuantity"
                  id="minQuantity"
                  min={0}
                  required
                  value={formData.minQuantity ?? ''}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="maxQuantity" className="block text-sm font-medium text-gray-700">
                  Max. miktar *
                </label>
                <input
                  type="number"
                  name="maxQuantity"
                  id="maxQuantity"
                  min={0}
                  required
                  value={formData.maxQuantity ?? ''}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Para birimi *
                </label>
                <select
                  name="currency"
                  id="currency"
                  required
                  value={formData.currency ?? DEFAULT_CATEGORY_STOCK.currency}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                >
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label htmlFor="minStockNotifyAt" className="block text-sm font-medium text-gray-700">
                  Bildirim eşiği (kalan adet)
                </label>
                <input
                  type="number"
                  name="minStockNotifyAt"
                  id="minStockNotifyAt"
                  min={0}
                  value={formData.minStockNotifyAt ?? ''}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requestable"
                  checked={formData.requestable ?? false}
                  onChange={(e) => setFormData((prev) => ({ ...prev, requestable: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-900">
                  Talep edilebilir (mail: bilgiislem@anabilim.k12.tr)
                </label>
              </div>
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-900">
                  Aktif
                </label>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => navigate(`/categories/${id}`)} className="px-4 py-2 border rounded-md text-sm">
                İptal
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-sm text-white bg-indigo-600">
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
