import { useState } from 'react';
import { purchaseRequestService } from '../services/purchase-request.service';
import { PurchaseRequestItem } from '../types/purchase-request';

interface AddItemsFormProps {
  requestId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddItemsForm = ({ requestId, onSuccess, onCancel }: AddItemsFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PurchaseRequestItem[]>([{
    itemName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    supplier: '',
    estimatedDeliveryDate: new Date().toISOString().split('T')[0]
  }]);

  const handleInputChange = (index: number, field: keyof PurchaseRequestItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        supplier: '',
        estimatedDeliveryDate: new Date().toISOString().split('T')[0]
      }
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await purchaseRequestService.addItems(requestId, { items });
      onSuccess();
    } catch (err) {
      console.error('Error adding items:', err);
      setError('Ürünler eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-white shadow sm:rounded-lg">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Ürün #{index + 1}</h4>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Kaldır
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor={`itemName-${index}`} className="block text-sm font-medium text-gray-700">
                    Ürün Adı
                  </label>
                  <input
                    type="text"
                    id={`itemName-${index}`}
                    required
                    value={item.itemName}
                    onChange={(e) => handleInputChange(index, 'itemName', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">
                    Açıklama
                  </label>
                  <input
                    type="text"
                    id={`description-${index}`}
                    required
                    value={item.description}
                    onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">
                    Miktar
                  </label>
                  <input
                    type="number"
                    id={`quantity-${index}`}
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleInputChange(index, 'quantity', parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor={`unitPrice-${index}`} className="block text-sm font-medium text-gray-700">
                    Birim Fiyat (TL)
                  </label>
                  <input
                    type="number"
                    id={`unitPrice-${index}`}
                    required
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleInputChange(index, 'unitPrice', parseFloat(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor={`supplier-${index}`} className="block text-sm font-medium text-gray-700">
                    Tedarikçi
                  </label>
                  <input
                    type="text"
                    id={`supplier-${index}`}
                    required
                    value={item.supplier}
                    onChange={(e) => handleInputChange(index, 'supplier', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor={`estimatedDeliveryDate-${index}`} className="block text-sm font-medium text-gray-700">
                    Tahmini Teslim Tarihi
                  </label>
                  <input
                    type="date"
                    id={`estimatedDeliveryDate-${index}`}
                    required
                    value={item.estimatedDeliveryDate}
                    onChange={(e) => handleInputChange(index, 'estimatedDeliveryDate', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Yeni Ürün Ekle
            </button>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}; 