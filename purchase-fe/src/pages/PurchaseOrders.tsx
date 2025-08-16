import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { StockEntryModal } from '../components/StockEntryModal';
import { purchaseOrderService } from '../services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../types/purchase-order';
import { formatDate } from '../utils/date';
import { useNotification } from '../contexts/NotificationContext';

export const PurchaseOrders = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<PurchaseOrderStatus | 'ALL'>('ALL');
  const [showStockEntryModal, setShowStockEntryModal] = useState(false);
  const [selectedOrderForStock, setSelectedOrderForStock] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = selectedStatus === 'ALL'
        ? await purchaseOrderService.getAllOrders()
        : await purchaseOrderService.getOrdersByStatus(selectedStatus);
      
      console.log('API Response:', response);
      
      if (response.success) {
        setOrders(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        showNotification(response.message || 'Bir hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      showNotification('Siparişler yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'Taslak';
      case 'PENDING':
        return 'Beklemede';
      case 'CONFIRMED':
        return 'Onaylandı';
      case 'SHIPPED':
        return 'Sevk Edildi';
      case 'DELIVERED':
        return 'Teslim Edildi';
      case 'CANCELLED':
        return 'İptal Edildi';
      case 'REJECTED':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const handleStockEntry = (order: PurchaseOrder) => {
    setSelectedOrderForStock(order);
    setShowStockEntryModal(true);
  };

  const handleStockEntrySuccess = () => {
    showNotification('Stok girişi başarıyla tamamlandı', 'success');
    loadOrders(); // Reload orders to get updated data
    setShowStockEntryModal(false);
    setSelectedOrderForStock(null);
  };

  const handleStockEntryClose = () => {
    setShowStockEntryModal(false);
    setSelectedOrderForStock(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Satın Alma Siparişleri</h1>
            <div className="flex space-x-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as PurchaseOrderStatus | 'ALL')}
                className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="ALL">Tüm Durumlar</option>
                <option value="DRAFT">Taslak</option>
                <option value="PENDING">Beklemede</option>
                <option value="CONFIRMED">Onaylandı</option>
                <option value="SHIPPED">Sevk Edildi</option>
                <option value="DELIVERED">Teslim Edildi</option>
                <option value="CANCELLED">İptal Edildi</option>
                <option value="REJECTED">Reddedildi</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Sipariş bulunamadı</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sipariş Kodu
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ürün
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tedarikçi
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Miktar
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Birim Fiyat
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Toplam Fiyat
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durum
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teslim Tarihi
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">İşlemler</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.orderCode}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {order.supplierQuote?.product?.name || 'Ürün Bilgisi Yok'}
                                </div>
                                <div className="text-gray-500">
                                  {order.supplierQuote?.product?.code || ''}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.supplierQuote?.supplier?.companyName || 'Tedarikçi Bilgisi Yok'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.unitPrice} {order.supplierQuote?.currency || 'TL'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.totalPrice} {order.supplierQuote?.currency || 'TL'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.expectedDeliveryDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => navigate(`/purchase-orders/${order.id}`)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Detay
                                </button>
                                {order.status === 'SHIPPED' && (
                                  <button
                                    onClick={() => handleStockEntry(order)}
                                    className="text-purple-600 hover:text-purple-900"
                                  >
                                    Stoğa Kaydet
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Entry Modal */}
      {selectedOrderForStock && (
        <StockEntryModal
          isOpen={showStockEntryModal}
          onClose={handleStockEntryClose}
          onSuccess={handleStockEntrySuccess}
          purchaseOrder={selectedOrderForStock}
        />
      )}
    </div>
  );
}; 