import { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { purchaseOrderService } from '../services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../types/purchase-order';
import { formatDate } from '../utils/date';
import { useNotification } from '../contexts/NotificationContext';

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Taslak',
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  SHIPPED: 'Sevk Edildi',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  REJECTED: 'Reddedildi',
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export const AccountingOrders = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<PurchaseOrderStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = selectedStatus === 'ALL'
        ? await purchaseOrderService.getAllOrders()
        : await purchaseOrderService.getOrdersByStatus(selectedStatus);
      if (response.success) {
        setOrders(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        showNotification(response.message || 'Bir hata oluştu', 'error');
      }
    } catch {
      showNotification('Siparişler yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const currency = orders[0]?.supplierQuote?.currency || 'TL';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* Başlık */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Muhasebe — Sipariş Listesi</h1>
              <p className="text-sm text-gray-500 mt-1">Satın alma siparişlerinin finansal özeti</p>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PurchaseOrderStatus | 'ALL')}
              className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="PENDING">Beklemede</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="SHIPPED">Sevk Edildi</option>
              <option value="DELIVERED">Teslim Edildi</option>
              <option value="CANCELLED">İptal Edildi</option>
              <option value="REJECTED">Reddedildi</option>
            </select>
          </div>

          {/* Özet kartlar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Toplam Sipariş</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Teslim Edilen</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {orders.filter(o => o.status === 'DELIVERED').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Toplam Tutar</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}
              </p>
            </div>
          </div>

          {/* Tablo */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Sipariş bulunamadı</p>
            </div>
          ) : (
            <div className="shadow border-b border-gray-200 sm:rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tedarikçi</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Birim Fiyat</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beklenen Teslimat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gerçek Teslimat</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="font-medium">{order.supplierQuote?.product?.name || '—'}</div>
                        <div className="text-gray-400 text-xs">{order.supplierQuote?.product?.code || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.supplierQuote?.supplier?.companyName || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                        {order.unitPrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.supplierQuote?.currency || 'TL'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        {order.totalPrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {order.supplierQuote?.currency || 'TL'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.expectedDeliveryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.actualDeliveryDate ? formatDate(order.actualDeliveryDate) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-gray-700 text-right">
                      Genel Toplam
                    </td>
                    <td className="px-6 py-3 text-sm font-bold text-indigo-700 text-right">
                      {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currency}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
