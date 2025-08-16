import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { StockEntryModal } from '../components/StockEntryModal';
import { purchaseOrderService } from '../services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../types/purchase-order';
import { formatDate } from '../utils/date';
import { useNotification } from '../contexts/NotificationContext';

export const PurchaseOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [showStockEntryModal, setShowStockEntryModal] = useState(false);

  useEffect(() => {
    loadOrderData();
  }, [id]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getOrderById(parseInt(id!));
      console.log('Order Detail Response:', response);
      if (response.success) {
        setOrder(response.data as PurchaseOrder);
      } else {
        showNotification(response.message || 'Sipariş bilgileri yüklenemedi', 'error');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      showNotification('Sipariş bilgileri yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: PurchaseOrderStatus) => {
    try {
      setStatusUpdateLoading(true);
      await purchaseOrderService.updateOrderStatus(parseInt(id!), { status: newStatus });
      showNotification('Sipariş durumu başarıyla güncellendi', 'success');
      await loadOrderData();
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Sipariş durumu güncellenirken bir hata oluştu', 'error');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleStockEntrySuccess = () => {
    showNotification('Stok girişi başarıyla tamamlandı', 'success');
    loadOrderData(); // Reload order data to get updated status
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <p className="text-gray-500">Sipariş bulunamadı</p>
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sipariş Detayı</h1>
              <div className="mt-2 flex items-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  Sipariş Kodu: {order.orderCode}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/purchase-orders')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Geri
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Sipariş Bilgileri</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ürün Adı</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.supplierQuote?.product?.name || 'Ürün Bilgisi Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ürün Kodu</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.supplierQuote?.product?.code || 'Kod Yok'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Ürün Açıklaması</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.supplierQuote?.product?.description || 'Açıklama Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kategori</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.supplierQuote?.product?.category || 'Kategori Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tedarikçi</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.supplierQuote?.supplier?.companyName || 'Tedarikçi Bilgisi Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">İletişim Kişisi</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.supplierQuote?.supplier?.contactPerson || 'Bilgi Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tedarikçi Telefon</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.supplierQuote?.supplier?.contactPhone || 'Telefon Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tedarikçi E-posta</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.supplierQuote?.supplier?.contactEmail || 'E-posta Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tedarikçi Referansı</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.supplierQuote?.supplierReference || 'Referans Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Miktar</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.quantity}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Birim Fiyat</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.unitPrice} {order.supplierQuote?.currency || 'TL'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Toplam Fiyat</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.totalPrice} {order.supplierQuote?.currency || 'TL'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Teslimat Deposu</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.deliveryWarehouse?.name || 'Depo Bilgisi Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Depo Kodu</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.deliveryWarehouse?.code || 'Kod Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Depo Adresi</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.deliveryWarehouse?.address || 'Adres Bilgisi Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Depo Sorumlusu</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.deliveryWarehouse?.managerName || 'Sorumlu Bilgisi Yok'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Beklenen Teslimat Tarihi</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(order.expectedDeliveryDate)}</dd>
                </div>
                {order.actualDeliveryDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gerçekleşen Teslimat Tarihi</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(order.actualDeliveryDate)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(order.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Son Güncelleme</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(order.updatedAt)}</dd>
                </div>
                {order.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Notlar</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Status Update Section */}
          <div className="mt-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Sipariş Durumu Güncelleme
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Siparişin durumunu güncelleyebilirsiniz.</p>
              </div>
              <div className="mt-5">
                <div className="flex space-x-3">
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate('CONFIRMED')}
                        disabled={statusUpdateLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('REJECTED')}
                        disabled={statusUpdateLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Reddet
                      </button>
                    </>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleStatusUpdate('SHIPPED')}
                      disabled={statusUpdateLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Sevk Et
                    </button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate('DELIVERED')}
                        disabled={statusUpdateLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Teslim Edildi
                      </button>
                      <button
                        onClick={() => setShowStockEntryModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Stoğa Kaydet
                      </button>
                    </>
                  )}
                  {['PENDING', 'CONFIRMED'].includes(order.status) && (
                    <button
                      onClick={() => handleStatusUpdate('CANCELLED')}
                      disabled={statusUpdateLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      İptal Et
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Entry Modal */}
      {order && (
        <StockEntryModal
          isOpen={showStockEntryModal}
          onClose={() => setShowStockEntryModal(false)}
          onSuccess={handleStockEntrySuccess}
          purchaseOrder={order}
        />
      )}
    </div>
  );
}; 