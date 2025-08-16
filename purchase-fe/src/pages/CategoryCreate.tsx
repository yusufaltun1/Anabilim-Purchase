import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { categoryService } from '../services/category.service';
import { Category, CreateCategoryRequest } from '../types/category';

export const CategoryCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    code: '',
    description: '',
    parentId: null
  });

  useEffect(() => {
    loadParentCategories();
  }, []);

  const loadParentCategories = async () => {
    try {
      console.log('Loading parent categories...');
      const response = await categoryService.getActiveCategories();
      if (response.success) {
        const categories = Array.isArray(response.data) ? response.data : [response.data];
        console.log('Loaded parent categories:', categories);
        setParentCategories(categories);
      } else {
        console.error('Failed to load parent categories:', response.message);
      }
    } catch (err) {
      console.error('Error loading parent categories:', err);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Kategori adı ve kodu zorunludur');
      return;
    }

    if (formData.code.length < 2 || formData.code.length > 20) {
      setError('Kategori kodu 2-20 karakter arasında olmalıdır');
      return;
    }

    if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      setError('Kategori kodu sadece büyük harf, rakam ve alt çizgi içerebilir');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      console.log('Submitting form data:', formData);
      const response = await categoryService.createCategory(formData);
      console.log('Create category response:', response);

      if (response.success) {
        setSuccessMessage('Kategori başarıyla oluşturuldu');
        setFormData({
          name: '',
          code: '',
          description: '',
          parentId: null
        });
        setLoading(true);
        setTimeout(() => {
          navigate('/categories');
        }, 2000);
      } else {
        setError(response.message || 'Kategori oluşturulurken bir hata oluştu');
      }
    } catch (err: any) {
      console.error('Error in form submission:', err);
      setError(err.message || 'Kategori oluşturulurken bir hata oluştu');
    } finally {
      if (!successMessage) {
        setLoading(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'parentId' ? (value ? parseInt(value) : null) : value
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
              onClick={() => navigate('/categories')}
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
                    Kategoriler sayfasına yönlendiriliyorsunuz...
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 ${loading ? 'opacity-50' : ''}`}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Kategori Adı
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
                  Kategori Kodu
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
                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                  Üst Kategori
                </label>
                <select
                  name="parentId"
                  id="parentId"
                  value={formData.parentId || ''}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Ana Kategori</option>
                  {parentCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} [{category.code}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/categories')}
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