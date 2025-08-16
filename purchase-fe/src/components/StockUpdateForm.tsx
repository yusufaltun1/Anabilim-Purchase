import { useState } from 'react';
import { UpdateStockRequest } from '../types/warehouse';

interface StockUpdateFormProps {
  initialData: {
    minStock: number;
    maxStock: number;
  };
  onSubmit: (data: UpdateStockRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const StockUpdateForm = ({ initialData, onSubmit, onCancel, loading }: StockUpdateFormProps) => {
  const [formData, setFormData] = useState<UpdateStockRequest>({
    minStock: initialData.minStock,
    maxStock: initialData.maxStock
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="minStock" className="block text-sm font-medium text-gray-700">
          Minimum Stok
        </label>
        <input
          type="number"
          name="minStock"
          id="minStock"
          required
          min="0"
          value={formData.minStock}
          onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="maxStock" className="block text-sm font-medium text-gray-700">
          Maksimum Stok
        </label>
        <input
          type="number"
          name="maxStock"
          id="maxStock"
          required
          min="0"
          value={formData.maxStock}
          onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) })}
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