import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { warehouseService } from '../services/warehouse.service';
import { Warehouse, WarehouseStock, StockMovement } from '../types/warehouse';
import { formatDate } from '../utils/date';
import { useNotification } from '../contexts/NotificationContext';

export const WarehouseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [stocks, setStocks] = useState<WarehouseStock[]>([]);
  const [selectedStock, setSelectedStock] = useState<WarehouseStock | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [showMovements, setShowMovements] = useState(false);
  const [movementPage, setMovementPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadWarehouseData();
  }, [id]);

  useEffect(() => {
    if (selectedStock && showMovements) {
      loadStockMovements();
    }
  }, [selectedStock, movementPage, showMovements]);

  const loadWarehouseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const warehouseData = await warehouseService.getWarehouseById(parseInt(id!));
      setWarehouse(warehouseData);

      const stocksData = await warehouseService.getWarehouseStocks(parseInt(id!));
      if (Array.isArray(stocksData)) {
        setStocks(stocksData);
      }
    } catch (err: any) {
      setError(err.message || 'Depo bilgileri yüklenirken bir hata oluştu');
      showNotification(err.message || 'Depo bilgileri yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStockMovements = async () => {
    if (!selectedStock) return;

    try {
      setLoading(true);
      const response = await warehouseService.getStockMovements(selectedStock.id, undefined, undefined, movementPage, 10);

      if (Array.isArray(response)) {
        setStockMovements(response);
        setTotalPages(1); // Backend'den pagination bilgisi gelmiyorsa varsayılan olarak 1 sayfa
      }
    } catch (err: any) {
      showNotification(err.message || 'Stok hareketleri yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (stockId: number, minStock: number, maxStock: number) => {
    try {
      setLoading(true);
      await warehouseService.updateStock(stockId, { minStock, maxStock });
      await loadWarehouseData();
      showNotification('Stok bilgileri güncellendi', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Stok güncellenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStockMovement = async (
    stockId: number,
    quantity: number,
    movementType: 'IN' | 'OUT',
    referenceType: 'PURCHASE_ORDER' | 'SALES_ORDER' | 'TRANSFER' | 'ADJUSTMENT',
    referenceId: number,
    notes: string
  ) => {
    try {
      setLoading(true);
      await warehouseService.createStockMovement(stockId, {
        quantity,
        movementType,
        referenceType,
        referenceId,
        notes
      });
      await loadWarehouseData();
      if (selectedStock?.id === stockId) {
        await loadStockMovements();
      }
      showNotification('Stok hareketi oluşturuldu', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Stok hareketi oluşturulurken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !warehouse) {
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

  if (!warehouse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Depo bulunamadı</h3>
              </div>
            </div>
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
              <h1 className="text-3xl font-bold text-gray-900">{warehouse.name}</h1>
              <p className="mt-2 text-sm text-gray-700">
                Depo detayları ve stok bilgileri
              </p>
            </div>
            <button
              onClick={() => navigate('/warehouses')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Geri
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Depo Bilgileri</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Depo Kodu</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{warehouse.code}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Adres</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{warehouse.address}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Depo Sorumlusu</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{warehouse.managerName}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">İletişim</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div>{warehouse.phone}</div>
                    <div>{warehouse.email}</div>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Durum</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      warehouse.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {warehouse.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Stok Bilgileri</h3>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok Miktarı
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min. Stok
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max. Stok
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Son Hareket
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stocks.map((stock) => (
                    <tr key={stock.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{stock.product.name}</div>
                        <div className="text-sm text-gray-500">{stock.product.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stock.currentStock}</div>
                        <div className="text-sm text-gray-500">{stock.product.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stock.minStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stock.maxStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stock.lastMovementDate ? formatDate(stock.lastMovementDate) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedStock(stock);
                            setShowMovements(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Hareketler
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showMovements && selectedStock && (
            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Stok Hareketleri - {selectedStock.product.name}
                        </h3>
                        <div className="mt-4">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Tarih
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Miktar
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Hareket Tipi
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Referans
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Açıklama
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {stockMovements.map((movement) => (
                                <tr key={movement.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {movement.createdAt ? formatDate(movement.createdAt) : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      movement.movementType === 'IN'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {movement.movementType === 'IN' ? '+' : '-'}{movement.quantity} {selectedStock.product.unit}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {movement.movementType === 'IN' ? 'Giriş' : 'Çıkış'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {movement.referenceType} #{movement.referenceId}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {movement.notes}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                              <button
                                onClick={() => setMovementPage(Math.max(0, movementPage - 1))}
                                disabled={movementPage === 0}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Önceki
                              </button>
                              <button
                                onClick={() => setMovementPage(Math.min(totalPages - 1, movementPage + 1))}
                                disabled={movementPage === totalPages - 1}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Sonraki
                              </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm text-gray-700">
                                  Toplam <span className="font-medium">{totalPages}</span> sayfa
                                </p>
                              </div>
                              <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                  <button
                                    onClick={() => setMovementPage(Math.max(0, movementPage - 1))}
                                    disabled={movementPage === 0}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                  >
                                    <span className="sr-only">Önceki</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setMovementPage(Math.min(totalPages - 1, movementPage + 1))}
                                    disabled={movementPage === totalPages - 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                  >
                                    <span className="sr-only">Sonraki</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </nav>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMovements(false);
                        setSelectedStock(null);
                        setStockMovements([]);
                        setMovementPage(0);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 