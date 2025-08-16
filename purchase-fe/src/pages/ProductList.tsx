import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { productService } from '../services/product.service';
import { Product, PRODUCT_TYPE_LABELS } from '../types/product';

export const ProductList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAllProducts();
      
      if (response.success && response.data) {
        const productsData = Array.isArray(response.data) ? response.data : [response.data];
        console.log('Loaded products:', productsData);
        setProducts(productsData);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message || 'Ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await productService.deleteProduct(id);
      await loadProducts(); // Listeyi yenile
      setError(null);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Ürün silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency?: string) => {
    try {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency || 'TRY'
      }).format(amount);
    } catch (error) {
      // Fallback format if currency formatting fails
      return `${amount.toLocaleString('tr-TR')} ₺`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
            <button
              onClick={() => navigate('/products/create')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Yeni Ürün
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
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

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              Henüz hiç ürün bulunmuyor.
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {products.map((product) => (
                  <li key={product.id}>
                    <div className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {product.name}
                            </p>
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {product.code}
                            </span>
                            {product.productType && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {PRODUCT_TYPE_LABELS[product.productType]?.label || product.productType}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {formatCurrency(product.estimatedUnitPrice || 0)}
                            </p>
                            <button
                              onClick={() => navigate(`/products/${product.id}`)}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              Detay
                            </button>
                            <button
                              onClick={() => navigate(`/products/edit/${product.id}`)}
                              className="text-yellow-600 hover:text-yellow-900 font-medium"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {product.description}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Miktar: {product.minQuantity} - {product.maxQuantity} {product.unitOfMeasure}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 