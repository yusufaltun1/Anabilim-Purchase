import { useState } from 'react';
import { ConvertRequestToOrderForm } from './ConvertRequestToOrderForm';
import { purchaseOrderService } from '../services/purchase-order.service';
import { useNotification } from '../contexts/NotificationContext';

interface ConvertRequestToOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplierQuoteId: number;
  requestedQuantity: number;
}

export const ConvertRequestToOrderModal = ({
  isOpen,
  onClose,
  onSuccess,
  supplierQuoteId,
  requestedQuantity
}: ConvertRequestToOrderModalProps) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: {
    supplierQuoteId: number;
    quantity: number;
    deliveryWarehouseId: number;
    expectedDeliveryDate: string;
    notes: string;
  }) => {
    try {
      setLoading(true);
      await purchaseOrderService.createOrder(formData);
      showNotification('Satın alma talebi başarıyla siparişe dönüştürüldü', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showNotification(error.message || 'Satın alma talebi siparişe dönüştürülürken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Satın Alma Talebini Siparişe Dönüştür
                </h3>
                <div className="mt-4">
                  <ConvertRequestToOrderForm
                    supplierQuoteId={supplierQuoteId}
                    requestedQuantity={requestedQuantity}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 