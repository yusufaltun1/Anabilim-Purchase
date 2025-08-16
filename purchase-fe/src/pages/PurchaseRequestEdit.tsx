import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { PurchaseRequestItems } from '../components/PurchaseRequestItems';
import { purchaseRequestService } from '../services/purchase-request.service';
import { PurchaseRequestItem, PurchaseRequest } from '../types/purchase-request';

export const PurchaseRequestEdit = () => {
  console.log('PurchaseRequestEdit component rendered');
  const navigate = useNavigate();
  const params = useParams();
  console.log('URL Parameters:', params);
  const { id } = params;
  console.log('Extracted ID:', id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    items: [] as PurchaseRequestItem[]
  });

  useEffect(() => {
    console.log('PurchaseRequestEdit useEffect triggered, id:', id);
    if (id) {
      console.log('Calling loadPurchaseRequest with id:', id);
      loadPurchaseRequest();
    } else {
      console.log('No ID available, skipping loadPurchaseRequest');
    }
  }, [id]);

  const loadPurchaseRequest = async () => {
    if (!id) {
      console.log('loadPurchaseRequest called without ID');
      return;
    }

    try {
      console.log('Loading purchase request data...');
      setLoading(true);
      setError(null);
      const response = await purchaseRequestService.getPurchaseRequestById(parseInt(id));
      console.log('Purchase request response:', response);
      
      if (response.success && response.data) {
        const purchaseRequest = response.data as PurchaseRequest;
        console.log('Setting form data with:', purchaseRequest);
        setFormData({
          title: purchaseRequest.title || '',
          description: purchaseRequest.description || '',
          items: purchaseRequest.items || []
        });
      } else {
        console.error('Error in response:', response.message);
        setError(response.message);
      }
    } catch (err: any) {
      console.error('Error loading purchase request:', err);
      setError(err.message || 'Satın alma talebi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await purchaseRequestService.updateItems(parseInt(id), formData);
      
      if (response.success) {
        navigate('/purchase-requests');
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Satın alma talebi güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">Yükleniyor...</div>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Satın Alma Talebi Düzenle</h1>
            <button
              onClick={() => navigate('/purchase-requests')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Geri
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Başlık
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Açıklama
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Ürünler</h2>
              <PurchaseRequestItems
                items={formData.items}
                onChange={(items) => setFormData(prev => ({ ...prev, items }))}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/purchase-requests')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 