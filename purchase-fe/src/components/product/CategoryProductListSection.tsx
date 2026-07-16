import { useEffect, useMemo, useState } from 'react';
import { ActiveFiltersBar } from '../ActiveFiltersBar';
import { SearchableSupplierSelect } from '../common/SearchableSupplierSelect';
import { ProductListPanel } from './ProductListPanel';
import { ProductListPagination } from './ProductListPagination';
import { DeviceModel, inventoryService } from '../../services/inventory.service';
import { locationService } from '../../services/location.service';
import { formatDeviceModelLabel } from '../../utils/deviceModel';
import { schoolService } from '../../services/school.service';
import { supplierService } from '../../services/supplier.service';
import { Product } from '../../types/product';
import { Supplier } from '../../types/supplier';
import { Location } from '../../types/location';
import { LOCATION_LEVEL_LABELS } from '../../utils/locationHierarchy';
import {
  ProductListFilters,
  applyProductListFilters,
  buildProductFilterChips,
  clearProductFilterKey,
  countActiveProductFilters,
  defaultProductListFilters,
  hasActiveProductFilters,
} from '../../utils/productListFilters';

const filterInputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500';
const filterLabelClass = 'block text-sm font-medium text-gray-700 mb-1';

interface CategoryProductListSectionProps {
  products: Product[];
  loading?: boolean;
  onRefresh?: () => void;
  title?: string;
  headerAction?: React.ReactNode;
  showAssetFilters?: boolean;
}

