import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { categoryService } from '../services/category.service';
import { Category } from '../types/category';

export const CategoryList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  useEffect(() => {
    loadCategories();
  }, [showActiveOnly]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = showActiveOnly
        ? await categoryService.getActiveCategories()
        : await categoryService.getAllCategories();
      
      if (response.success) {
        const categoriesData = Array.isArray(response.data) ? response.data : [response.data];
        console.log('Categories to render:', categoriesData);
        setCategories(categoriesData);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
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
      setError(null);
      const response = await categoryService.searchCategories(searchTerm);
      if (response.success) {
        setCategories(response.data as Category[]);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error searching categories:', err);
      setError('Kategori araması yapılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setError(null);
      await categoryService.deleteCategory(id);
      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Kategori silinirken hata oluştu');
    }
  };

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const renderCategoryTree = (category: Category, level: number = 0) => {
    if (!category) {
      console.warn('Attempting to render undefined category');
      return null;
    }

    console.log('Rendering category:', { id: category.id, name: category.name, level });
    const isExpanded = expandedCategories.includes(category.id);
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;

    return (
      <div key={category.id} className="border-b border-gray-200 last:border-b-0">
        <div 
          className="flex items-center py-4 hover:bg-gray-50"
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          <div className="flex items-center flex-1">
            {hasSubCategories && (
              <button
                onClick={() => toggleExpand(category.id)}
                className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <span className="font-medium text-gray-900 truncate">{category.name}</span>
                <span className="ml-2 text-sm text-gray-500">[{category.code}]</span>
                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              {category.description && (
                <p className="mt-1 text-sm text-gray-500 truncate">{category.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => navigate(`/categories/${category.id}`)}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              Detay
            </button>
            <button
              onClick={() => navigate(`/categories/edit/${category.id}`)}
              className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
            >
              Düzenle
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Sil
            </button>
          </div>
        </div>
        {isExpanded && hasSubCategories && (
          <div>
            {category.subCategories!.map(subCategory => 
              renderCategoryTree(subCategory, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Kategoriler</h1>
            <button
              onClick={() => navigate('/categories/create')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Yeni Kategori
            </button>
          </div>

          <div className="mb-6 flex items-center space-x-4">
            <div className="flex-1">
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Kategori ara..."
                />
                <button
                  onClick={handleSearch}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ara
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activeOnly"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="activeOnly" className="ml-2 block text-sm text-gray-900">
                Sadece Aktif Kategoriler
              </label>
            </div>
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
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="divide-y divide-gray-200">
                {categories.length > 0 ? (
                  categories.map(category => renderCategoryTree(category))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Henüz kategori bulunmuyor
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 