import { useState, useEffect } from 'react';
import { Warehouse } from '../types/warehouse';
import { warehouseService } from '../services/warehouse.service';

interface ConvertRequestToOrderFormProps {
  supplierQuoteId: number;
  requestedQuantity: number;
  onSubmit: (data: {
    supplierQuoteId: number;
    quantity: number;
    deliveryWarehouseId: number;
    expectedDeliveryDate: string;
    notes: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConvertRequestToOrderForm = ({
  supplierQuoteId,
  requestedQuantity,
  onSubmit,
  onCancel,
  loading
}: ConvertRequestToOrderFormProps) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [formData, setFormData] = useState({
    supplierQuoteId,
    quantity: requestedQuantity,
    deliveryWarehouseId: 0,
    expectedDeliveryDate: '',
    notes: ''
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const response = await warehouseService.getWarehouses({ active: true });
      if (Array.isArray(response)) {
        setWarehouses(response);
      }
    } catch (error) {
      console.error('Depolar yüklenirken hata oluştu:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
          Sipariş Miktarı
        </label>
        <input
          type="number"
          name="quantity"
          id="quantity"
          required
          min="1"
          max={requestedQuantity}
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="deliveryWarehouseId" className="block text-sm font-medium text-gray-700">
          Teslim Deposu
        </label>
        <select
          id="deliveryWarehouseId"
          name="deliveryWarehouseId"
          required
          value={formData.deliveryWarehouseId}
          onChange={(e) => setFormData({ ...formData, deliveryWarehouseId: parseInt(e.target.value) })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Depo Seçiniz</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="expectedDeliveryDate" className="block text-sm font-medium text-gray-700">
          Beklenen Teslim Tarihi
        </label>
        <input
          type="datetime-local"
          name="expectedDeliveryDate"
          id="expectedDeliveryDate"
          required
          value={formData.expectedDeliveryDate}
          onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notlar
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            loading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {loading ? 'Dönüştürülüyor...' : 'Siparişe Dönüştür'}
        </button>
      </div>
    </form>
  );
}; 