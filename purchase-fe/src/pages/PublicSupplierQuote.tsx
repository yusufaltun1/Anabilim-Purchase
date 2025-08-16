import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supplierQuoteService } from '../services/supplier-quote.service';
import { SupplierQuote, UpdateSupplierQuoteRequest } from '../types/supplier-quote';

export const PublicSupplierQuote = () => {
  const { quoteUid } = useParams<{ quoteUid: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quote, setQuote] = useState<SupplierQuote | null>(null);
  const [formData, setFormData] = useState<UpdateSupplierQuoteRequest>({
    unitPrice: 0,
    quantity: 0,
    currency: 'TRY',
    deliveryDate: '',
    validityDate: '',
    notes: '',
    supplierReference: ''
  });

  useEffect(() => {
    if (quoteUid) {
      loadQuote();
    }
  }, [quoteUid]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierQuoteService.getQuoteByUid(quoteUid!);
      
      if (response.success && response.data) {
        setQuote(response.data);
        // Form verilerini mevcut değerlerle doldur
        setFormData({
          unitPrice: response.data.unitPrice || 0,
          quantity: response.data.quantity || 0,
          currency: response.data.currency || 'TRY',
          deliveryDate: response.data.deliveryDate?.split('T')[0] || '',
          validityDate: response.data.validityDate?.split('T')[0] || '',
          notes: response.data.notes || '',
          supplierReference: response.data.supplierReference || ''
        });
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Teklif bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: ['unitPrice', 'quantity'].includes(name) ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quoteUid) {
      setError('Geçersiz teklif ID');
      return;
    }

    // Validation
    if (formData.unitPrice <= 0) {
      setError('Birim fiyat 0\'dan büyük olmalıdır');
      return;
    }

    if (formData.quantity <= 0) {
      setError('Miktar 0\'dan büyük olmalıdır');
      return;
    }

    if (!formData.deliveryDate) {
      setError('Teslim tarihi zorunludur');
      return;
    }

    if (!formData.validityDate) {
      setError('Geçerlilik tarihi zorunludur');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const request: UpdateSupplierQuoteRequest = {
        ...formData,
        deliveryDate: formData.deliveryDate + 'T00:00:00',
        validityDate: formData.validityDate + 'T23:59:59'
      };

      const response = await supplierQuoteService.updateQuote(quoteUid, request);

      if (response.success) {
        setSuccessMessage('Teklifiniz başarıyla kaydedildi');
        // Yeni verileri yükle
        await loadQuote();
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Teklif güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-600 text-center">
            <h2 className="text-2xl font-bold mb-4">Hata</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-gray-600 text-center">
            <h2 className="text-2xl font-bold mb-4">Teklif Bulunamadı</h2>
            <p>Belirtilen teklif bulunamadı veya erişim izniniz yok.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Tedarikçi Teklif Formu</h1>

            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Ürün Bilgileri</h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ürün Adı</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.product.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ürün Kodu</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.product.code}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Açıklama</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.product.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Kategori</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.product.category}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tedarikçi Bilgileri</h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Firma Adı</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.supplier.companyName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Vergi Numarası</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.supplier.taxNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">İletişim Kişisi</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.supplier.contactPerson}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">İletişim Telefonu</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.supplier.contactPhone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">İletişim E-posta</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quote.supplier.contactEmail}</dd>
                </div>
              </dl>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
                    Birim Fiyat
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="unitPrice"
                      id="unitPrice"
                      required
                      min="0.01"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={handleChange}
                      disabled={loading}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₺</span>
                    </div>
                  </div>
                </div>

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
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Para Birimi
                  </label>
                  <select
                    name="currency"
                    id="currency"
                    required
                    value={formData.currency}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="TRY">Türk Lirası (₺)</option>
                    <option value="USD">Amerikan Doları ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="supplierReference" className="block text-sm font-medium text-gray-700">
                    Tedarikçi Referans No
                  </label>
                  <input
                    type="text"
                    name="supplierReference"
                    id="supplierReference"
                    required
                    value={formData.supplierReference}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">
                    Teslim Tarihi
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    id="deliveryDate"
                    required
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="validityDate" className="block text-sm font-medium text-gray-700">
                    Geçerlilik Tarihi
                  </label>
                  <input
                    type="date"
                    name="validityDate"
                    id="validityDate"
                    required
                    value={formData.validityDate}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notlar
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    loading 
                      ? 'bg-indigo-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Kaydediliyor...
                    </div>
                  ) : (
                    'Teklifi Gönder'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 