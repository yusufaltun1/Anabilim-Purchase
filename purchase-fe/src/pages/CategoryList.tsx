import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { authService } from '../services/auth.service';
import { categoryService } from '../services/category.service';
import { Category, CATEGORY_PRODUCT_TYPE_OPTIONS } from '../types/category';

const productTypeLabel = (type?: string) =>
  CATEGORY_PRODUCT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type ?? '-';

export const CategoryList = () => {
  const navigate = useNavigate();
  const canInventoryManage = authService.hasCapability('INVENTORY_MANAGE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [showActiveOnly]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      if (showActiveOnly) {
        const response = await categoryService.getActiveCategories();
        if (response.success && response.data) {
          setCategories(Array.isArray(response.data) ? response.data : [response.data]);
        } else {
          setError(response.message ?? 'Yüklenemedi');
        }
      } else {
        setCategories(await categoryService.getAllCategories());
      }
    } catch {
      setError('Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadCategories();
      return;
    }
    try {
      setLoading(true);
      const response = await categoryService.searchCategories(searchTerm);
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      }
    } catch {
      setError('Arama sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    try {
      await categoryService.deleteCategory(id);
      await loadCategories();
    } catch {
      setError('Kategori silinirken hata oluştu');
    }
  };

  const filtered = categories.filter(
    (c) =>
      !searchTerm.trim() ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Kategoriler</h1>
            {canInventoryManage && (
              <button
                type="button"
                onClick={() => navigate('/categories/create')}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Yeni Oluştur
              </button>
            )}
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Kategori ara..."
              className="flex-1 min-w-[200px] px-3 py-2 rounded-md border border-gray-300 sm:text-sm"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              Ara
            </button>
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="mr-2"
              />
              Sadece aktif
            </label>
          </div>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Kategori bulunamadı</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Atanan</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Kalan</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/categories/${category.id}`)}
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.code}</div>
                        <span
                          className={`mt-1 inline-flex px-2 text-xs rounded-full ${
                            category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{productTypeLabel(category.productType)}</td>
                      <td className="px-4 py-4 text-sm text-right">{category.totalQuantity ?? 0}</td>
                      <td className="px-4 py-4 text-sm text-right">{category.assignedQuantity ?? 0}</td>
                      <td className="px-4 py-4 text-sm text-right font-medium">
                        <span
                          className={
                            category.minStockNotifyAt != null &&
                            (category.availableQuantity ?? 0) <= category.minStockNotifyAt
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }
                        >
                          {category.availableQuantity ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        {canInventoryManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/categories/edit/${category.id}`)}
                              className="text-yellow-600 text-sm font-medium"
                            >
                              Düzenle
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 text-sm font-medium"
                            >
                              Sil
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