export const CategoryProductListSection = ({
  products,
  loading = false,
  onRefresh,
  title = 'Kategorideki ürünler',
  headerAction,
  showAssetFilters = true,
}: CategoryProductListSectionProps) => {
  const [filters, setFilters] = useState<ProductListFilters>(defaultProductListFilters);
  const [chipSearch, setChipSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);
  const [conditions, setConditions] = useState<{ id: number; name: string }[]>([]);
  const [parentLocs, setParentLocs] = useState<{ id: number; name: string }[]>([]);
  const [filterMiddleLocs, setFilterMiddleLocs] = useState<{ id: number; name: string }[]>([]);
  const [filterChildLocs, setFilterChildLocs] = useState<{ id: number; name: string }[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);

  useEffect(() => {
    (async () => {
      const [schoolList, supplierList, models, conds, parents, locationsRes] = await Promise.all([
        schoolService.getActiveSchools().catch(() => []),
        supplierService.getActiveSuppliers().catch(() => []),
        inventoryService.getDeviceModels().catch(() => []),
        inventoryService.getAssetConditions().catch(() => []),
        inventoryService.getParentLocations().catch(() => []),
        locationService.getAllLocations().catch(() => ({ success: false, data: [] as Location[] })),
      ]);
      setSchools(schoolList.map((s) => ({ id: s.id, name: s.name })));
      setSuppliers(supplierList);
      setDeviceModels(models);
      setConditions(conds);
      setParentLocs(parents);
      setAllLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
    })();
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

  const filterLookup = useMemo(
    () => ({
      categories: [],
      schools,
      suppliers,
      models: deviceModels,
      conditions,
      parentLocs,
      middleLocs: filterMiddleLocs,
      childLocs: filterChildLocs,
    }),
    [schools, suppliers, deviceModels, conditions, parentLocs, filterMiddleLocs, filterChildLocs]
  );

  const filteredProducts = useMemo(
    () => applyProductListFilters(products, filters, chipSearch, allLocations),
    [products, filters, chipSearch, allLocations]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, chipSearch, itemsPerPage, products.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
  };

  const resetFilters = () => {
    setChipSearch('');
    setFilters(defaultProductListFilters());
  };

  const filterChips = useMemo(() => buildProductFilterChips(filters, filterLookup), [filters, filterLookup]);
  const activeFilterCount = countActiveProductFilters(filters);
  const hasFilters = hasActiveProductFilters(filters) || chipSearch.trim().length > 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const emptyMessage = hasFilters
    ? 'Arama veya filtrelere uygun ürün bulunamadı.'
    : 'Bu kategoride henüz ürün yok.';

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`px-3 py-2 border rounded-md text-sm font-medium ${
                showFilters || activeFilterCount > 0
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Filtreler
              {activeFilterCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs bg-indigo-600 text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {headerAction}
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <label className={filterLabelClass}>Hızlı arama</label>
          <input
            type="text"
            placeholder="Ad, kod, kategori, etiket, seri no, sipariş no, IP…"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={filterInputClass}
          />
        </div>

        {showFilters && (
          <div className="px-4 py-4 border-b border-gray-200 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Gelişmiş filtreler</span>
              {activeFilterCount > 0 && (
                <button type="button" onClick={resetFilters} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  Filtreleri temizle
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <label className={filterLabelClass}>Kayıt durumu</label>
                <select
                  value={filters.activeStatus}
                  onChange={(e) =>
                    handleFilterChange('activeStatus', e.target.value as ProductListFilters['activeStatus'])
                  }
                  className={filterInputClass}
                >
                  <option value="ALL">Tümü</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                </select>
              </div>
              <div>
                <label className={filterLabelClass}>Sıralama</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as ProductListFilters['sortBy'])}
                  className={filterInputClass}
                >
                  <option value="name">Ad</option>
                  <option value="code">Kod</option>
                  <option value="price">Tahmini fiyat</option>
                  <option value="purchasePrice">Satın alma ücreti</option>
                  <option value="createdAt">Oluşturma</option>
                </select>
              </div>
              <div>
                <label className={filterLabelClass}>Sıra yönü</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as ProductListFilters['sortOrder'])}
                  className={filterInputClass}
                >
                  <option value="asc">Artan</option>
                  <option value="desc">Azalan</option>
                </select>
              </div>
              <div>
                <label className={filterLabelClass}>Min. tahmini fiyat</label>
                <input
                  type="number"
                  min={0}
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className={filterInputClass}
                />
              </div>
              <div>
                <label className={filterLabelClass}>Max. tahmini fiyat</label>
                <input
                  type="number"
                  min={0}
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className={filterInputClass}
                />
              </div>
            </div>

            {showAssetFilters && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Demirbaş</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div>
                    <label className={filterLabelClass}>Şirket</label>
                    <select
                      value={filters.schoolId ?? ''}
                      onChange={(e) =>
                        handleFilterChange('schoolId', e.target.value ? Number(e.target.value) : null)
                      }
                      className={filterInputClass}
                    >
                      <option value="">Tümü</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={filterLabelClass}>Model</label>
                    <select
                      value={filters.deviceModelId ?? ''}
                      onChange={(e) =>
                        handleFilterChange('deviceModelId', e.target.value ? Number(e.target.value) : null)
                      }
                      className={filterInputClass}
                    >
                      <option value="">Tümü</option>
                      {deviceModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {formatDeviceModelLabel(m)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={filterLabelClass}>Cihaz durumu</label>
                    <select
                      value={filters.assetConditionId ?? ''}
                      onChange={(e) =>
                        handleFilterChange('assetConditionId', e.target.value ? Number(e.target.value) : null)
                      }
                      className={filterInputClass}
                    >
                      <option value="">Tümü</option>
                      {conditions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={filterLabelClass}>Tedarikçi</label>
                    <SearchableSupplierSelect
                      suppliers={suppliers}
                      value={filters.supplierId}
                      onChange={(s) => handleFilterChange('supplierId', s?.id ?? null)}
                      placeholder="Tedarikçi ara…"
                    />
                  </div>
                  <div>
                    <label className={filterLabelClass}>Zimmet durumu</label>
                    <select
                      value={filters.assignmentStatus}
                      onChange={(e) =>
                        handleFilterChange(
                          'assignmentStatus',
                          e.target.value as ProductListFilters['assignmentStatus']
                        )
                      }
                      className={filterInputClass}
                    >
                      <option value="ALL">Tümü</option>
                      <option value="CAN_ASSIGN">Zimmetlenebilir</option>
                      <option value="IN_USE">Kullanımda</option>
                      <option value="NOT_ASSIGNABLE">Dağıtılamaz</option>
                    </select>
                  </div>
                  <div>
                    <label className={filterLabelClass}>Stok kalemi durumu</label>
                    <select
                      value={filters.stockStatus}
                      onChange={(e) =>
                        handleFilterChange('stockStatus', e.target.value as ProductListFilters['stockStatus'])
                      }
                      className={filterInputClass}
                    >
                      <option value="ALL">Tümü</option>
                      <option value="IN_STOCK">Stokta</option>
                      <option value="ASSIGNED">Zimmetli</option>
                      <option value="IN_USE">Kullanımda</option>
                      <option value="MAINTENANCE">Bakımda</option>
                      <option value="RETIRED">Emekli</option>
                    </select>
                  </div>
                  <div>
                    <label className={filterLabelClass}>{LOCATION_LEVEL_LABELS[1]}</label>
                    <select
                      value={filters.parentLocationId ?? ''}
                      onChange={(e) =>
                        handleFilterChange('parentLocationId', e.target.value ? Number(e.target.value) : null)
                      }
                      className={filterInputClass}
                    >
                      <option value="">Tümü</option>
                      {parentLocs.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={filterLabelClass}>{LOCATION_LEVEL_LABELS[2]}</label>
                    <select
                      value={filters.middleLocationId ?? ''}
                      onChange={(e) =>
                        handleFilterChange('middleLocationId', e.target.value ? Number(e.target.value) : null)
                      }
                      className={filterInputClass}
                      disabled={!filters.parentLocationId}
                    >
                      <option value="">Tümü</option>
                      {filterMiddleLocs.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={filterLabelClass}>{LOCATION_LEVEL_LABELS[3]}</label>
                    <select
                      value={filters.childLocationId ?? ''}
                      onChange={(e) =>
                        handleFilterChange('childLocationId', e.target.value ? Number(e.target.value) : null)
                      }
                      className={filterInputClass}
                      disabled={!filters.middleLocationId}
                    >
                      <option value="">Tümü</option>
                      {filterChildLocs.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={filterLabelClass}>Sipariş no</label>
                    <input
                      type="text"
                      value={filters.orderNumber}
                      onChange={(e) => handleFilterChange('orderNumber', e.target.value)}
                      className={filterInputClass}
                    />
                  </div>
                  <div>
                    <label className={filterLabelClass}>BYOD</label>
                    <select
                      value={filters.byod}
                      onChange={(e) => handleFilterChange('byod', e.target.value as ProductListFilters['byod'])}
                      className={filterInputClass}
                    >
                      <option value="ALL">Tümü</option>
                      <option value="YES">Evet</option>
                      <option value="NO">Hayır</option>
                    </select>
                  </div>
                  <div>
                    <label className={filterLabelClass}>Demirbaş etiketi</label>
                    <select
                      value={filters.hasAssetLabel}
                      onChange={(e) =>
                        handleFilterChange('hasAssetLabel', e.target.value as ProductListFilters['hasAssetLabel'])
                      }
                      className={filterInputClass}
                    >
                      <option value="ALL">Tümü</option>
                      <option value="YES">Var</option>
                      <option value="NO">Yok</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 pt-2 border-t border-gray-100">
              <span className="font-semibold text-gray-900">{filteredProducts.length}</span> ürün listeleniyor
              {products.length !== filteredProducts.length && (
                <span className="text-gray-500"> ({products.length} kayıttan)</span>
              )}
            </p>
          </div>
        )}
      </div>

      <ActiveFiltersBar
        chips={filterChips}
        search={chipSearch}
        onSearchChange={setChipSearch}
        onRemoveChip={(key) => {
          if (key === 'search') {
            handleFilterChange('search', '');
          } else {
            setFilters((prev) => clearProductFilterKey(prev, key));
          }
        }}
        onClearAll={resetFilters}
      />

      {!showFilters && (
        <p className="text-sm text-gray-600 px-1">
          <span className="font-semibold text-gray-900">{filteredProducts.length}</span> ürün
          {products.length !== filteredProducts.length && (
            <span className="text-gray-500"> · {products.length} kayıt içinde</span>
          )}
        </p>
      )}

      <ProductListPanel
        products={paginatedProducts}
        loading={loading}
        showHeader={false}
        emptyMessage={emptyMessage}
        onRefresh={onRefresh}
      />

      <ProductListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredProducts.length}
        startIndex={startIndex}
        endIndex={endIndex}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};
