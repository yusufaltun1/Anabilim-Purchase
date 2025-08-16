import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { productService } from '../services/product.service';
import { Product, PRODUCT_TYPE_LABELS } from '../types/product';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProductById(parseInt(id!));
      
      setProduct(response);
    } catch (err: any) {
      console.error('Error loading product:', err);
      setError(err.message || 'Ürün bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSupplier = async (supplierId: number) => {
    if (!window.confirm('Bu tedarikçiyi üründen kaldırmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setError(null);
      await productService.removeSupplierFromProduct(parseInt(id!), supplierId);
      await loadProductData();
    } catch (err) {
      console.error('Error removing supplier:', err);
      setError('Tedarikçi kaldırılırken hata oluştu');
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500">Ürün bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="mt-2 flex items-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.isActive ? 'Aktif' : 'Pasif'}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  Kod: {product.code}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/products')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Geri
              </button>
              <button
                onClick={() => navigate(`/products/edit/${product.id}`)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Düzenle
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Ürün Detayları</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Açıklama</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kategori</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.category?.name} [{product.category?.code}]
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ürün Tipi</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.productType ? PRODUCT_TYPE_LABELS[product.productType]?.label : 'Belirtilmemiş'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Birim</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.unitOfMeasure}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Minimum Miktar</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.minQuantity}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Maksimum Miktar</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.maxQuantity}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tahmini Birim Fiyat</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.estimatedUnitPrice?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Tedarikçiler</h3>
              <button
                onClick={() => navigate(`/products/${product.id}/suppliers/add`)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Tedarikçi Ekle
              </button>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {product.suppliers && product.suppliers.length > 0 ? (
                  product.suppliers.map((supplier, index) => (
                    <li key={index} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {supplier.name || `Tedarikçi ${index + 1}`}
                        </div>
                        <button
                          onClick={() => handleRemoveSupplier(supplier.id || index)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Kaldır
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 sm:px-6">
                    <p className="text-sm text-gray-500">Henüz tedarikçi eklenmemiş.</p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 