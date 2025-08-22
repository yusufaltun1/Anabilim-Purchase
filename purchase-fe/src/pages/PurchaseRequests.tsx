import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { purchaseRequestService } from '../services/purchase-request.service';
import { PurchaseRequest } from '../types/purchase-request';

export const PurchaseRequests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'my-requests' | 'pending'>('all');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;

      console.log('Loading requests with filter:', filter);

      switch (filter) {
        case 'my-requests':
          console.log('Fetching my requests...');
          response = await purchaseRequestService.getMyRequests();
          console.log('My requests response:', response);
          break;
        case 'pending':
          console.log('Fetching all requests for pending filter...');
          // Tüm talepleri al ve frontend'de onay bekleyenleri filtrele
          const allRequestsResponse = await purchaseRequestService.getAllRequests();
          if (allRequestsResponse.success) {
            const allRequests = Array.isArray(allRequestsResponse.data) ? allRequestsResponse.data : [allRequestsResponse.data];
            const pendingRequests = allRequests.filter((req: PurchaseRequest) => req.status === 'IN_APPROVAL');
            console.log('Filtered pending requests:', pendingRequests);
            response = {
              success: true,
              message: 'Onay bekleyen talepler başarıyla alındı',
              data: pendingRequests,
              timestamp: new Date().toISOString(),
              errorCode: null
            };
          } else {
            response = allRequestsResponse;
          }
          console.log('Pending approvals response:', response);
          break;
        default:
          console.log('Fetching all requests...');
          response = await purchaseRequestService.getAllRequests();
          console.log('All requests response:', response);
      }

      if (response.success) {
        // Backend directly returns the array of requests
        const requestsData = response.data;
        console.log('Requests data:', requestsData);
        
        if (Array.isArray(requestsData)) {
          console.log('Setting requests array:', requestsData);
          setRequests(requestsData);
        } else if (requestsData && typeof requestsData === 'object') {
          console.log('Setting single request:', [requestsData]);
          setRequests([requestsData]);
        } else {
          console.log('Setting empty requests array');
          setRequests([]);
        }
      } else {
        console.log('Response not successful:', response.message);
        setError(response.message);
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Talepler yüklenirken hata oluştu');
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
    const pendingApproval = request.approvals.find(a => a.status === 'PENDING');
    return pendingApproval?.approver || null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Satın Alma Talepleri</h1>
              <p className="mt-2 text-gray-600">
                Tüm satın alma taleplerini görüntüleyin ve yönetin
              </p>
            </div>
            <button
              onClick={() => navigate('/purchase-requests/create')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Yeni Talep Oluştur
            </button>
          </div>

          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Tüm Talepler
              </button>
              <button
                onClick={() => {
                  console.log('Taleplerim button clicked, setting filter to my-requests');
                  setFilter('my-requests');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'my-requests'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Taleplerim
              </button>
              <button
                onClick={() => {
                  console.log('Onay Bekleyenler button clicked, setting filter to pending');
                  setFilter('pending');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'pending'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Onay Bekleyenler
              </button>
            </div>
          </div>

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

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {filter === 'my-requests' && 'Henüz talep oluşturmadınız'}
                  {filter === 'pending' && 'Onay bekleyen talep bulunmuyor'}
                  {filter === 'all' && 'Henüz talep bulunmuyor'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <li key={request.id}>
                    <div className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {request.title}
                            </p>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                              {getStatusText(request.status)}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/purchase-requests/${request.id}`)}
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                              Detay
                            </button>
                            <button
                              onClick={() => navigate(`/purchase-requests/edit/${request.id}`)}
                              className="text-green-600 hover:text-green-900 text-sm font-medium"
                            >
                              Düzenle
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {request.requester.firstName} {request.requester.lastName}
                            </p>
                            {getCurrentApprover(request) && (
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                Onaylayacak: {getCurrentApprover(request)?.firstName} {getCurrentApprover(request)?.lastName}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Oluşturulma: {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 