import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { ProductListPanel } from '../components/product/ProductListPanel';
import { ActiveFiltersBar } from '../components/ActiveFiltersBar';
import { SearchableCategorySelect } from '../components/common/SearchableCategorySelect';
import { SearchableSupplierSelect } from '../components/common/SearchableSupplierSelect';
import { SearchableDeviceModelSelect } from '../components/common/SearchableDeviceModelSelect';
import { SearchableOptionSelect } from '../components/common/SearchableOptionSelect';
import { authService } from '../services/auth.service';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { DeviceModel, inventoryService } from '../services/inventory.service';
import { locationService } from '../services/location.service';
import { schoolService } from '../services/school.service';
import { supplierService } from '../services/supplier.service';
import { Product } from '../types/product';
import { Category, CATEGORY_PRODUCT_TYPE_OPTIONS } from '../types/category';
import { Supplier } from '../types/supplier';
import { School } from '../types/school';
import { Location } from '../types/location';
import { LOCATION_LEVEL_LABELS } from '../utils/locationHierarchy';
import {
  ProductListFilters,
  applyProductListFilters,
  buildProductFilterChips,
  clearProductFilterKey,
  countActiveProductFilters,
  defaultProductListFilters,
  hasActiveProductFilters,
} from '../utils/productListFilters';

const filterInputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500';
const filterLabelClass = 'block text-sm font-medium text-gray-700 mb-1';

const PRODUCT_TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tümü' },
  ...CATEGORY_PRODUCT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
];

const ACTIVE_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'INACTIVE', label: 'Pasif' },
];

const YES_NO_ALL_OPTIONS = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'YES', label: 'Evet' },
  { value: 'NO', label: 'Hayır' },
];

const ASSET_LABEL_OPTIONS = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'YES', label: 'Etiketli' },
  { value: 'NO', label: 'Etiketsiz' },
];

const STOCK_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'IN_STOCK', label: 'Stokta' },
  { value: 'ASSIGNED', label: 'Zimmetli' },
  { value: 'IN_USE', label: 'Kullanımda' },
  { value: 'MAINTENANCE', label: 'Bakımda' },
  { value: 'RETIRED', label: 'Emekli' },
];

const ASSIGNMENT_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'CAN_ASSIGN', label: 'Zimmetlenebilir' },
  { value: 'IN_USE', label: 'Önce iade gerekli' },
  { value: 'NOT_ASSIGNABLE', label: 'Dağıtılamaz' },
];

const UNIT_OF_MEASURE_OPTIONS = [
  { value: '', label: 'Tümü' },
  { value: 'PIECE', label: 'Adet' },
  { value: 'METER', label: 'Metre' },
  { value: 'LITER', label: 'Litre' },
  { value: 'KILOGRAM', label: 'Kilogram' },
  { value: 'BOX', label: 'Kutu' },
  { value: 'PACKAGE', label: 'Paket' },
  { value: 'SET', label: 'Takım' },
  { value: 'PAIR', label: 'Çift' },
];

const SORT_BY_OPTIONS = [
  { value: 'name', label: 'Ad' },
  { value: 'code', label: 'Kod' },
  { value: 'price', label: 'Tahmini fiyat' },
  { value: 'purchasePrice', label: 'Satın alma fiyatı' },
  { value: 'createdAt', label: 'Oluşturma tarihi' },
];

