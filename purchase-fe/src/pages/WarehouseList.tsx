import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { warehouseService } from '../services/warehouse.service';
import { Warehouse } from '../types/warehouse';
import { formatDate } from '../utils/date';

export const WarehouseList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadWarehouses();
  }, [showInactive]);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await warehouseService.getAllWarehouses();

      if (Array.isArray(response)) {
        const filteredWarehouses = showInactive 
          ? response 
          : response.filter(warehouse => warehouse.active);
        setWarehouses(filteredWarehouses);
      } else {
        setError('Beklenmeyen response formatı');
      }
    } catch (err: any) {
      setError(err.message || 'Depolar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (warehouse: Warehouse) => {
    try {
      setLoading(true);
      await warehouseService.toggleWarehouseStatus(warehouse.id);
      await loadWarehouses();
    } catch (err: any) {
      setError(err.message || 'Depo durumu değiştirilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: boolean) => {
    return status
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Aktif' : 'Pasif';
  };

  if (loading && warehouses.length === 0) {
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Depolar</h1>
              <p className="mt-2 text-sm text-gray-700">
                Tüm depoların listesi ve detaylı bilgileri
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInactive"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="showInactive" className="ml-2 text-sm text-gray-700">
                  Pasif Depoları Göster
                </label>
              </div>
              <button
                onClick={() => navigate('/warehouses/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Yeni Depo
              </button>
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

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {warehouses.map((warehouse) => (
                <li key={warehouse.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-lg font-medium text-indigo-600 truncate">
                            {warehouse.name}
                          </p>
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(warehouse.active)}`}>
                            {getStatusText(warehouse.active)}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-sm text-gray-500">Kod</p>
                            <p className="mt-1 text-sm text-gray-900">{warehouse.code}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Depo Sorumlusu</p>
                            <p className="mt-1 text-sm text-gray-900">{warehouse.managerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">İletişim</p>
                            <p className="mt-1 text-sm text-gray-900">{warehouse.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleToggleStatus(warehouse)}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                            warehouse.active
                              ? 'text-red-700 bg-red-100 hover:bg-red-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                          {warehouse.active ? 'Pasife Al' : 'Aktife Al'}
                        </button>
                        <button
                          onClick={() => navigate(`/warehouses/${warehouse.id}`)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Detay
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 