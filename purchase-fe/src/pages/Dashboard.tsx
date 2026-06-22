import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { purchaseRequestService } from '../services/purchase-request.service';
import { PurchaseRequest } from '../types/purchase-request';
import { authService } from '../services/auth.service';
import { getSeenPendingApprovalIds, pruneSeenPendingApprovals } from '../utils/dashboard-pending-seen';

export const Dashboard = () => {
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PurchaseRequest[]>([]);
  const [seniorForwardedApprovals, setSeniorForwardedApprovals] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userInfo = authService.getUserInfo();
  const currentUserId = authService.getCurrentUser()?.id;

  const roles = authService.getEffectiveRoles();
  const isPurchasingStaff =
    roles.includes('SATIN_ALMA_DEPARTMANI') || roles.includes('PURCHASE_MANAGER');

  const seniorForwardedIds = new Set(
    seniorForwardedApprovals.map((r) => r.id).filter((id): id is number => id != null)
  );

  const pendingApprovalsDisplay = isPurchasingStaff
    ? pendingApprovals.filter((r) => r.id != null && !seniorForwardedIds.has(r.id))
    : pendingApprovals;

  useEffect(() => {
    loadPurchaseRequests();
  }, []);

  const loadPurchaseRequests = async () => {
    try {
      setLoading(true);
      const purchasing =
        authService.getEffectiveRoles().includes('SATIN_ALMA_DEPARTMANI') ||
        authService.getEffectiveRoles().includes('PURCHASE_MANAGER');

      const pendingPromise = purchaseRequestService.getPendingApprovals();
      const forwardedPromise = purchasing
        ? purchaseRequestService.getSeniorForwardedPendingApprovals()
        : Promise.resolve({
            success: true as const,
            message: '',
            data: [] as PurchaseRequest[],
            timestamp: '',
            errorCode: null as string | null,
          });

      const [purchaseRequestsResponse, pendingResponse, forwardedResponse] = await Promise.all([
        purchaseRequestService.getMyRequests(),
        pendingPromise,
        forwardedPromise,
      ]);

      if (purchaseRequestsResponse.success && purchaseRequestsResponse.data) {
        const requests = Array.isArray(purchaseRequestsResponse.data)
          ? purchaseRequestsResponse.data
          : [purchaseRequestsResponse.data];
        setPurchaseRequests(requests);
      }

      let pending: PurchaseRequest[] = [];
      if (pendingResponse.success && pendingResponse.data) {
        pending = Array.isArray(pendingResponse.data) ? pendingResponse.data : [pendingResponse.data];
        setPendingApprovals(pending);
      } else {
        setPendingApprovals([]);
      }

      let forwardedList: PurchaseRequest[] = [];
      if (forwardedResponse.success && forwardedResponse.data) {
        forwardedList = Array.isArray(forwardedResponse.data)
          ? forwardedResponse.data
          : [forwardedResponse.data];
      }
      setSeniorForwardedApprovals(forwardedList);

      const uid = authService.getCurrentUser()?.id;
      if (uid) {
        const pendingIds = pending.map((r) => r.id).filter((id): id is number => id != null);
        const forwardedIdsForPrune = forwardedList
          .map((r) => r.id)
          .filter((id): id is number => id != null);
        pruneSeenPendingApprovals(uid, [...new Set([...pendingIds, ...forwardedIdsForPrune])]);
      }
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const seenPendingIds = currentUserId ? getSeenPendingApprovalIds(currentUserId) : new Set<number>();



  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // Bu ay içinde oluşturulan satın alma taleplerini hesapla
  const getThisMonthRequests = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return purchaseRequests.filter(request => {
      const requestDate = new Date(request.createdAt || '');
      return requestDate >= startOfMonth;
    }).length;
  };

  // Bugün oluşturulan satın alma taleplerini hesapla
  const getTodayRequests = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return purchaseRequests.filter(request => {
      const requestDate = new Date(request.createdAt || '');
      return requestDate >= today && requestDate < tomorrow;
    }).length;
  };

  const getPendingApprovalRequests = () => pendingApprovalsDisplay.length;

  // İşlemde olan satın alma taleplerini hesapla
  const getInProgressRequests = () => {
    return purchaseRequests.filter(request => 
      request.status === 'IN_PROGRESS' || request.status === 'APPROVED' || request.status === 'PARTIAL_APPROVAL'
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Hoş geldiniz, {userInfo?.displayName || userInfo?.firstName || 'Kullanıcı'}!
              </p>
            </div>

          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-blue-500 rounded-md p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Bu Ay Talepler</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {getThisMonthRequests()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-purple-500 rounded-md p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Bugün Talepler</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {getTodayRequests()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-500 rounded-md p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Onay Bekleyen</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {getPendingApprovalRequests()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green-500 rounded-md p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">İşlemde</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {getInProgressRequests()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isPurchasingStaff && (
          <div className="mb-8 px-4 sm:px-0">
            <div className="bg-white shadow rounded-lg border border-emerald-100">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Onaylananlar</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Üst onaycı tarafından onaylanıp size iletilen talepler (satın alma sürecine geçmeye hazır).
                  Bu liste, zincirde üst kalmadığında bir kullanıcıya yönlendirilen taleplerden oluşur.
                </p>
              </div>

              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Yükleniyor...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {[...seniorForwardedApprovals]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
                    )
                    .slice(0, 8)
                    .map((request) => {
                      const isSeen = seenPendingIds.has(request.id);
                      return (
                        <div
                          key={request.id}
                          className={`p-6 transition-colors ${
                            isSeen
                              ? 'bg-gray-50/90 hover:bg-gray-100/90'
                              : 'bg-emerald-50/40 border-l-4 border-emerald-500 hover:bg-emerald-50/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-2">
                                {!isSeen && (
                                  <span
                                    className="flex h-2 w-2 rounded-full bg-emerald-600 shrink-0"
                                    title="Henüz görüntülenmedi"
                                    aria-hidden
                                  />
                                )}
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-900">
                                  Üst onaydan iletildi
                                </div>
                                <h4 className="text-sm font-medium text-gray-900 truncate min-w-0">
                                  {request.title || `Talep #${request.id}`}
                                </h4>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span>
                                  {request.requester?.firstName} {request.requester?.lastName}
                                </span>
                                <span>•</span>
                                <span>{request.items?.length || 0} ürün</span>
                                <span>•</span>
                                <span>
                                  {new Date(request.createdAt || '').toLocaleDateString('tr-TR')}
                                </span>
                                {isSeen && <span className="text-gray-400">• Görüntülendi</span>}
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => navigate(`/purchase-requests/${request.id}`)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-emerald-900 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                              >
                                Detay
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {seniorForwardedApprovals.length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500">
                        Henüz üst onaycıdan size iletilmiş talep yok.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requests Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 sm:px-0 mb-8">
          {/* Active Requests List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">İşlemde Olan Talepler</h3>
              <p className="mt-1 text-sm text-gray-500">
                Sizin oluşturduğunuz, onaylanmış ve işlemde olan satın alma talepleri
              </p>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {purchaseRequests
                  .filter(request => 
                    request.status === 'IN_PROGRESS' || 
                    request.status === 'APPROVED' || 
                    request.status === 'PARTIALLY_APPROVED'
                  )
                  .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
                  .slice(0, 5)
                  .map((request) => (
                    <div key={request.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              İşlemde
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {request.title || `Talep #${request.id}`}
                            </h4>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{request.requester?.firstName} {request.requester?.lastName}</span>
                            <span>•</span>
                            <span>{request.items?.length || 0} ürün</span>
                            <span>•</span>
                            <span>{new Date(request.createdAt || '').toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            onClick={() => navigate(`/purchase-requests/${request.id}`)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Detay
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {purchaseRequests.filter(request => 
                  request.status === 'IN_PROGRESS' || 
                  request.status === 'APPROVED' || 
                  request.status === 'PARTIALLY_APPROVED'
                ).length === 0 && (
                  <div className="p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">İşlemde talep bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Onaylanmış veya işlemde olan satın alma talebi yok.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {purchaseRequests.filter(request => 
              request.status === 'IN_PROGRESS' || 
              request.status === 'APPROVED' || 
              request.status === 'PARTIALLY_APPROVED'
            ).length > 5 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => navigate('/purchase-requests')}
                  className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Tüm işlemdeki talepleri görüntüle →
                </button>
              </div>
            )}
          </div>

          {/* Pending Approval Requests List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Onay Bekleyen Talepler</h3>
              <p className="mt-1 text-sm text-gray-500">
                Sizin onayınızı bekleyen talepler. Sol şerit ve vurgulu arka plan: detayı henüz açmadınız;
                soluk gri: görüntülediniz. Rozet: talebi kimin açtığı.
              </p>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {[...pendingApprovalsDisplay]
                  .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
                  .slice(0, 5)
                  .map((request) => {
                    const isOwnRequest = currentUserId != null && request.requester?.id === currentUserId;
                    const isSeen = seenPendingIds.has(request.id);
                    return (
                      <div
                        key={request.id}
                        className={`p-6 transition-colors ${
                          isSeen
                            ? 'bg-gray-50/90 hover:bg-gray-100/90'
                            : 'bg-indigo-50/50 border-l-4 border-indigo-500 hover:bg-indigo-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              {!isSeen && (
                                <span
                                  className="flex h-2 w-2 rounded-full bg-indigo-600 shrink-0"
                                  title="Henüz görüntülenmedi"
                                  aria-hidden
                                />
                              )}
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Onay Bekliyor
                              </div>
                              {isOwnRequest ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-800">
                                  Kendi talebiniz
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-900">
                                  Size onay bekliyor
                                </span>
                              )}
                              <h4 className="text-sm font-medium text-gray-900 truncate min-w-0">
                                {request.title || `Talep #${request.id}`}
                              </h4>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>{request.requester?.firstName} {request.requester?.lastName}</span>
                              <span>•</span>
                              <span>{request.items?.length || 0} ürün</span>
                              <span>•</span>
                              <span>{new Date(request.createdAt || '').toLocaleDateString('tr-TR')}</span>
                              {isSeen && <span className="text-gray-400">• Görüntülendi</span>}
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => navigate(`/purchase-requests/${request.id}`)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Detay
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {pendingApprovalsDisplay.length === 0 && (
                  <div className="p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Onay bekleyen talep bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Onay sürecinde bekleyen satın alma talebi yok.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {pendingApprovalsDisplay.length > 5 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => navigate('/purchase-requests?status=pending')}
                  className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Tüm onay bekleyen talepleri görüntüle →
                </button>
              </div>
            )}
          </div>
        </div>



      </div>
    </div>
  );
}; 