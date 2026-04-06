import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { purchaseRequestService } from '../services/purchase-request.service';
import {
  PurchaseRequest,
  PurchaseRequestItem,
  Supplier,
  SupplierQuote,
  ApprovalAction,
  ParentApproverCandidate,
  PurchaseRequestAttachment,
} from '../types/purchase-request';
import { User } from '../types/user';
import { AddItemsForm } from '../components/AddItemsForm';
import { authService } from '../services/auth.service';
import { formatDate } from '../utils/date';
import { SupplierQuoteList } from '../components/SupplierQuoteList';
import { ConvertRequestToOrderModal } from '../components/ConvertRequestToOrderModal';
import { useNotification } from '../contexts/NotificationContext';
import { supplierQuoteService } from '../services/supplier-quote.service';
import { UpdateSupplierQuoteRequest } from '../types/supplier-quote';
import { markPendingApprovalSeen } from '../utils/dashboard-pending-seen';

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
  const [returnToUserId, setReturnToUserId] = useState<number | ''>('');
  const [nextApproverUserId, setNextApproverUserId] = useState<number | ''>('');
  const [nextApproverCandidatesList, setNextApproverCandidatesList] = useState<ParentApproverCandidate[]>([]);
  const [sendToUserId, setSendToUserId] = useState<number | ''>('');
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
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Karşı teklif popover (kalem bazlı)
  const [counterOfferPopoverItemId, setCounterOfferPopoverItemId] = useState<number | null>(null);
  const [counterOfferQuote, setCounterOfferQuote] = useState<any>(null);
  const [counterOfferQuantity, setCounterOfferQuantity] = useState<number>(0);
  const [counterOfferUnitPrice, setCounterOfferUnitPrice] = useState<number>(0);
  const [counterOfferSaving, setCounterOfferSaving] = useState(false);
  const [counterOfferError, setCounterOfferError] = useState<string | null>(null);
  const canApproveRequest = authService.hasCapability('REQUEST_APPROVE');
  const canQuoteCollect = authService.hasCapability('QUOTE_COLLECT');
  const canOrderCreate = authService.hasCapability('ORDER_CREATE');
  const canEditRequest = authService.hasCapability('REQUEST_EDIT');

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
        const req = requestResponse.data as PurchaseRequest;
        setRequest(req);
        const uid = authService.getCurrentUser()?.id;
        if (
          uid &&
          req.status === 'IN_APPROVAL' &&
          req.approvals?.some((a) => a.status === 'PENDING' && a.approver?.id === uid)
        ) {
          markPendingApprovalSeen(uid, requestId);
        }
        if ((req?.status === 'IN_APPROVAL' || req?.status === 'IN_PROGRESS' || req?.status === 'PARTIAL_APPROVAL') && req.approvals?.some((a) => a.status === 'PENDING') && authService.getCurrentUser()?.id === req.approvals?.find((a) => a.status === 'PENDING')?.approver?.id) {
          if (req.nextApproverCandidates && req.nextApproverCandidates.length > 0) {
            setNextApproverCandidatesList(req.nextApproverCandidates);
            const oneSelectable = req.nextApproverCandidates.find((c) => c.userId != null);
            if (req.nextApproverCandidates.filter((c) => c.userId != null).length === 1 && oneSelectable) setNextApproverUserId(oneSelectable.userId!);
          } else {
            purchaseRequestService.getFirstApproverCandidates().then((list) => {
              setNextApproverCandidatesList(list);
              const selectable = list.filter((c) => c.userId != null);
              if (selectable.length === 1) setNextApproverUserId(selectable[0].userId!);
            }).catch(() => setNextApproverCandidatesList([]));
          }
        } else {
          setNextApproverCandidatesList([]);
          setNextApproverUserId('');
          setSendToUserId('');
        }
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

  const selectableCandidates = nextApproverCandidatesList.filter((c) => c.userId != null);
  const handleApprove = async () => {
    const candidates = nextApproverCandidatesList;
    if (selectableCandidates.length > 1 && (nextApproverUserId === '' || nextApproverUserId == null)) {
      showNotification('Birden fazla üst grubunuz var. Lütfen onayı hangi üst gruba ileteceğinizi seçin.', 'error');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError('Talep ID\'si bulunamadı');
        return;
      }

      const payload = {
        comment: actionComment,
        nextApproverUserId: selectableCandidates.length >= 1 ? (nextApproverUserId === '' ? selectableCandidates[0].userId! : nextApproverUserId) : undefined,
        sendToUserId: request?.hasNoNextApprover ? (sendToUserId === '' ? null : sendToUserId) : undefined,
      };
      await purchaseRequestService.approveRequest(parseInt(id), payload);
      setNextApproverUserId('');
      setSendToUserId('');
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

      const payload = {
        comment: rejectionComment,
        rejectionReason: rejectionComment,
        returnToUserId: returnToUserId === '' ? null : returnToUserId,
      };
      await purchaseRequestService.rejectRequest(parseInt(id), payload);
      setShowRejectModal(false);
      setRejectionComment('');
      setReturnToUserId('');
      await loadRequestData();
      if (payload.returnToUserId != null) {
        showNotification('Talep seçtiğiniz kişiye geri gönderildi', 'success');
      } else {
        showNotification('Talep başarıyla reddedildi', 'success');
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Talep reddedilirken hata oluştu');
      showNotification('Talep reddedilirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  /** Reddederken geri gönderilebilecek kişiler: talep sahibi + onay zincirinde mevcut adımdan önceki onaycılar */
  const getReturnToCandidates = (): { id: number; label: string }[] => {
    if (!request) return [];
    const pending = request.approvals?.find((a) => a.status === 'PENDING');
    const currentStepOrder = pending?.stepOrder ?? 0;
    const candidates: { id: number; label: string }[] = [];
    const seen = new Set<number>();
    if (request.requester?.id && !seen.has(request.requester.id)) {
      seen.add(request.requester.id);
      const name = [request.requester.firstName, request.requester.lastName].filter(Boolean).join(' ') || request.requester.email;
      candidates.push({ id: request.requester.id, label: `${name} (Talep sahibi)` });
    }
    request.approvals
      ?.filter((a) => a.stepOrder < currentStepOrder && a.approver?.id)
      .forEach((a) => {
        if (a.approver && !seen.has(a.approver.id)) {
          seen.add(a.approver.id);
          const name = [a.approver.firstName, a.approver.lastName].filter(Boolean).join(' ') || a.approver.email;
          candidates.push({ id: a.approver.id, label: `${name} (Onaycı - Adım ${a.stepOrder})` });
        }
      });
    return candidates;
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
      case 'PARTIAL_APPROVAL': return 'bg-indigo-100 text-indigo-800';
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
      case 'PARTIAL_APPROVAL': return 'Kısmi Onay';
      case 'COMPLETED': return 'Tamamlandı';
      default: return status;
    }
  };

  /** Onay adımı durumu (PENDING, APPROVED, REJECTED) */
  const getApprovalStepStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Beklemede';
      case 'APPROVED': return 'Onaylandı';
      case 'REJECTED': return 'Reddedildi';
      default: return status;
    }
  };

  const getApprovalStepStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCurrentApprover = (request: PurchaseRequest) => {
    if (!request.approvals || request.approvals.length === 0) return null;
    return request.approvals.find(a => a.status === 'PENDING')?.approver || null;
  };

  const handleAddDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    const ok = file.type === 'application/pdf' || file.type.startsWith('image/');
    if (!ok) {
      showNotification('Sadece PDF veya resim (JPEG, PNG, GIF, WebP) yükleyebilirsiniz.', 'error');
      return;
    }
    e.target.value = '';
    try {
      setUploadingAttachment(true);
      await purchaseRequestService.uploadAttachment(parseInt(id), file);
      await loadRequestData();
      showNotification('Belge yüklendi.', 'success');
    } catch (err) {
      console.error('Belge yükleme hatası:', err);
      showNotification(err instanceof Error ? err.message : 'Belge yüklenemedi.', 'error');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleDownloadAttachment = async (att: PurchaseRequestAttachment) => {
    if (!id) return;
    try {
      const { blobUrl, fileName } = await purchaseRequestService.downloadAttachment(parseInt(id), att.id);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('İndirme hatası:', err);
      showNotification(err instanceof Error ? err.message : 'Belge indirilemedi.', 'error');
    }
  };

  const PurchaseRequestItems: React.FC<{ items: PurchaseRequestItem[] }> = ({ items }) => {
    const normalizeQuotes = (raw: PurchaseRequestItem['supplierQuotes']): SupplierQuote[] => {
      if (!raw) return [];
      return Array.isArray(raw) ? raw : Object.values(raw as Record<string, SupplierQuote>);
    };

    const normalizeSuppliers = (raw: PurchaseRequestItem['potentialSuppliers']): Supplier[] => {
      if (!raw) return [];
      const arr = Array.isArray(raw) ? raw : Object.values(raw as Record<string, Supplier>);
      return arr as Supplier[];
    };

    const itemImageSrc = (item: PurchaseRequestItem): string | null => {
      const img = item.imageBase64?.trim();
      if (!img) return null;
      if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://')) return img;
      return `data:image/jpeg;base64,${img}`;
    };

    const displayProductName = (item: PurchaseRequestItem) =>
      item.productName?.trim() || item.product?.name?.trim() || `Kalem #${item.id}`;

    return (
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1 sm:px-0">Satın alma kalemleri</h2>
            <p className="text-sm text-gray-600 mb-6 px-1 sm:px-0">
              Her kalem için ürün bilgisi, talep detayları ve tedarikçi teklifleri aşağıdadır.
            </p>
            {items.map((item, index) => {
              const quotes = normalizeQuotes(item.supplierQuotes);
              const suppliers = normalizeSuppliers(item.potentialSuppliers);
              const imgSrc = itemImageSrc(item);
              const productCode =
                item.product?.code != null && String(item.product.code).trim() !== ''
                  ? item.product.code
                  : null;

              return (
                <div
                  key={item.id}
                  className="mb-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white"
                >
                  <div className="border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                        Kalem {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">{displayProductName(item)}</h3>
                      {productCode && (
                        <span className="text-sm text-gray-500 font-mono">Kod: {productCode}</span>
                      )}
                      {item.productId != null && item.productId > 0 && (
                        <span className="text-xs text-gray-400">Ürün ID: {item.productId}</span>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                      <div className="lg:col-span-4">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Ürün görseli</p>
                        {imgSrc ? (
                          <a
                            href={imgSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:ring-2 hover:ring-indigo-300 transition-shadow"
                          >
                            <img
                              src={imgSrc}
                              alt={displayProductName(item)}
                              className="w-full max-h-72 object-contain object-center bg-gray-50"
                            />
                          </a>
                        ) : (
                          <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                            Görsel eklenmemiş
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-8 space-y-5">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="rounded-md bg-gray-50 px-3 py-2 border border-gray-100">
                            <dt className="text-gray-500 font-medium">Miktar</dt>
                            <dd className="mt-0.5 text-gray-900 font-semibold">{item.quantity ?? '—'}</dd>
                          </div>
                          <div className="rounded-md bg-gray-50 px-3 py-2 border border-gray-100">
                            <dt className="text-gray-500 font-medium">Tahmini teslim tarihi</dt>
                            <dd className="mt-0.5 text-gray-900 font-semibold">
                              {formatDate(item.estimatedDeliveryDate)}
                            </dd>
                          </div>
                          {item.product?.unit && (
                            <div className="rounded-md bg-gray-50 px-3 py-2 border border-gray-100 sm:col-span-2">
                              <dt className="text-gray-500 font-medium">Birim</dt>
                              <dd className="mt-0.5 text-gray-900">{item.product.unit}</dd>
                            </div>
                          )}
                          {(() => {
                            const cat = item.product?.category;
                            return (
                              cat != null &&
                              String(cat).trim() !== '' && (
                                <div className="rounded-md bg-gray-50 px-3 py-2 border border-gray-100 sm:col-span-2">
                                  <dt className="text-gray-500 font-medium">Kategori</dt>
                                  <dd className="mt-0.5 text-gray-900">{String(cat)}</dd>
                                </div>
                              )
                            );
                          })()}
                        </dl>

                        {(item.description?.trim() ||
                          (item.product?.description && item.product.description.trim())) && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Açıklama
                            </h4>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap rounded-md border border-gray-100 bg-white px-3 py-2">
                              {item.description?.trim() || item.product?.description}
                            </p>
                          </div>
                        )}

                        {item.productLink?.trim() && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Ürün linki
                            </h4>
                            <a
                              href={item.productLink.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-800 break-all underline"
                            >
                              {item.productLink.trim()}
                            </a>
                          </div>
                        )}

                        {item.notes?.trim() && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Notlar
                            </h4>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap rounded-md border border-amber-100 bg-amber-50/50 px-3 py-2">
                              {item.notes.trim()}
                            </p>
                          </div>
                        )}

                        {suppliers.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Potansiyel tedarikçiler
                            </h4>
                            <ul className="space-y-2">
                              {suppliers.map((s) => (
                                <li
                                  key={s.id}
                                  className="text-sm rounded-md border border-gray-100 bg-white px-3 py-2 shadow-sm"
                                >
                                  <span className="font-medium text-gray-900">{s.name}</span>
                                  {s.contactPerson && (
                                    <span className="text-gray-600"> · {s.contactPerson}</span>
                                  )}
                                  {s.contactPhone && (
                                    <span className="block text-xs text-gray-500 mt-0.5">{s.contactPhone}</span>
                                  )}
                                  {s.contactEmail && (
                                    <a
                                      href={`mailto:${s.contactEmail}`}
                                      className="block text-xs text-indigo-600 hover:underline mt-0.5"
                                    >
                                      {s.contactEmail}
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-5 sm:px-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Tedarikçi teklifleri</h4>
                    {quotes.length === 0 && (
                      <p className="mb-4 text-sm text-gray-500">
                        Bu kalem için teklif girildikten sonra, tabloda her tedarikçi satırında karşı teklif
                        girebilirsiniz.
                      </p>
                    )}
                    <SupplierQuoteList
                      quotes={quotes}
                      onConvertToOrder={
                        canOrderCreate ? (quote) => { setSelectedQuote(quote); setShowConvertModal(true); } : undefined
                      }
                      onEditQuote={canQuoteCollect ? (quote) => handleEditQuoteOpen(quote) : undefined}
                      onEnterCounterOffer={
                        canQuoteCollect ? (quote) => openCounterOfferPopover(item, quote) : undefined
                      }
                      onEditQuoteFromCounterOffer={
                        canQuoteCollect ? (quote) => handleEditQuoteOpenFromCounterOffer(quote) : undefined
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

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

  /** Karşı teklif hücresine tıklanınca güncelleme modalını karşı teklif miktarlarıyla açar */
  const handleEditQuoteOpenFromCounterOffer = (quote: any) => {
    setEditingQuote(quote);
    setQuoteError(null);
    setQuoteFormData({
      unitPrice: quote.counterOfferUnitPrice != null ? quote.counterOfferUnitPrice : (quote.unitPrice || 0),
      quantity: quote.counterOfferQuantity != null ? quote.counterOfferQuantity : (quote.quantity || 0),
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

  /** Karşı teklif: her tedarikçi teklifi satırından açılır */
  const openCounterOfferPopover = (item: PurchaseRequestItem, quote: SupplierQuote) => {
    setCounterOfferQuote(quote);
    setCounterOfferQuantity(quote.quantity || item.quantity || 0);
    setCounterOfferUnitPrice(quote.unitPrice || 0);
    setCounterOfferError(null);
    setCounterOfferPopoverItemId(item.id);
  };

  const closeCounterOfferPopover = () => {
    setCounterOfferPopoverItemId(null);
    setCounterOfferQuote(null);
    setCounterOfferError(null);
  };

  const handleCounterOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterOfferQuote?.quoteUid) {
      setCounterOfferError('Lütfen bir teklif seçin');
      return;
    }
    if (counterOfferQuantity <= 0) {
      setCounterOfferError('Adet 0\'dan büyük olmalıdır');
      return;
    }
    if (counterOfferUnitPrice <= 0) {
      setCounterOfferError('Birim fiyat 0\'dan büyük olmalıdır');
      return;
    }
    setCounterOfferError(null);
    try {
      setCounterOfferSaving(true);
      const response = await supplierQuoteService.setCounterOffer(counterOfferQuote.quoteUid, {
        quantity: counterOfferQuantity,
        unitPrice: counterOfferUnitPrice
      });
      if (!response.success) {
        setCounterOfferError(response.message || 'Kayıt başarısız');
        return;
      }
      showNotification('Karşı teklif kaydedildi', 'success');
      closeCounterOfferPopover();
      await loadRequestData();
    } catch (err) {
      console.error('Counter offer submit error:', err);
      setCounterOfferError(err instanceof Error ? err.message : 'Kayıt sırasında hata oluştu');
      showNotification('Karşı teklif kaydedilirken hata oluştu', 'error');
    } finally {
      setCounterOfferSaving(false);
    }
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

  const counterOfferItem = request?.items?.find((i) => i.id === counterOfferPopoverItemId) ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {counterOfferPopoverItemId != null && counterOfferItem && createPortal(
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="counter-offer-title">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={closeCounterOfferPopover} />
          <div className="fixed left-1/2 top-1/2 z-[101] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <span id="counter-offer-title" className="text-sm font-medium text-gray-900">Karşı teklif</span>
              <button type="button" onClick={closeCounterOfferPopover} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCounterOfferSubmit} className="space-y-3">
              {counterOfferQuote && (
                <p className="text-xs text-gray-600">
                  Tedarikçi:{' '}
                  <span className="font-medium text-gray-800">
                    {counterOfferQuote.supplier?.name ?? '—'}
                  </span>
                  {counterOfferQuote.quoteNumber != null && (
                    <span className="text-gray-500"> · Teklif no: {counterOfferQuote.quoteNumber}</span>
                  )}
                </p>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Adet</label>
                <input
                  type="number"
                  min={1}
                  value={counterOfferQuantity || ''}
                  onChange={(e) => setCounterOfferQuantity(parseFloat(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Birim fiyat</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={counterOfferUnitPrice || ''}
                  onChange={(e) => setCounterOfferUnitPrice(parseFloat(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm text-sm"
                />
              </div>
              {counterOfferError && <p className="text-sm text-red-600">{counterOfferError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={closeCounterOfferPopover} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">İptal</button>
                <button type="submit" disabled={counterOfferSaving} className="flex-1 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                  {counterOfferSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
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

            {/* Belgeler */}
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Belgeler</h3>
                <p className="mt-1 text-sm text-gray-500">PDF veya resim yükleyebilir, sonra indirebilirsiniz.</p>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={handleAddDocument}
                />
                {request.attachments && request.attachments.length > 0 && (
                  <ul className="divide-y divide-gray-200 mb-4">
                    {request.attachments.map((att) => (
                      <li key={att.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          {att.contentType?.startsWith('image/') ? (
                            <svg className="h-5 w-5 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2h2v2h-2v-2zm-4 0h2v2h-2v-2zm-4 2h2v2H7v-2zm-2-2h2v2H5v-2z" clipRule="evenodd" /></svg>
                          ) : (
                            <svg className="h-5 w-5 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                          )}
                          <span className="ml-3 text-sm font-medium text-gray-900 truncate">{att.fileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(att)}
                          className="ml-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          İndir
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAttachment}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingAttachment ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-0.5 mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Belge ekle (PDF veya resim)
                    </>
                  )}
                </button>
              </div>
            </div>

            {request.items && request.items.length > 0 && <PurchaseRequestItems items={request.items} />}

            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Onay Süreci</h3>
                <p className="mt-1 text-sm text-gray-500">Talep onay zinciri, adım sırasına göre</p>
              </div>
              <div className="px-4 py-6 sm:px-6">
                {(!request.approvals || request.approvals.length === 0) ? (
                  <p className="text-sm text-gray-500">Henüz onay adımı yok.</p>
                ) : (
                  <div className="flow-root">
                    <ul className="relative -mb-8">
                      {[...(request.approvals || [])]
                        .sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0))
                        .map((approval, index) => {
                          const isLast = index === (request.approvals?.length ?? 0) - 1;
                          const isPending = approval.status === 'PENDING';
                          const isApproved = approval.status === 'APPROVED';
                          const isRejected = approval.status === 'REJECTED';
                          const name = [approval.approver?.firstName, approval.approver?.lastName].filter(Boolean).join(' ') || approval.approver?.email || '—';
                          return (
                            <li key={approval.id} className="relative pb-8">
                              {!isLast && (
                                <span className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              )}
                              <div className="relative flex items-start">
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                                    isApproved
                                      ? 'border-emerald-300 bg-emerald-50'
                                      : isRejected
                                        ? 'border-red-300 bg-red-50'
                                        : isPending
                                          ? 'border-amber-300 bg-amber-50'
                                          : 'border-gray-300 bg-gray-50'
                                  }`}
                                >
                                  {isApproved && (
                                    <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                  )}
                                  {isRejected && (
                                    <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                  )}
                                  {isPending && (
                                    <span className="text-xs font-semibold text-amber-700">{approval.stepOrder}</span>
                                  )}
                                  {!isPending && !isApproved && !isRejected && (
                                    <span className="text-xs font-medium text-gray-600">{approval.stepOrder}</span>
                                  )}
                                </span>
                                <div className="ml-4 min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="text-sm font-medium text-gray-900">{name}</span>
                                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getApprovalStepStatusColor(approval.status)}`}>
                                      {getApprovalStepStatusText(approval.status)}
                                    </span>
                                  </div>
                                  <p className="mt-0.5 text-xs text-gray-500">{approval.roleName?.replace(/_/g, ' ') ?? 'Onaycı'}</p>
                                  {(approval.actionTakenAt || approval.comment) && (
                                    <div className="mt-2 space-y-0.5">
                                      {approval.actionTakenAt && (
                                        <p className="text-xs text-gray-500">{formatDate(approval.actionTakenAt)}</p>
                                      )}
                                      {approval.comment && (
                                        <p className="text-sm text-gray-600 bg-gray-50 rounded px-2 py-1.5 border border-gray-100">{approval.comment}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {canApproveRequest && (request.status === 'IN_APPROVAL' || request.status === 'IN_PROGRESS' || request.status === 'PARTIAL_APPROVAL') && getCurrentApprover(request)?.id === authService.getCurrentUser()?.id && (
              <div className="mt-6 bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Onay İşlemi</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500"><p>Bu talebi onaylayabilir veya reddedebilirsiniz.</p></div>
                  <div className="mt-5 space-y-4">
                    {nextApproverCandidatesList.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Onayı hangi üst gruba ileteceksiniz?</label>
                        <select
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                          value={nextApproverUserId}
                          onChange={(e) => setNextApproverUserId(e.target.value === '' ? '' : Number(e.target.value))}
                          disabled={selectableCandidates.length <= 1}
                        >
                          {selectableCandidates.length > 1 && <option value="">— Seçin —</option>}
                          {nextApproverCandidatesList.map((c, idx) => (
                            <option
                              key={c.userId != null ? `u-${c.userId}` : `g-${idx}-${c.groupName}`}
                              value={c.userId != null ? c.userId : ''}
                              disabled={c.userId == null}
                            >
                              {c.userId != null ? `${c.userName} (${c.groupName})` : c.userName}
                            </option>
                          ))}
                        </select>
                        {selectableCandidates.length === 1 ? (
                          <p className="mt-1 text-xs text-gray-500">Seçilebilir tek üst grubunuz var; onay bu kişiye iletilecek.</p>
                        ) : selectableCandidates.length > 1 ? (
                          <p className="mt-1 text-xs text-gray-500">Birden fazla üst gruba bağlısınız; onayı ileteceğiniz grubu seçin. Üye atanmamış gruplar seçilemez.</p>
                        ) : (
                          <p className="mt-1 text-xs text-amber-600">Tüm üst gruplarınızda henüz üye atanmamış. Onay yöneticinize (manager) iletilir.</p>
                        )}
                      </div>
                    )}
                    {request.hasNoNextApprover && request.sendDownCandidates && request.sendDownCandidates.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Üst onaycı bulunmuyor</label>
                        <p className="mt-1 text-xs text-gray-500 mb-2">Talebi aşağıdaki kişilere iletebilir veya tamamen onaylayabilirsiniz.</p>
                        <select
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          value={sendToUserId}
                          onChange={(e) => setSendToUserId(e.target.value === '' ? '' : Number(e.target.value))}
                        >
                          <option value="">Tamamen onayla</option>
                          {request.sendDownCandidates.map((c) => (
                            <option key={c.userId} value={c.userId}>
                              {c.userName} ({c.label})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <textarea rows={3} className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md" placeholder="Onay yorumu ekleyin (opsiyonel)..." value={actionComment} onChange={(e) => setActionComment(e.target.value)} />
                    <div className="mt-5 flex space-x-3">
                      <button
                        onClick={handleApprove}
                        disabled={loading || (selectableCandidates.length > 1 && (nextApproverUserId === '' || nextApproverUserId == null))}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Onayla
                      </button>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reddetme gerekçesi (zorunlu)</label>
                      <textarea
                        rows={4}
                        className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Reddetme gerekçesi..."
                        value={rejectionComment}
                        onChange={(e) => setRejectionComment(e.target.value)}
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Geri gönderilecek kişi</label>
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={returnToUserId}
                        onChange={(e) => setReturnToUserId(e.target.value === '' ? '' : Number(e.target.value))}
                      >
                        <option value="">Tamamen reddet (talep kapanır)</option>
                        {getReturnToCandidates().map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Talep sahibi veya onay zincirinde sizden önceki kişilerden birine geri gönderebilirsiniz.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" onClick={submitRejection} disabled={loading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">
                  {loading ? 'İşleniyor...' : returnToUserId === '' ? 'Talebi Reddet' : 'Geri Gönder'}
                </button>
                <button type="button" onClick={() => { setShowRejectModal(false); setReturnToUserId(''); }} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
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

      {canQuoteCollect && editingQuote && (
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