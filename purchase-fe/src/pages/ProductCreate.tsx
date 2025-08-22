import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { CreateProductRequest, ProductType, PRODUCT_TYPE_LABELS } from '../types/product';
import { Category } from '../types/category';

export const ProductCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    code: '',
    description: '',
    serialNumber: '',
    categoryId: null,
    productType: ProductType.OTHER,
    unitOfMeasure: '',
    minQuantity: 1,
    maxQuantity: 1,
    estimatedUnitPrice: 0,
    currency: 'TRY'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      const response = await categoryService.getActiveCategories();
      console.log('Categories response:', response);
      
      if (response.success && response.data) {
        const categoriesData = Array.isArray(response.data) ? response.data : [response.data];
        setCategories(categoriesData);
      } else {
        console.error('Failed to load categories:', response.message);
        setError('Kategoriler yüklenirken bir hata oluştu');
      }
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError('Kategoriler yüklenirken bir hata oluştu');
    }
  };

  const generateCode = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      code: generateCode(name)
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: ['minQuantity', 'maxQuantity', 'estimatedUnitPrice'].includes(name)
        ? parseFloat(value)
        : name === 'categoryId'
          ? (value ? parseInt(value) : null)
          : value
    }));
      };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Resim dosyası 5MB\'dan küçük olmalıdır');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        setError('Lütfen geçerli bir resim dosyası seçin');
        return;
      }

      // Dosyayı base64'e çevir
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          imageUrl: base64String
        }));
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Ürün adı ve kodu zorunludur');
      return;
    }

    if (formData.code.length < 2 || formData.code.length > 20) {
      setError('Ürün kodu 2-20 karakter arasında olmalıdır');
      return;
    }

    if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      setError('Ürün kodu sadece büyük harf, rakam ve alt çizgi içerebilir');
      return;
    }

    if (!formData.categoryId) {
      setError('Kategori seçimi zorunludur');
      return;
    }

    if (formData.minQuantity > formData.maxQuantity) {
      setError('Minimum miktar, maksimum miktardan büyük olamaz');
      return;
    }

    if (formData.estimatedUnitPrice <= 0) {
      setError('Tahmini birim fiyat 0\'dan büyük olmalıdır');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      console.log('Submitting form data:', formData);
      const response = await productService.createProduct(formData);
      console.log('Create product response:', response);

      if (response.success) {
        setSuccessMessage(response.message);
        setFormData({
          name: '',
          code: '',
                description: '',
      serialNumber: '',
      imageUrl: '',
      categoryId: null,
          productType: ProductType.OTHER,
          unitOfMeasure: '',
          minQuantity: 1,
          maxQuantity: 1,
          estimatedUnitPrice: 0,
          currency: 'TRY'
        });
        
        setTimeout(() => {
          navigate('/products');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.message || 'Ürün oluşturulurken bir hata oluştu');
    } finally {
      if (!successMessage) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Yeni Ürün</h1>
            <button
              onClick={() => navigate('/products')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              Geri
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 animate-fade-in">
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

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Ürünler sayfasına yönlendiriliyorsunuz...
                  </p>
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
                  onChange={handleNameChange}
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
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md uppercase"
                  pattern="[A-Z0-9_]+"
                  title="Sadece büyük harf, rakam ve alt çizgi kullanılabilir"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Sadece büyük harf, rakam ve alt çizgi (_) kullanılabilir
                </p>
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
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
                  Seri Numarası
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Örn: SN123456789"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Ürünün seri numarası (opsiyonel)
                </p>
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Ürün Resmi
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    name="image"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Ürün önizleme"
                      className="h-20 w-20 object-cover rounded-md border border-gray-300"
                    />
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Ürün resmi (opsiyonel, maksimum 5MB)
                </p>
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
                  <option value="PIECE">Adet</option>
                  <option value="KILOGRAM">Kilogram</option>
                  <option value="LITER">Litre</option>
                  <option value="METER">Metre</option>
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
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/products')}
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