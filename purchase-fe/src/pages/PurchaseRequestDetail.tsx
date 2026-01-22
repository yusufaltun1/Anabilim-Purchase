import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { purchaseRequestService } from '../services/purchase-request.service';
import { PurchaseRequest, PurchaseRequestItem, ApprovalAction } from '../types/purchase-request';
import { User } from '../types/user';
import { AddItemsForm } from '../components/AddItemsForm';
import { authService } from '../services/auth.service';
import { formatDate } from '../utils/date';
import { SupplierQuoteList } from '../components/SupplierQuoteList';
import { ConvertRequestToOrderModal } from '../components/ConvertRequestToOrderModal';
import { useNotification } from '../contexts/NotificationContext';
import { supplierQuoteService } from '../services/supplier-quote.service';
import { UpdateSupplierQuoteRequest } from '../types/supplier-quote';

export const PurchaseRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [showAddItems, setShowAddItems] = useState(false);
  const [actionComment, setActionComment] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [quoteFormData, setQuoteFormData] = useState<UpdateSupplierQuoteRequest>({
    unitPrice: 0,
    quantity: 0,
    currency: 'TRY',
    deliveryDate: '',
    validityDate: '',
    notes: '',
    supplierReference: ''
  });
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  useEffect(() => {
    loadRequestData();
  }, [id]);

  const loadRequestData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError('Talep ID\'si bulunamadı');
        return;
      }

      const requestId = parseInt(id);
      if (isNaN(requestId)) {
        setError('Geçersiz talep ID\'si');
        return;
      }

      const requestResponse = await purchaseRequestService.getRequestById(requestId);

      if (requestResponse.success) {
        setRequest(requestResponse.data as PurchaseRequest);
      } else {
        setError(requestResponse.message);
      }
    } catch (err) {
      console.error('Error loading request data:', err);
      setError('Talep bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id) {
        setError('Talep ID\'si bulunamadı');
        return;
      }

      await purchaseRequestService.approveRequest(parseInt(id), { comment: actionComment });
      await loadRequestData();
      showNotification('Talep başarıyla onaylandı', 'success');
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Talep onaylanırken hata oluştu');
      showNotification('Talep onaylanırken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const submitRejection = async () => {
    if (!rejectionComment.trim()) {
      showNotification('Reddetme gerekçesi boş bırakılamaz.', 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (!id) {
        setError('Talep ID\'si bulunamadı');
        return;
      }

      await purchaseRequestService.rejectRequest(parseInt(id), { comment: rejectionComment });
      setShowRejectModal(false);
      setRejectionComment('');
      await loadRequestData();
      showNotification('Talep başarıyla reddedildi', 'success');
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Talep reddedilirken hata oluştu');
      showNotification('Talep reddedilirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    // Bu fonksiyon da benzer bir modal yapısı kullanabilir, şimdilik olduğu gibi bırakıyorum.
    try {
      setLoading(true);
      setError(null);
      
      if (!id) {
        setError('Talep ID\'si bulunamadı');
        return;
      }

      await purchaseRequestService.cancelRequest(parseInt(id), { comment: actionComment });
      await loadRequestData();
      showNotification('Talep başarıyla iptal edildi', 'success');
    } catch (err) {
      console.error('Error canceling request:', err);
      setError('Talep iptal edilirken hata oluştu');
      showNotification('Talep iptal edilirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'IN_APPROVAL': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Taslak';
      case 'IN_APPROVAL': return 'Onay Bekliyor';
      case 'APPROVED': return 'Onaylandı';
      case 'REJECTED': return 'Reddedildi';
      case 'CANCELLED': return 'İptal Edildi';
      case 'IN_PROGRESS': return 'İşlemde';
      case 'COMPLETED': return 'Tamamlandı';
      default: return status;
    }
  };

  const getCurrentApprover = (request: PurchaseRequest) => {
    if (!request.approvals || request.approvals.length === 0) return null;
    return request.approvals.find(a => a.status === 'PENDING')?.approver || null;
  };

  const PurchaseRequestItems: React.FC<{ items: PurchaseRequestItem[] }> = ({ items }) => (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          {items.map((item) => (
            <div key={item.id} className="mb-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <div className="bg-white px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{item.product?.name}</h3>
                <SupplierQuoteList
                  quotes={item.supplierQuotes}
                  onConvertToOrder={(quote) => { setSelectedQuote(quote); setShowConvertModal(true); }}
                  onEditQuote={(quote) => handleEditQuoteOpen(quote)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleConvertSuccess = () => {
    loadRequestData();
  };

  const handleEditQuoteOpen = (quote: any) => {
    setEditingQuote(quote);
    setQuoteError(null);
    setQuoteFormData({
      unitPrice: quote.unitPrice || 0,
      quantity: quote.quantity || 0,
      currency: quote.currency || 'TRY',
      deliveryDate: quote.deliveryDate?.split('T')[0] || '',
      validityDate: quote.validityDate?.split('T')[0] || '',
      notes: quote.notes || '',
      supplierReference: quote.supplierReference || ''
    });
  };

  const handleQuoteChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setQuoteFormData(prev => ({
      ...prev,
      [name]: ['unitPrice', 'quantity'].includes(name) ? parseFloat(value) : value
    }));
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote?.quoteUid) {
      setQuoteError('Geçersiz teklif bilgisi');
      return;
    }

    if (quoteFormData.unitPrice <= 0) {
      setQuoteError('Birim fiyat 0\'dan büyük olmalıdır');
      return;
    }
    if (quoteFormData.quantity <= 0) {
      setQuoteError('Miktar 0\'dan büyük olmalıdır');
      return;
    }
    if (!quoteFormData.deliveryDate) {
      setQuoteError('Teslim tarihi zorunludur');
      return;
    }
    if (!quoteFormData.validityDate) {
      setQuoteError('Geçerlilik tarihi zorunludur');
      return;
    }

    try {
      setQuoteSaving(true);
      setQuoteError(null);
      const request: UpdateSupplierQuoteRequest = {
        ...quoteFormData,
        deliveryDate: quoteFormData.deliveryDate + 'T00:00:00',
        validityDate: quoteFormData.validityDate + 'T00:00:00'
      };
      const response = await supplierQuoteService.updateQuote(editingQuote.quoteUid, request);
      if (!response.success) {
        setQuoteError(response.message);
        return;
      }
      showNotification('Teklif başarıyla kaydedildi', 'success');
      setEditingQuote(null);
      await loadRequestData();
    } catch (err) {
      console.error('Error updating quote:', err);
      setQuoteError('Teklif güncellenirken hata oluştu');
      showNotification('Teklif güncellenirken hata oluştu', 'error');
    } finally {
      setQuoteSaving(false);
    }
  };

  if (loading && !request) {
    return <div className="min-h-screen bg-gray-50"><Navigation /><div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div></div>;
  }

  if (!request) {
    return <div className="min-h-screen bg-gray-50"><Navigation /><div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"><div className="text-center py-12"><p className="text-gray-500">{error || 'Talep bulunamadı'}</p></div></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4"><p>{error}</p></div>}

          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
                <div className="mt-2 flex items-center flex-wrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>{getStatusText(request.status)}</span>
                  <span className="ml-4 text-sm text-gray-500">Oluşturan: {request.requester.firstName} {request.requester.lastName}</span>
                  {getCurrentApprover(request) && <span className="ml-4 text-sm text-gray-500">Onaylayacak: {getCurrentApprover(request)?.firstName} {getCurrentApprover(request)?.lastName}</span>}
                </div>
              </div>
              <div className="flex space-x-3"><button onClick={() => navigate('/purchase-requests')} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Geri</button></div>
            </div>

            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6"><h3 className="text-lg leading-6 font-medium text-gray-900">Talep Detayları</h3></div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-2"><dt className="text-sm font-medium text-gray-500">Açıklama</dt><dd className="mt-1 text-sm text-gray-900">{request.description}</dd></div>
                  <div><dt className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</dt><dd className="mt-1 text-sm text-gray-900">{formatDate(request.createdAt)}</dd></div>
                  <div><dt className="text-sm font-medium text-gray-500">Son Güncelleme</dt><dd className="mt-1 text-sm text-gray-900">{formatDate(request.updatedAt)}</dd></div>
                </dl>
              </div>
            </div>

            {request.items && request.items.length > 0 && <PurchaseRequestItems items={request.items} />}

            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6"><h3 className="text-lg leading-6 font-medium text-gray-900">Onay Süreci</h3></div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {request.approvals?.map((approval) => (
                    <li key={approval.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-4"><div className="text-sm font-medium text-gray-900">{approval.approver.firstName} {approval.approver.lastName}</div><div className="text-sm text-gray-500">{approval.roleName.replace(/_/g, ' ')}</div></div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(approval.status)}`}>{getStatusText(approval.status)}</span>
                          {approval.comment && <span className="ml-2 text-sm text-gray-500">{approval.comment}</span>}
                          {approval.actionTakenAt && <span className="ml-2 text-sm text-gray-500">{formatDate(approval.actionTakenAt)}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {request.status === 'IN_APPROVAL' && getCurrentApprover(request)?.id === authService.getCurrentUser()?.id && (
              <div className="mt-6 bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Onay İşlemi</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500"><p>Bu talebi onaylayabilir veya reddedebilirsiniz.</p></div>
                  <div className="mt-5">
                    <textarea rows={3} className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md" placeholder="Onay yorumu ekleyin (opsiyonel)..." value={actionComment} onChange={(e) => setActionComment(e.target.value)} />
                    <div className="mt-5 flex space-x-3">
                      <button onClick={handleApprove} disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">Onayla</button>
                      <button onClick={() => setShowRejectModal(true)} disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">Reddet</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Talebi Reddet</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Bu talebi reddetmek istediğinizden emin misiniz? Lütfen reddetme gerekçenizi belirtin.</p>
                    </div>
                    <div className="mt-4">
                      <textarea
                        rows={4}
                        className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Reddetme gerekçesi (zorunlu)..."
                        value={rejectionComment}
                        onChange={(e) => setRejectionComment(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" onClick={submitRejection} disabled={loading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">
                  {loading ? 'Reddediliyor...' : 'Talebi Reddet'}
                </button>
                <button type="button" onClick={() => setShowRejectModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedQuote && (
        <ConvertRequestToOrderModal
          isOpen={showConvertModal}
          onClose={() => { setShowConvertModal(false); setSelectedQuote(null); }}
          onSuccess={handleConvertSuccess}
          supplierQuoteId={selectedQuote.id}
          requestedQuantity={selectedQuote.quantity}
        />
      )}

      {editingQuote && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Teklif Gir / Güncelle
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {editingQuote?.supplier?.name} için teklif bilgilerini girin.
                    </p>
                    {quoteError && (
                      <div className="mt-3 text-sm text-red-600">{quoteError}</div>
                    )}
                    <form onSubmit={handleQuoteSubmit} className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
                            Birim Fiyat
                          </label>
                          <input
                            type="number"
                            name="unitPrice"
                            id="unitPrice"
                            min="0.01"
                            step="0.01"
                            value={quoteFormData.unitPrice}
                            onChange={handleQuoteChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                            Miktar
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            min="1"
                            value={quoteFormData.quantity}
                            onChange={handleQuoteChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                            Para Birimi
                          </label>
                          <select
                            name="currency"
                            id="currency"
                            value={quoteFormData.currency}
                            onChange={handleQuoteChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          >
                            <option value="TRY">TRY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
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
                            value={quoteFormData.supplierReference}
                            onChange={handleQuoteChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                            value={quoteFormData.deliveryDate}
                            onChange={handleQuoteChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                            value={quoteFormData.validityDate}
                            onChange={handleQuoteChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Notlar
                          </label>
                          <textarea
                            name="notes"
                            id="notes"
                            rows={3}
                            value={quoteFormData.notes}
                            onChange={handleQuoteChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setEditingQuote(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          disabled={quoteSaving}
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                          disabled={quoteSaving}
                        >
                          {quoteSaving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};