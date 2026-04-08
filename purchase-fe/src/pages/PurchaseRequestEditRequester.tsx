import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { purchaseRequestService } from '../services/purchase-request.service';
import { CreatePurchaseRequestItem, PurchaseRequest } from '../types/purchase-request';
import { authService } from '../services/auth.service';

type RequesterEditForm = {
  title: string;
  description: string;
  items: (CreatePurchaseRequestItem & { id?: number })[];
};

export const PurchaseRequestEditRequester = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const canEditRequest = authService.hasCapability('REQUEST_EDIT');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RequesterEditForm>({
    title: '',
    description: '',
    items: [],
  });

  useEffect(() => {
    if (!canEditRequest) {
      navigate('/purchase-requests');
      return;
    }
    if (id) loadRequest();
  }, [id, canEditRequest, navigate]);

  const normalizeItems = (items: any): any[] => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (Array.isArray(items?.content)) return items.content;
    if (Array.isArray(items?.data)) return items.data;
    return Object.values(items).filter((x: any) => x && typeof x === 'object');
  };

  const loadRequest = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await purchaseRequestService.getPurchaseRequestById(parseInt(id, 10));
      if (!response.success || !response.data) {
        setError(response.message || 'Talep yüklenemedi');
        return;
      }

      const req = ((response.data as any)?.data ?? response.data) as PurchaseRequest;
      const mappedItems = normalizeItems(req.items).map((item: any) => ({
        id: item.id,
        productName: item.productName ?? item.product?.name ?? '',
        description: item.description ?? item.product?.description ?? '',
        quantity: item.quantity ?? 1,
        imageBase64: item.imageBase64 ?? '',
        productLink: item.productLink ?? '',
        potentialSupplierIds: item.potentialSupplierIds ?? item.potentialSuppliers?.map((s: any) => s.id) ?? [],
        estimatedDeliveryDate: item.estimatedDeliveryDate
          ? String(item.estimatedDeliveryDate).slice(0, 19)
          : '',
        notes: item.notes ?? '',
      }));

      setFormData({
        title: req.title ?? '',
        description: req.description ?? '',
        items: mappedItems,
      });
    } catch (err: any) {
      setError(err.message || 'Talep yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productName: '',
          description: '',
          quantity: 1,
          imageBase64: '',
          productLink: '',
          potentialSupplierIds: [],
          estimatedDeliveryDate: '',
          notes: '',
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const updateItem = (index: number, field: keyof CreatePurchaseRequestItem | 'id', value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const handleImageUpload = (index: number, file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => updateItem(index, 'imageBase64', (e.target?.result as string) || '');
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        items: formData.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          description: item.description,
          imageBase64: item.imageBase64,
          productLink: item.productLink,
          quantity: item.quantity,
          potentialSupplierIds: item.potentialSupplierIds || [],
          estimatedDeliveryDate: item.estimatedDeliveryDate
            ? item.estimatedDeliveryDate.length === 16
              ? `${item.estimatedDeliveryDate}:00`
              : item.estimatedDeliveryDate
            : undefined,
          notes: item.notes,
        })),
      };

      const response = await purchaseRequestService.updateRequest(parseInt(id, 10), payload);
      if (!response.success) {
        setError(response.message || 'Talep güncellenemedi');
        return;
      }
      navigate('/purchase-requests');
    } catch (err: any) {
      setError(err.message || 'Talep güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-10 text-center text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Talep Bilgilerini Düzenle</h1>
            <button
              onClick={() => navigate('/purchase-requests')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Geri
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Başlık</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Talep Kalemleri</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                >
                  + Kalem Ekle
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, idx) => (
                  <div key={`${item.id ?? 'new'}-${idx}`} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-800">Kalem {idx + 1}</h3>
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-600 text-sm">Sil</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
                        <input
                          required
                          value={item.productName}
                          onChange={(e) => updateItem(idx, 'productName', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Miktar</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ürün Linki</label>
                        <input
                          type="url"
                          value={item.productLink}
                          onChange={(e) => updateItem(idx, 'productLink', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tahmini Teslimat</label>
                        <input
                          type="datetime-local"
                          value={item.estimatedDeliveryDate || ''}
                          onChange={(e) => updateItem(idx, 'estimatedDeliveryDate', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Ürün Resmi</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleImageUpload(idx, f);
                          }}
                          className="mt-1 block w-full text-sm"
                        />
                        {item.imageBase64 && (
                          <img src={item.imageBase64} alt="preview" className="mt-2 h-28 rounded border object-cover" />
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Notlar</label>
                        <textarea
                          rows={2}
                          value={item.notes || ''}
                          onChange={(e) => updateItem(idx, 'notes', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/purchase-requests')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving || formData.items.length === 0}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
