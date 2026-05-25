import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { categoryService } from '../services/category.service';
import {
  CreateCategoryRequest,
  CATEGORY_PRODUCT_TYPE_OPTIONS,
  CategoryProductType,
} from '../types/category';

export const CategoryCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    code: '',
    description: '',
    productType: 'CONSUMABLE',
    minStockNotifyAt: undefined,
    requestable: false,
  });

  const generateCode = (name: string) =>
    name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, name, code: generateCode(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Kategori adı ve kodu zorunludur');
      return;
    }
    if (!formData.productType) {
      setError('Ürün tipi seçilmelidir');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = {
        ...formData,
        minStockNotifyAt:
          formData.minStockNotifyAt !== undefined && formData.minStockNotifyAt !== null
            ? Number(formData.minStockNotifyAt)
            : null,
        requestable: formData.requestable ?? false,
      };
      const response = await categoryService.createCategory(payload);
      if (response.success) {
        setSuccessMessage('Kategori başarıyla oluşturuldu');
        setTimeout(() => navigate('/categories'), 1500);
      } else {
        setError(response.message || 'Kategori oluşturulurken bir hata oluştu');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kategori oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'minStockNotifyAt'
          ? value === ''
            ? undefined
            : parseInt(value, 10)
          : name === 'productType'
            ? (value as CategoryProductType)
            : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Yeni Kategori</h1>
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              Geri
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">{error}</div>
          )}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 text-sm text-green-800">
              {successMessage}
            </div>
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
                  onChange={handleNameChange}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Kategori Kodu *
                </label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  required
                  value={formData.code}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm uppercase"
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
                  placeholder="Örn: 5"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Kalan miktar bu değere düştüğünde günde bir kez mail ve bildirim gönderilir.
                </p>
              </div>
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  name="requestable"
                  id="requestable"
                  checked={formData.requestable ?? false}
                  onChange={(e) => setFormData((prev) => ({ ...prev, requestable: e.target.checked }))}
                  disabled={loading}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="requestable" className="ml-2 text-sm text-gray-900">
                  Talep edilebilir (mail: bilgiislem@anabilim.k12.tr)
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
              <button
                type="button"
                onClick={() => navigate('/categories')}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
