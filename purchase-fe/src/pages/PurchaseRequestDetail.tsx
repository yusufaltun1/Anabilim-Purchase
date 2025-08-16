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

  useEffect(() => {
    loadRequestData();
  }, [id]);

  const loadRequestData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching request data for ID:', id);
      const requestResponse = await purchaseRequestService.getRequestById(parseInt(id!));
      console.log('Response from server:', requestResponse);

      if (requestResponse.success) {
        console.log('Setting request data:', requestResponse.data);
        setRequest(requestResponse.data as PurchaseRequest);
      } else {
        console.log('Error in response:', requestResponse.message);
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
      await purchaseRequestService.approveRequest(parseInt(id!), { comment: actionComment });
      await loadRequestData();
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Talep onaylanırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      setError(null);
      await purchaseRequestService.rejectRequest(parseInt(id!), { comment: actionComment });
      await loadRequestData();
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Talep reddedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      await purchaseRequestService.cancelRequest(parseInt(id!), { comment: actionComment });
      await loadRequestData();
    } catch (err) {
      console.error('Error canceling request:', err);
      setError('Talep iptal edilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'IN_APPROVAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Taslak';
      case 'IN_APPROVAL':
        return 'Onay Bekliyor';
      case 'APPROVED':
        return 'Onaylandı';
      case 'REJECTED':
        return 'Reddedildi';
      case 'CANCELLED':
        return 'İptal Edildi';
      case 'IN_PROGRESS':
        return 'İşlemde';
      case 'COMPLETED':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  const getCurrentApprover = (request: PurchaseRequest) => {
    if (!request.approvals || request.approvals.length === 0) return null;
    return request.approvals.find(a => a.status === 'PENDING')?.approver || null;
  };

  const PurchaseRequestItems: React.FC<{ items: PurchaseRequestItem[] }> = ({ items }) => {
    return (
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {items.map((item) => (
              <div key={item.id} className="mb-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <div className="bg-white">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {item.product.name}
                      </h3>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {item.product.code}
                      </span>
                    </div>

                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 mb-6">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Miktar</dt>
                        <dd className="mt-1 text-sm text-gray-900">{item.quantity} {item.product.unit}</dd>
                      </div>
                      {item.notes && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Notlar</dt>
                          <dd className="mt-1 text-sm text-gray-900">{item.notes}</dd>
                        </div>
                      )}
                    </dl>

                    {/* Tedarikçi Teklifleri */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Tedarikçi Teklifleri</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tedarikçi
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Birim Fiyat
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Toplam Fiyat
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Teslimat Tarihi
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Durum
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                İşlemler
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {item.supplierQuotes?.map((quote) => (
                              <tr key={quote.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{quote.supplier.name}</div>
                                  <div className="text-sm text-gray-500">{quote.quoteNumber}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {quote.unitPrice} {quote.currency}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {quote.totalPrice} {quote.currency}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(quote.deliveryDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    quote.status === 'RESPONDED'
                                      ? 'bg-green-100 text-green-800'
                                      : quote.status === 'REJECTED'
                                      ? 'bg-red-100 text-red-800'
                                      : quote.status === 'CONVERTED_TO_ORDER'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {quote.status === 'RESPONDED'
                                      ? 'Yanıtlandı'
                                      : quote.status === 'REJECTED'
                                      ? 'Reddedildi'
                                      : quote.status === 'CONVERTED_TO_ORDER'
                                      ? 'Siparişe Dönüştürüldü'
                                      : 'Beklemede'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  {quote.status === 'RESPONDED' && !quote.isSelected && (
                                    <button
                                      onClick={() => {
                                        setSelectedQuote(quote);
                                        setShowConvertModal(true);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-900"
                                    >
                                      Siparişe Dönüştür
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleConvertSuccess = () => {
    loadRequestData();
  };

  if (loading && !request) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {error ? (
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
            ) : (
              <div className="text-center">
                <p className="text-gray-500">Talep bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  console.log('Current request state:', request);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
           

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
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

          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
                <div className="mt-2 flex items-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                  <span className="ml-4 text-sm text-gray-500">
                    Oluşturan: {request.requester.firstName} {request.requester.lastName}
                  </span>
                  {getCurrentApprover(request) && (
                    <span className="ml-4 text-sm text-gray-500">
                      Onaylayacak: {getCurrentApprover(request)?.firstName} {getCurrentApprover(request)?.lastName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/purchase-requests')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Geri
                </button>
              </div>
            </div>

            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Talep Detayları</h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Açıklama</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.description}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(request.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Son Güncelleme</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(request.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {request.items && request.items.length > 0 && (
              <PurchaseRequestItems items={request.items} />
            )}

            {/* Approval Workflow Section */}
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Onay Süreci</h3>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {request.approvals?.map((approval, index) => (
                    <li key={approval.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              approval.status === 'APPROVED' ? 'bg-green-100' :
                              approval.status === 'REJECTED' ? 'bg-red-100' :
                              approval.status === 'PENDING' ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                              {approval.status === 'APPROVED' && (
                                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {approval.status === 'REJECTED' && (
                                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              {approval.status === 'PENDING' && (
                                <span className="text-yellow-600 text-sm font-medium">{index + 1}</span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {approval.approver.firstName} {approval.approver.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {approval.roleName.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            approval.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            approval.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {approval.status === 'APPROVED' ? 'Onaylandı' :
                             approval.status === 'REJECTED' ? 'Reddedildi' :
                             'Bekliyor'}
                          </span>
                          {approval.comment && (
                            <span className="ml-2 text-sm text-gray-500">{approval.comment}</span>
                          )}
                          {approval.actionTakenAt && (
                            <span className="ml-2 text-sm text-gray-500">
                              {new Date(approval.actionTakenAt).toLocaleDateString('tr-TR')}
                            </span>
                          )}
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
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Onay İşlemi
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Bu talebi onaylayabilir veya reddedebilirsiniz.</p>
                  </div>
                  <div className="mt-5">
                    <textarea
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Yorum ekleyin..."
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                    />
                    <div className="mt-5 flex space-x-3">
                      <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Reddet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedQuote && (
        <ConvertRequestToOrderModal
          isOpen={showConvertModal}
          onClose={() => {
            setShowConvertModal(false);
            setSelectedQuote(null);
          }}
          onSuccess={handleConvertSuccess}
          supplierQuoteId={selectedQuote.id}
          requestedQuantity={selectedQuote.quantity}
        />
      )}
    </div>
  );
}; 