import { useState } from 'react';
import { CreateStockMovementRequest } from '../types/warehouse';

interface StockMovementFormProps {
  onSubmit: (data: CreateStockMovementRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const StockMovementForm = ({ onSubmit, onCancel, loading }: StockMovementFormProps) => {
  const [formData, setFormData] = useState<CreateStockMovementRequest>({
    quantity: 0,
    movementType: 'IN',
    referenceType: 'PURCHASE_ORDER',
    referenceId: 0,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
          Miktar
        </label>
        <input
          type="number"
          name="quantity"
          id="quantity"
          required
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="movementType" className="block text-sm font-medium text-gray-700">
          Hareket Tipi
        </label>
        <select
          id="movementType"
          name="movementType"
          value={formData.movementType}
          onChange={(e) => setFormData({ ...formData, movementType: e.target.value as 'IN' | 'OUT' })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="IN">Giriş</option>
          <option value="OUT">Çıkış</option>
        </select>
      </div>

      <div>
        <label htmlFor="referenceType" className="block text-sm font-medium text-gray-700">
          Referans Tipi
        </label>
        <select
          id="referenceType"
          name="referenceType"
          value={formData.referenceType}
          onChange={(e) => setFormData({ ...formData, referenceType: e.target.value as 'PURCHASE_ORDER' | 'SALES_ORDER' | 'TRANSFER' | 'ADJUSTMENT' })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="PURCHASE_ORDER">Satın Alma Siparişi</option>
          <option value="SALES_ORDER">Satış Siparişi</option>
          <option value="TRANSFER">Transfer</option>
          <option value="ADJUSTMENT">Düzeltme</option>
        </select>
      </div>

      <div>
        <label htmlFor="referenceId" className="block text-sm font-medium text-gray-700">
          Referans No
        </label>
        <input
          type="number"
          name="referenceId"
          id="referenceId"
          required
          min="1"
          value={formData.referenceId}
          onChange={(e) => setFormData({ ...formData, referenceId: parseInt(e.target.value) })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Açıklama
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
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}; 