export const ProductList = () => {
  const navigate = useNavigate();
  const canInventoryManage = authService.hasCapability('INVENTORY_MANAGE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [conditions, setConditions] = useState<{ id: number; name: string }[]>([]);
  const [parentLocs, setParentLocs] = useState<{ id: number; name: string }[]>([]);
  const [filterMiddleLocs, setFilterMiddleLocs] = useState<{ id: number; name: string }[]>([]);
  const [filterChildLocs, setFilterChildLocs] = useState<{ id: number; name: string }[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ProductListFilters>(defaultProductListFilters());

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadFilterMasters();
  }, []);

  useEffect(() => {
    if (filters.parentLocationId) {
      inventoryService
        .getChildLocations(filters.parentLocationId)
        .then(setFilterMiddleLocs)
        .catch(() => setFilterMiddleLocs([]));
    } else {
      setFilterMiddleLocs([]);
    }
  }, [filters.parentLocationId]);

  useEffect(() => {
    if (filters.middleLocationId) {
      inventoryService
        .getChildLocations(filters.middleLocationId)
        .then(setFilterChildLocs)
        .catch(() => setFilterChildLocs([]));
    } else {
      setFilterChildLocs([]);
    }
  }, [filters.middleLocationId]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getActiveCategories();
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setCategories(await categoryService.getAllCategories());
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadFilterMasters = async () => {
    const [schoolList, supplierList, models, conds, parents, locationsRes] = await Promise.all([
      schoolService.getActiveSchools().catch(() => []),
      supplierService.getActiveSuppliers().catch(() => []),
      inventoryService.getDeviceModels().catch(() => []),
      inventoryService.getAssetConditions().catch(() => []),
      inventoryService.getParentLocations().catch(() => []),
      locationService.getAllLocations().catch(() => ({ success: false, data: [] as Location[] })),
    ]);
    setSchools(schoolList);
    setSuppliers(supplierList);
    setDeviceModels(models);
    setConditions(conds);
    setParentLocs(parents);
    setAllLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
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

  const schoolOptions = useMemo(
    () => schools.map((s) => ({ value: s.id, label: s.name })),
    [schools]
  );
  const conditionOptions = useMemo(
    () => conditions.map((c) => ({ value: c.id, label: c.name })),
    [conditions]
  );
  const parentLocationOptions = useMemo(
    () => parentLocs.map((l) => ({ value: l.id, label: l.name })),
    [parentLocs]
  );
  const middleLocationOptions = useMemo(
    () => filterMiddleLocs.map((l) => ({ value: l.id, label: l.name })),
    [filterMiddleLocs]
  );
  const childLocationOptions = useMemo(
    () => filterChildLocs.map((l) => ({ value: l.id, label: l.name })),
    [filterChildLocs]
  );

  const filterLookup = useMemo(
    () => ({
      categories,
      schools: schools.map((s) => ({ id: s.id, name: s.name })),
      suppliers: suppliers.map((s) => ({ id: s.id, name: s.name })),
      models: deviceModels,
      conditions,
      parentLocs,
      middleLocs: filterMiddleLocs,
      childLocs: filterChildLocs,
    }),
    [categories, schools, suppliers, deviceModels, conditions, parentLocs, filterMiddleLocs, filterChildLocs]
  );

  const filteredAndSortedProducts = useMemo(
    () => applyProductListFilters(allProducts, filters, '', allLocations),
    [allProducts, filters, allLocations]
  );

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

  const handleFilterChange = <K extends keyof ProductListFilters>(key: K, value: ProductListFilters[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'parentLocationId') {
        next.middleLocationId = null;
        next.childLocationId = null;
      }
      if (key === 'middleLocationId') {
        next.childLocationId = null;
      }
      return next;
    });
    setCurrentPage(1);
  };

  const filterChips = useMemo(() => buildProductFilterChips(filters, filterLookup), [filters, filterLookup]);

  const removeFilterChip = (key: string) => {
    setFilters((prev) => clearProductFilterKey(prev, key));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(defaultProductListFilters());
    setCurrentPage(1);
  };

  const activeFilterCount = countActiveProductFilters(filters);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="mx-auto w-full max-w-[1600px] py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  showFilters || hasActiveProductFilters(filters)
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtrele
                  {activeFilterCount > 0 && (
                    <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs">
                      {activeFilterCount}
                    </span>
                  )}
                </span>
              </button>
              {canInventoryManage && (
                <button
                  onClick={() => navigate('/products/create')}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Yeni Ürün
                </button>
              )}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Hızlı ara: ad, kod, kategori, etiket, seri no, sipariş no…"
                className={`${filterInputClass} pl-10`}
              />
            </div>
            {filters.search.trim() && (
              <button
                type="button"
                onClick={() => handleFilterChange('search', '')}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
              >
                Aramayı temizle
              </button>
            )}
            {!showFilters && filteredAndSortedProducts.length !== allProducts.length && (
              <p className="text-sm text-gray-500 w-full sm:w-auto">
                <span className="font-medium text-gray-700">{filteredAndSortedProducts.length}</span> ürün
                {allProducts.length > 0 && (
                  <span className="text-gray-400"> / {allProducts.length}</span>
                )}
              </p>
            )}
          </div>

          {/* Filtre Paneli */}
          {showFilters && (
            <div className="mb-6 bg-white shadow rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
                <div className="flex gap-2">
                  {activeFilterCount > 0 && (
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

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Genel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className={filterLabelClass}>Kategori</label>
                      <SearchableCategorySelect
                        categories={categories}
                        value={filters.categoryId}
                        onChange={(cat) => handleFilterChange('categoryId', cat?.id ?? null)}
                        placeholder="Kategori ara…"
                        allowClear
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Ürün tipi</label>
                      <SearchableOptionSelect
                        options={PRODUCT_TYPE_FILTER_OPTIONS}
                        value={filters.productType}
                        onChange={(v) => handleFilterChange('productType', v ?? 'ALL')}
                        placeholder="Ürün tipi ara…"
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Kayıt durumu</label>
                      <SearchableOptionSelect
                        options={ACTIVE_STATUS_OPTIONS}
                        value={filters.activeStatus}
                        onChange={(v) => handleFilterChange('activeStatus', (v ?? 'ALL') as ProductListFilters['activeStatus'])}
                        placeholder="Durum ara…"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Demirbaş</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                      <label className={filterLabelClass}>Şirket</label>
                      <SearchableOptionSelect
                        options={schoolOptions}
                        value={filters.schoolId}
                        onChange={(v) => handleFilterChange('schoolId', v)}
                        placeholder="Şirket ara…"
                        allowClear
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Model</label>
                      <SearchableDeviceModelSelect
                        models={deviceModels}
                        value={filters.deviceModelId}
                        onChange={(m) => handleFilterChange('deviceModelId', m?.id ?? null)}
                        placeholder="Marka veya model ara…"
                        allowClear
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Cihaz durumu</label>
                      <SearchableOptionSelect
                        options={conditionOptions}
                        value={filters.assetConditionId}
                        onChange={(v) => handleFilterChange('assetConditionId', v)}
                        placeholder="Cihaz durumu ara…"
                        allowClear
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Demirbaş etiketi</label>
                      <SearchableOptionSelect
                        options={ASSET_LABEL_OPTIONS}
                        value={filters.hasAssetLabel}
                        onChange={(v) => handleFilterChange('hasAssetLabel', (v ?? 'ALL') as ProductListFilters['hasAssetLabel'])}
                        placeholder="Etiket durumu ara…"
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>{LOCATION_LEVEL_LABELS[1]}</label>
                      <SearchableOptionSelect
                        options={parentLocationOptions}
                        value={filters.parentLocationId}
                        onChange={(v) => handleFilterChange('parentLocationId', v)}
                        placeholder={`${LOCATION_LEVEL_LABELS[1]} ara…`}
                        allowClear
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>{LOCATION_LEVEL_LABELS[2]}</label>
                      <SearchableOptionSelect
                        options={middleLocationOptions}
                        value={filters.middleLocationId}
                        onChange={(v) => handleFilterChange('middleLocationId', v)}
                        placeholder={`${LOCATION_LEVEL_LABELS[2]} ara…`}
                        allowClear
                        disabled={!filters.parentLocationId}
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>{LOCATION_LEVEL_LABELS[3]}</label>
                      <SearchableOptionSelect
                        options={childLocationOptions}
                        value={filters.childLocationId}
                        onChange={(v) => handleFilterChange('childLocationId', v)}
                        placeholder={`${LOCATION_LEVEL_LABELS[3]} ara…`}
                        allowClear
                        disabled={!filters.middleLocationId}
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>BYOD</label>
                      <SearchableOptionSelect
                        options={YES_NO_ALL_OPTIONS}
                        value={filters.byod}
                        onChange={(v) => handleFilterChange('byod', (v ?? 'ALL') as ProductListFilters['byod'])}
                        placeholder="BYOD ara…"
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Stok kalemi durumu</label>
                      <SearchableOptionSelect
                        options={STOCK_STATUS_OPTIONS}
                        value={filters.stockStatus}
                        onChange={(v) => handleFilterChange('stockStatus', (v ?? 'ALL') as ProductListFilters['stockStatus'])}
                        placeholder="Stok durumu ara…"
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Zimmet / kullanım</label>
                      <SearchableOptionSelect
                        options={ASSIGNMENT_STATUS_OPTIONS}
                        value={filters.assignmentStatus}
                        onChange={(v) =>
                          handleFilterChange('assignmentStatus', (v ?? 'ALL') as ProductListFilters['assignmentStatus'])
                        }
                        placeholder="Zimmet durumu ara…"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Sipariş & fiyat</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className={filterLabelClass}>Tedarikçi</label>
                      <SearchableSupplierSelect
                        suppliers={suppliers}
                        value={filters.supplierId}
                        onChange={(s) => handleFilterChange('supplierId', s?.id ?? null)}
                        placeholder="Tedarikçi ara…"
                        allowClear
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Sipariş numarası</label>
                      <input
                        type="text"
                        value={filters.orderNumber}
                        onChange={(e) => handleFilterChange('orderNumber', e.target.value)}
                        className={filterInputClass}
                        placeholder="Kısmi eşleşme"
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Min. tahmini fiyat (₺)</label>
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className={filterInputClass}
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Max. tahmini fiyat (₺)</label>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className={filterInputClass}
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Min. satın alma (₺)</label>
                      <input
                        type="number"
                        value={filters.minPurchasePrice}
                        onChange={(e) => handleFilterChange('minPurchasePrice', e.target.value)}
                        className={filterInputClass}
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Max. satın alma (₺)</label>
                      <input
                        type="number"
                        value={filters.maxPurchasePrice}
                        onChange={(e) => handleFilterChange('maxPurchasePrice', e.target.value)}
                        className={filterInputClass}
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Birim</label>
                      <SearchableOptionSelect
                        options={UNIT_OF_MEASURE_OPTIONS}
                        value={filters.unitOfMeasure || ''}
                        onChange={(v) => handleFilterChange('unitOfMeasure', v ?? '')}
                        placeholder="Birim ara…"
                      />
                    </div>
                    <div>
                      <label className={filterLabelClass}>Sırala</label>
                      <div className="flex gap-2">
                        <div className="flex-1 min-w-0">
                          <SearchableOptionSelect
                            options={SORT_BY_OPTIONS}
                            value={filters.sortBy}
                            onChange={(v) =>
                              handleFilterChange('sortBy', (v ?? 'name') as ProductListFilters['sortBy'])
                            }
                            placeholder="Sıralama alanı ara…"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                          title={filters.sortOrder === 'asc' ? 'Artan' : 'Azalan'}
                        >
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sonuç Sayısı ve Sayfa Başına Öğe */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{filteredAndSortedProducts.length}</span> ürün bulundu
                  {activeFilterCount > 0 && (
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

          <ActiveFiltersBar
            chips={filterChips}
            onRemoveChip={removeFilterChip}
            onClearAll={resetFilters}
          />

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
          ) : (
            <ProductListPanel
              products={products}
              showHeader={false}
              emptyMessage={
                hasActiveProductFilters(filters)
                  ? 'Filtre kriterlerinize uygun ürün bulunamadı.'
                  : 'Henüz hiç ürün bulunmuyor.'
              }
              onRefresh={loadProducts}
            />
          )}
        </div>
      </div>
    </div>
  );
}; 