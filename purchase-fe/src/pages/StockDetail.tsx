import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { warehouseService } from '../services/warehouse.service';
import { ProductStockDetail } from '../types/warehouse';
import { formatDate } from '../utils/date';
import { useNotification } from '../contexts/NotificationContext';

export const StockDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [stockDetail, setStockDetail] = useState<ProductStockDetail | null>(null);

  useEffect(() => {
    loadStockDetail();
  }, [id]);

  const loadStockDetail = async () => {
    try {
      setLoading(true);
      const response = await warehouseService.getProductStockDetail(parseInt(id!));
      setStockDetail(response);
    } catch (error) {
      console.error('Error loading stock detail:', error);
      showNotification('Stok detayları yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeText = (type: string) => {
    switch (type) {
      case 'IN':
        return 'Giriş';
      case 'OUT':
        return 'Çıkış';
      case 'TRANSFER':
        return 'Transfer';
      case 'ADJUSTMENT':
        return 'Düzeltme';
      default:
        return type;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'IN':
        return 'bg-green-100 text-green-800';
      case 'OUT':
        return 'bg-red-100 text-red-800';
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800';
      case 'ADJUSTMENT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReferenceTypeText = (type: string) => {
    switch (type) {
      case 'PURCHASE_ORDER':
        return 'Satın Alma Siparişi';
      case 'SALES_ORDER':
        return 'Satış Siparişi';
      case 'TRANSFER':
        return 'Transfer';
      case 'ADJUSTMENT':
        return 'Düzeltme';
      case 'MANUAL':
        return 'Manuel';
      default:
        return type;
    }
  };

  if (loading) {
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

  if (!stockDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <p className="text-gray-500">Stok detayı bulunamadı</p>
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
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{stockDetail.product.name}</h1>
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-sm text-gray-500">Kod: {stockDetail.product.code}</span>
                <span className="text-sm text-gray-500">Kategori: {stockDetail.product.category}</span>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  Toplam: {stockDetail.totalStock} {stockDetail.product.unit}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/stock-management')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Geri
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Ürün Bilgileri</h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ürün Adı</dt>
                    <dd className="mt-1 text-sm text-gray-900">{stockDetail.product.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ürün Kodu</dt>
                    <dd className="mt-1 text-sm text-gray-900">{stockDetail.product.code}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Açıklama</dt>
                    <dd className="mt-1 text-sm text-gray-900">{stockDetail.product.description}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Kategori</dt>
                    <dd className="mt-1 text-sm text-gray-900">{stockDetail.product.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Birim</dt>
                    <dd className="mt-1 text-sm text-gray-900">{stockDetail.product.unit}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Warehouse Stocks */}
          <div className="mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Depo Stokları</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Depo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mevcut Stok
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Stok
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Stok
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Son Hareket
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockDetail.warehouseStocks.map((warehouseStock) => (
                    <tr key={warehouseStock.stockId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {warehouseStock.warehouse.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {warehouseStock.warehouse.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {warehouseStock.currentStock} {stockDetail.product.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {warehouseStock.minStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {warehouseStock.maxStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {warehouseStock.isLowStock ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Düşük Stok
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(warehouseStock.lastMovementDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Movements */}
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Son Hareketler</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Depo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hareket Tipi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Miktar
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referans
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notlar
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockDetail.recentMovements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {movement.warehouseStock.warehouse.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {movement.warehouseStock.warehouse.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMovementTypeBadge(movement.movementType)}`}>
                          {getMovementTypeText(movement.movementType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.movementType === 'OUT' ? '-' : '+'}{movement.quantity} {stockDetail.product.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>{getReferenceTypeText(movement.referenceType)}</div>
                          {movement.referenceId && (
                            <div className="text-xs text-gray-400">#{movement.referenceId}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {movement.notes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(movement.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 