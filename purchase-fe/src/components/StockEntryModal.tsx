import { useState, useEffect } from 'react';
import { PurchaseOrder } from '../types/purchase-order';
import { Warehouse } from '../types/warehouse';
import { ProductType, PRODUCT_TYPE_LABELS } from '../types/product';
import { warehouseService } from '../services/warehouse.service';
import { purchaseOrderService } from '../services/purchase-order.service';
import { useNotification } from '../contexts/NotificationContext';

interface StockEntryItem {
  productId: number;
  productName: string;
  productCode: string;
  productType: string;
  orderedQuantity: number;
  receivedQuantity: number;
  notes: string;
  serialNumbers: string[]; // Seri numaraları (FIXED_ASSET için)
  imageUrls: string[]; // Resim URL'leri (FIXED_ASSET için)
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
        productType: purchaseOrder.supplierQuote.product.productType || ProductType.CONSUMABLE,
        orderedQuantity: purchaseOrder.quantity,
        receivedQuantity: purchaseOrder.quantity,
        notes: '',
        serialNumbers: Array(purchaseOrder.quantity).fill(''),
        imageUrls: Array(purchaseOrder.quantity).fill('')
      };
      setStockItems([item]);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...stockItems];
    const oldQuantity = updatedItems[index].receivedQuantity;
    updatedItems[index].receivedQuantity = quantity;
    
    // Miktar değiştiğinde seri numarası ve resim dizilerini güncelle
    if (quantity > oldQuantity) {
      // Miktar arttıysa boş alanlar ekle
      const additionalSlots = quantity - oldQuantity;
      updatedItems[index].serialNumbers.push(...Array(additionalSlots).fill(''));
      updatedItems[index].imageUrls.push(...Array(additionalSlots).fill(''));
    } else if (quantity < oldQuantity) {
      // Miktar azaldıysa fazla alanları kaldır
      updatedItems[index].serialNumbers = updatedItems[index].serialNumbers.slice(0, quantity);
      updatedItems[index].imageUrls = updatedItems[index].imageUrls.slice(0, quantity);
    }
    
    setStockItems(updatedItems);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const updatedItems = [...stockItems];
    updatedItems[index].notes = notes;
    setStockItems(updatedItems);
  };

  const handleSerialNumberChange = (itemIndex: number, serialIndex: number, serialNumber: string) => {
    const updatedItems = [...stockItems];
    updatedItems[itemIndex].serialNumbers[serialIndex] = serialNumber;
    setStockItems(updatedItems);
  };

  const handleImageUpload = (itemIndex: number, imageIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const updatedItems = [...stockItems];
      updatedItems[itemIndex].imageUrls[imageIndex] = base64;
      setStockItems(updatedItems);
    };
    reader.readAsDataURL(file);
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

    // FIXED_ASSET ve SEMI_FIXED_ASSET için seri numarası kontrolü
    for (const item of stockItems) {
      if ((item.productType === ProductType.FIXED_ASSET || item.productType === ProductType.SEMI_FIXED_ASSET) && 
          item.receivedQuantity > 0) {
        const emptySerialNumbers = item.serialNumbers.slice(0, item.receivedQuantity).some(serial => !serial.trim());
        if (emptySerialNumbers) {
          showNotification(`${item.productName} için tüm seri numaralarını girin`, 'error');
          return;
        }
      }
    }

    try {
      setLoading(true);

      // Her ürün için stok hareketi oluştur
      for (const item of stockItems) {
        if (item.receivedQuantity > 0) {
          if (item.productType === ProductType.CONSUMABLE) {
            // Sarf malzemesi için tek istek
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
          } else {
            // FIXED_ASSET ve SEMI_FIXED_ASSET için her adet için ayrı stock item oluştur
            for (let i = 0; i < item.receivedQuantity; i++) {
              // Önce stock item oluştur
              const stockItemResponse = await warehouseService.createStockItem({
                productId: item.productId,
                serialNumber: item.serialNumbers[i],
                warehouseId: selectedWarehouseId,
                imageUrl: item.imageUrls[i] || undefined,
                notes: `Satın alma siparişi girişi: ${purchaseOrder.orderCode}${item.notes ? ` - ${item.notes}` : ''}`
              });

              // Sonra stok hareketi kaydı oluştur
              await warehouseService.createStockMovement(
                selectedWarehouseId,
                item.productId,
                {
                  quantity: 1,
                  movementType: 'IN',
                  referenceType: 'PURCHASE_ORDER',
                  referenceId: purchaseOrder.id,
                  notes: `Seri numaralı ürün girişi: ${item.serialNumbers[i]} - ${purchaseOrder.orderCode}${item.notes ? ` - ${item.notes}` : ''}`
                }
              );
            }
          }
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
                    {stockItems.map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
                        {/* Ürün Başlığı */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900">{item.productName}</h5>
                            <p className="text-sm text-gray-500">{item.productCode}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.productType === ProductType.CONSUMABLE 
                                ? 'bg-green-100 text-green-800' 
                                : item.productType === ProductType.FIXED_ASSET
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {PRODUCT_TYPE_LABELS[item.productType as ProductType]?.label || item.productType}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Sipariş Miktarı</p>
                            <p className="text-lg font-semibold text-gray-900">{item.orderedQuantity}</p>
                          </div>
                        </div>

                        {/* Miktar Girişi */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teslim Alınan Miktar
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={item.orderedQuantity}
                            value={item.receivedQuantity}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                            className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        {/* Seri Numarası ve Resim Alanları (FIXED_ASSET ve SEMI_FIXED_ASSET için) */}
                        {(item.productType === ProductType.FIXED_ASSET || item.productType === ProductType.SEMI_FIXED_ASSET) && item.receivedQuantity > 0 && (
                          <div className="mb-4">
                            <h6 className="text-sm font-medium text-gray-700 mb-3">Seri Numarası ve Resim Girişi</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Array.from({ length: item.receivedQuantity }, (_, i) => (
                                <div key={i} className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Adet {i + 1}</span>
                                    {item.imageUrls[i] && (
                                      <span className="text-xs text-green-600">✓ Resim yüklendi</span>
                                    )}
                                  </div>
                                  
                                  {/* Seri Numarası */}
                                  <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Seri Numarası *
                                    </label>
                                    <input
                                      type="text"
                                      value={item.serialNumbers[i] || ''}
                                      onChange={(e) => handleSerialNumberChange(index, i, e.target.value)}
                                      placeholder="Seri numarasını girin"
                                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                  </div>

                                  {/* Resim Yükleme */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Resim (Opsiyonel)
                                    </label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handleImageUpload(index, i, file);
                                          }
                                        }}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                      />
                                      {item.imageUrls[i] && (
                                        <img 
                                          src={item.imageUrls[i]} 
                                          alt={`Resim ${i + 1}`}
                                          className="w-10 h-10 object-cover rounded border"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notlar */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notlar (Opsiyonel)
                          </label>
                          <textarea
                            value={item.notes}
                            onChange={(e) => handleNotesChange(index, e.target.value)}
                            placeholder="Ürün hakkında notlarınızı buraya yazabilirsiniz..."
                            rows={3}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    ))}
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