import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { ProductLabelPrint } from '../components/ProductLabelPrint';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { Product, PRODUCT_TYPE_LABELS, ProductType } from '../types/product';
import { Category } from '../types/category';

interface Filters {
  search: string;
  categoryId: number | null;
  productType: ProductType | 'ALL';
  activeStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  minPrice: string;
  maxPrice: string;
  unitOfMeasure: string;
  sortBy: 'name' | 'code' | 'price' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export const ProductList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [printingProduct, setPrintingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    categoryId: null,
    productType: 'ALL',
    activeStatus: 'ALL',
    minPrice: '',
    maxPrice: '',
    unitOfMeasure: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getActiveCategories();
      if (response.success) {
        const categoriesData = Array.isArray(response.data) ? response.data : [response.data];
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAllProducts();
      
      if (response.success && response.data) {
        const productsData = Array.isArray(response.data) ? response.data : [response.data];
        console.log('Loaded products:', productsData);
        setAllProducts(productsData);
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

  // Filtreleme ve sıralama
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Arama filtresi
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.code.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    // Kategori filtresi
    if (filters.categoryId) {
      filtered = filtered.filter((p) => p.category?.id === filters.categoryId);
    }

    // Ürün tipi filtresi
    if (filters.productType !== 'ALL') {
      filtered = filtered.filter((p) => p.productType === filters.productType);
    }

    // Aktif/Pasif filtresi
    if (filters.activeStatus !== 'ALL') {
      filtered = filtered.filter((p) => {
        const isActive = p.active !== undefined ? p.active : p.isActive !== false;
        return filters.activeStatus === 'ACTIVE' ? isActive : !isActive;
      });
    }

    // Fiyat aralığı filtresi
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter((p) => (p.estimatedUnitPrice || 0) >= minPrice);
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter((p) => (p.estimatedUnitPrice || 0) <= maxPrice);
    }

    // Birim filtresi
    if (filters.unitOfMeasure) {
      filtered = filtered.filter((p) => p.unitOfMeasure === filters.unitOfMeasure);
    }

    // Sıralama
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'tr');
          break;
        case 'code':
          comparison = a.code.localeCompare(b.code, 'tr');
          break;
        case 'price':
          comparison = (a.estimatedUnitPrice || 0) - (b.estimatedUnitPrice || 0);
          break;
        case 'createdAt':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allProducts, filters]);

  // Pagination hesaplamaları
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setProducts(paginatedProducts);
  }, [startIndex, endIndex, filteredAndSortedProducts.length]);

  useEffect(() => {
    // Sayfa değiştiğinde veya filtre değiştiğinde ilk sayfaya dön
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      categoryId: null,
      productType: 'ALL',
      activeStatus: 'ALL',
      minPrice: '',
      maxPrice: '',
      unitOfMeasure: '',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.categoryId !== null ||
      filters.productType !== 'ALL' ||
      filters.activeStatus !== 'ALL' ||
      filters.minPrice !== '' ||
      filters.maxPrice !== '' ||
      filters.unitOfMeasure !== ''
    );
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
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  showFilters || hasActiveFilters()
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtrele
                  {hasActiveFilters() && (
                    <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs">
                      {[
                        filters.search && 1,
                        filters.categoryId && 1,
                        filters.productType !== 'ALL' && 1,
                        filters.activeStatus !== 'ALL' && 1,
                        filters.minPrice && 1,
                        filters.maxPrice && 1,
                        filters.unitOfMeasure && 1,
                      ].filter(Boolean).length}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => navigate('/products/create')}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Yeni Ürün
              </button>
            </div>
          </div>

          {/* Filtre Paneli */}
          {showFilters && (
            <div className="mb-6 bg-white shadow rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
                <div className="flex gap-2">
                  {hasActiveFilters() && (
                    <button
                      onClick={resetFilters}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Filtreleri Temizle
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Arama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arama</label>
                  <input
                    type="text"
                    placeholder="Ürün adı, kod..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={filters.categoryId || ''}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Tümü</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ürün Tipi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Tipi</label>
                  <select
                    value={filters.productType}
                    onChange={(e) => handleFilterChange('productType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ALL">Tümü</option>
                    <option value={ProductType.CONSUMABLE}>Sarf Malzemesi</option>
                    <option value={ProductType.SEMI_FIXED_ASSET}>Yarı Sabit Kıymet</option>
                    <option value={ProductType.FIXED_ASSET}>Sabit Kıymet</option>
                  </select>
                </div>

                {/* Aktif/Pasif */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <select
                    value={filters.activeStatus}
                    onChange={(e) => handleFilterChange('activeStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ALL">Tümü</option>
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Pasif</option>
                  </select>
                </div>

                {/* Min Fiyat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Fiyat (₺)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Max Fiyat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max. Fiyat (₺)</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Birim */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birim</label>
                  <select
                    value={filters.unitOfMeasure}
                    onChange={(e) => handleFilterChange('unitOfMeasure', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Tümü</option>
                    <option value="PIECE">Adet</option>
                    <option value="METER">Metre</option>
                    <option value="LITER">Litre</option>
                    <option value="KILOGRAM">Kilogram</option>
                    <option value="BOX">Kutu</option>
                    <option value="PACKAGE">Paket</option>
                    <option value="SET">Takım</option>
                    <option value="PAIR">Çift</option>
                  </select>
                </div>

                {/* Sıralama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sırala</label>
                  <div className="flex gap-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="name">Ad</option>
                      <option value="code">Kod</option>
                      <option value="price">Fiyat</option>
                      <option value="createdAt">Tarih</option>
                    </select>
                    <button
                      onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      title={filters.sortOrder === 'asc' ? 'Artan' : 'Azalan'}
                    >
                      {filters.sortOrder === 'asc' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sonuç Sayısı ve Sayfa Başına Öğe */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{filteredAndSortedProducts.length}</span> ürün bulundu
                  {hasActiveFilters() && (
                    <span className="ml-2 text-indigo-600">
                      ({allProducts.length} toplam üründen)
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sayfa başına:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 bg-white shadow rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-700">
                    Sayfa <span className="font-semibold">{currentPage}</span> / <span className="font-semibold">{totalPages}</span>
                    {' '}({startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)} / {filteredAndSortedProducts.length})
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  {/* Sayfa Numaraları */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 text-sm font-medium border border-gray-300 ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

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
              {hasActiveFilters() ? 'Filtre kriterlerinize uygun ürün bulunamadı.' : 'Henüz hiç ürün bulunmuyor.'}
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
                            <div>
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {product.name}
                              </p>
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                {product.code}
                              </span>
                              {product.productType && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {PRODUCT_TYPE_LABELS[product.productType]?.label || product.productType}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-12 w-12 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedImage(product.imageUrl)}
                              />
                            )}
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
                              onClick={() => setPrintingProduct(product)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Bas
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

          {/* Resim Modal */}
          {selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedImage}
                alt="Büyük resim görünümü"
                className="max-w-[80vw] max-h-[80vh] object-contain rounded-lg shadow-xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Yazdırma Component */}
          {printingProduct && (
            <ProductLabelPrint
              productId={printingProduct.id}
              productName={printingProduct.name}
              onClose={() => setPrintingProduct(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}; 