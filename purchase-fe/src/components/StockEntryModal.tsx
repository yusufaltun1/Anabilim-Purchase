import { useState, useEffect } from 'react';
import { PurchaseOrder } from '../types/purchase-order';
import { Warehouse } from '../types/warehouse';
import { warehouseService } from '../services/warehouse.service';
import { purchaseOrderService } from '../services/purchase-order.service';
import { useNotification } from '../contexts/NotificationContext';

interface StockEntryItem {
  productId: number;
  productName: string;
  productCode: string;
  orderedQuantity: number;
  receivedQuantity: number;
  notes: string;
}

interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  purchaseOrder: PurchaseOrder;
}

export const StockEntryModal = ({
  isOpen,
  onClose,
  onSuccess,
  purchaseOrder
}: StockEntryModalProps) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(
    purchaseOrder.deliveryWarehouse?.id || 0
  );
  const [stockItems, setStockItems] = useState<StockEntryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadWarehouses();
      initializeStockItems();
    }
  }, [isOpen, purchaseOrder]);

  const loadWarehouses = async () => {
    try {
      const warehouseData = await warehouseService.getActiveWarehouses();
      setWarehouses(warehouseData);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      showNotification('Depolar yüklenirken hata oluştu', 'error');
    }
  };

  const initializeStockItems = () => {
    if (purchaseOrder.supplierQuote?.product) {
      const item: StockEntryItem = {
        productId: purchaseOrder.supplierQuote.product.id,
        productName: purchaseOrder.supplierQuote.product.name,
        productCode: purchaseOrder.supplierQuote.product.code,
        orderedQuantity: purchaseOrder.quantity,
        receivedQuantity: purchaseOrder.quantity,
        notes: ''
      };
      setStockItems([item]);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...stockItems];
    updatedItems[index].receivedQuantity = quantity;
    setStockItems(updatedItems);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const updatedItems = [...stockItems];
    updatedItems[index].notes = notes;
    setStockItems(updatedItems);
  };

  const handleSubmit = async () => {
    if (!selectedWarehouseId) {
      showNotification('Lütfen bir depo seçin', 'error');
      return;
    }

    if (stockItems.some(item => item.receivedQuantity <= 0)) {
      showNotification('Tüm ürünler için geçerli miktar girin', 'error');
      return;
    }

    try {
      setLoading(true);

      // Her ürün için stok hareketi oluştur
      for (const item of stockItems) {
        if (item.receivedQuantity > 0) {
          await warehouseService.createStockMovement(
            selectedWarehouseId,
            item.productId,
            {
              quantity: item.receivedQuantity,
              movementType: 'IN',
              referenceType: 'PURCHASE_ORDER',
              referenceId: purchaseOrder.id,
              notes: `Satın alma siparişi girişi: ${purchaseOrder.orderCode}${item.notes ? ` - ${item.notes}` : ''}`
            }
          );
        }
      }

      // Stok girişi başarılı olduktan sonra sipariş durumunu DELIVERED yap
      if (purchaseOrder.status === 'SHIPPED') {
        await purchaseOrderService.updateOrderStatus(purchaseOrder.id, { 
          status: 'DELIVERED',
          comment: 'Stok girişi tamamlandı' 
        });
      }

      showNotification('Stok girişi başarıyla tamamlandı ve sipariş teslim edildi olarak işaretlendi', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating stock entry:', error);
      showNotification('Stok girişi sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Stok Girişi - {purchaseOrder.orderCode}
                </h3>
                
                <div className="mt-4">
                  {/* Depo Seçimi */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teslimat Deposu
                    </label>
                    <select
                      value={selectedWarehouseId}
                      onChange={(e) => setSelectedWarehouseId(parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={0}>Depo Seçin</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ürün Listesi */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Ürün Bilgileri</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ürün
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sipariş Miktarı
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Teslim Alınan Miktar
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Notlar
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stockItems.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.productName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.productCode}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.orderedQuantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="number"
                                  min="0"
                                  max={item.orderedQuantity}
                                  value={item.receivedQuantity}
                                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                  className="block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={item.notes}
                                  onChange={(e) => handleNotesChange(index, e.target.value)}
                                  placeholder="Opsiyonel notlar"
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
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
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Stoğa Kaydet'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 