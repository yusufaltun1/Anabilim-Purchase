import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { Product, UpdateProductRequest, ProductType, PRODUCT_TYPE_LABELS, getProductTypeFromLabel } from '../types/product';
import { Category } from '../types/category';
import { UnitOfMeasure, UnitOfMeasureLabels, UnitOfMeasureType, getLabelToUnit } from '../types/enums';

export const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<UpdateProductRequest>({
    name: '',
    description: '',
    code: '',
    unitOfMeasure: '',
    productType: ProductType.OTHER,
    categoryId: null,
    minQuantity: 1,
    maxQuantity: 1,
    estimatedUnitPrice: 0,
    currency: 'TRY',
    isActive: true
  });

  // Birim seçeneklerini hazırla
  const unitOptions = Object.entries(UnitOfMeasureLabels).map(([value, label]) => {
    console.log(`Unit option - value: ${value}, label: ${label}`);
    return {
      value,
      label
    };
  });

  useEffect(() => {
    if (id) {
      console.log('Product ID changed, loading data for ID:', id);
      loadCategories();
      loadProductData();
    } else {
      console.error('No product ID provided');
      setError('Ürün ID\'si bulunamadı');
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      const response = await categoryService.getActiveCategories();
      
      if (response.success) {
        const categoriesData = Array.isArray(response.data) ? response.data : [response.data];
        console.log('Loaded categories:', categoriesData);
        setCategories(categoriesData);
      } else {
        console.error('Failed to load categories:', response.message);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading product with ID:', id);
      const product = await productService.getProductById(parseInt(id!));
      console.log('Product API Response:', JSON.stringify(product, null, 2));
      console.log('API unit value:', product.unitOfMeasure);
      console.log('API productType value:', product.productType);
      
      // API'den gelen Adet -> PIECE dönüşümüm
      const unitValue = getLabelToUnit(product.unitOfMeasure);
      console.log('Mapped unit value:', unitValue);
      
      // API'den gelen productType label'ını enum key'ine çevir
      const productTypeKey = typeof product.productType === 'string' 
        ? getProductTypeFromLabel(product.productType)
        : product.productType || ProductType.OTHER;
      console.log('Mapped productType key:', productTypeKey);
      
      const newFormData: UpdateProductRequest = {
        name: product.name || '',
        description: product.description || '',
        code: product.code || '',
        unitOfMeasure: unitValue,
        productType: productTypeKey,
        categoryId: product.category?.id || null,
        minQuantity: product.minQuantity || 1,
        maxQuantity: product.maxQuantity || 1,
        estimatedUnitPrice: product.estimatedUnitPrice || 0,
        currency: 'TRY',
        isActive: product.isActive !== undefined ? product.isActive : true
      };
      
      console.log('Setting form data to:', newFormData);
      setFormData(newFormData);
    } catch (err: any) {
      console.error('Error loading product:', err);
      setError(err.message || 'Ürün bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : ['minQuantity', 'maxQuantity', 'estimatedUnitPrice'].includes(name)
          ? parseFloat(value)
          : name === 'categoryId'
            ? (value ? parseInt(value) : null)
            : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Ürün adı zorunludur');
      return;
    }

    if (!formData.categoryId) {
      setError('Kategori seçimi zorunludur');
      return;
    }

    if (formData.minQuantity && formData.maxQuantity && formData.minQuantity > formData.maxQuantity) {
      setError('Minimum miktar, maksimum miktardan büyük olamaz');
      return;
    }

    if (formData.estimatedUnitPrice && formData.estimatedUnitPrice <= 0) {
      setError('Tahmini birim fiyat 0\'dan büyük olmalıdır');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // API'ye gönderirken formData zaten enum key içeriyor
      const updateData = {
        ...formData
      };

      console.log('Submitting form data:', updateData);
      const response = await productService.updateProduct(parseInt(id!), updateData);
      console.log('Update product response:', response);

      if (response.success) {
        navigate('/products');
      } else {
        setError(response.message || 'Ürün güncellenirken bir hata oluştu');
      }
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.message || 'Ürün güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Form değişikliklerini izle
  useEffect(() => {
    console.log('Current form data:', formData);
  }, [formData]);

  if (loading && !formData.name) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Ürün Düzenle</h1>
            <button
              onClick={() => navigate(`/products/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              Geri
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

          <form onSubmit={handleSubmit} className={`space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 ${loading ? 'opacity-50' : ''}`}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Ürün Kodu
                </label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  required
                  value={formData.code}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
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
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <select
                  name="categoryId"
                  id="categoryId"
                  required
                  value={formData.categoryId || ''}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} [{category.code}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="productType" className="block text-sm font-medium text-gray-700">
                  Ürün Tipi
                </label>
                <select
                  name="productType"
                  id="productType"
                  required
                  value={formData.productType}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {Object.entries(PRODUCT_TYPE_LABELS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label} - {value.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700">
                  Birim
                </label>
                <select
                  name="unitOfMeasure"
                  id="unitOfMeasure"
                  required
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Birim Seçin</option>
                  {unitOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700">
                  Minimum Miktar
                </label>
                <input
                  type="number"
                  name="minQuantity"
                  id="minQuantity"
                  required
                  min="1"
                  value={formData.minQuantity}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="maxQuantity" className="block text-sm font-medium text-gray-700">
                  Maksimum Miktar
                </label>
                <input
                  type="number"
                  name="maxQuantity"
                  id="maxQuantity"
                  required
                  min="1"
                  value={formData.maxQuantity}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="estimatedUnitPrice" className="block text-sm font-medium text-gray-700">
                  Tahmini Birim Fiyat
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="estimatedUnitPrice"
                    id="estimatedUnitPrice"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.estimatedUnitPrice}
                    onChange={handleChange}
                    disabled={loading}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₺</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Para Birimi
                </label>
                <select
                  name="currency"
                  id="currency"
                  required
                  value={formData.currency}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="TRY">Türk Lirası (₺)</option>
                  <option value="USD">Amerikan Doları ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Aktif
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(`/products/${id}`)}
                disabled={loading}
                className={`bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  loading 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Kaydediliyor...
                  </div>
                ) : (
                  'Kaydet'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 