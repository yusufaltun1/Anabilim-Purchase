import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Assignment, AssignmentStatus } from '../../types/assignment';
import { CreateStockMovementRequest, StockItem, StockMovementDetail, Warehouse } from '../../types/warehouse';
import { warehouseService } from '../../services/warehouse.service';
import { assignmentService } from '../../services/assignment.service';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/date';
import { isAssignableStockRow } from '../../utils/inventoryProduct';
import { StockItemAssignmentForm } from './StockItemAssignmentForm';
import { AssignmentFormPhotoThumb } from './AssignmentFormPhotoThumb';
import { AssignmentReturnModal } from './AssignmentReturnModal';
import { AssignmentDocumentLinks } from './AssignmentDocumentLinks';
import { LocationHierarchyPickers } from '../common/LocationHierarchyPickers';
import { resolveProductLocationPayload } from '../../utils/locationHierarchy';

const movementTypeLabel: Record<string, string> = {
  IN: 'Giriş',
  OUT: 'Çıkış',
  ADJUSTMENT: 'Düzeltme',
};

const referenceTypeLabel: Record<string, string> = {
  MANUAL: 'Manuel',
  ASSIGNMENT: 'Zimmet',
  ASSIGNMENT_RETURN: 'Zimmet iadesi',
  ASSIGNMENT_CANCEL: 'Zimmet iptali',
  PURCHASE_ORDER: 'Satın alma',
  ADJUSTMENT: 'Düzeltme',
  TRANSFER: 'Transfer',
};

const assignmentStatusLabel: Record<string, string> = {
  ACTIVE: 'Aktif',
  RETURNED: 'İade',
  LOST: 'Kayıp',
  DAMAGED: 'Hasarlı',
  EXPIRED: 'Süresi doldu',
};

type ManageTab = 'zimmet' | 'hareket' | 'gecmis';

interface StockItemDetailPanelProps {
  isOpen: boolean;
  stockItem: StockItem;
  productId: number;
  canManage: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

function statusBadgeClass(item: StockItem): string {
  if (item.allowsAssignment === true && item.status === 'IN_STOCK') {
    return 'bg-green-100 text-green-800';
  }
  if (item.status === 'ASSIGNED') {
    return 'bg-blue-100 text-blue-800';
  }
  if (item.status === 'MAINTENANCE') {
    return 'bg-yellow-100 text-yellow-800';
  }
  return 'bg-gray-100 text-gray-800';
}

function statusLabel(item: StockItem): string {
  return (
    item.assetConditionName ||
    (item.status === 'IN_STOCK' && 'Stokta') ||
    (item.status === 'ASSIGNED' && 'Zimmetli') ||
    (item.status === 'MAINTENANCE' && 'Bakımda') ||
    (item.status === 'RETIRED' && 'Emekli') ||
    item.status
  );
}

export const StockItemDetailPanel = ({
  isOpen,
  stockItem,
  productId,
  canManage,
  onClose,
  onRefresh,
}: StockItemDetailPanelProps) => {
  const { showNotification } = useNotification();
  const signedFormInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ManageTab>('zimmet');
  const [movements, setMovements] = useState<StockMovementDetail[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [movementSubmitting, setMovementSubmitting] = useState(false);
  const [movementNotes, setMovementNotes] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | ''>('');
  const [formDownloading, setFormDownloading] = useState(false);
  const [signedUploading, setSignedUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returning, setReturning] = useState(false);
  const [locationRootId, setLocationRootId] = useState<number | null>(null);
  const [locationMiddleId, setLocationMiddleId] = useState<number | null>(null);
  const [locationLeafId, setLocationLeafId] = useState<number | null>(null);

  const stockItemId = Number(stockItem.id);
  const canAssign = isAssignableStockRow(stockItem);
  const inWarehouse = Boolean(stockItem.warehouseId) && stockItem.status === 'IN_STOCK';
  const serialLabel =
    [stockItem.serialNumber, stockItem.assetLabel].filter(Boolean).join(' · ') ||
    `Cihaz #${stockItem.id}`;

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('zimmet');
    setMovementNotes('');
    setLocationRootId(null);
    setLocationMiddleId(null);
    setLocationLeafId(null);
    setReturnModalOpen(false);
  }, [isOpen, stockItemId]);

  useEffect(() => {
    if (!isOpen || inWarehouse) return;
    warehouseService.getActiveWarehouses().then(setWarehouses).catch(() => setWarehouses([]));
  }, [isOpen, inWarehouse]);

  useEffect(() => {
    if (stockItem.warehouseId) {
      setSelectedWarehouseId(stockItem.warehouseId);
    }
  }, [stockItem.warehouseId]);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [movementList, assignmentList] = await Promise.all([
        warehouseService.getStockItemMovements(stockItemId),
        assignmentService.getAssignmentsByStockItem(stockItemId),
      ]);
      setMovements(movementList);
      setAssignments(assignmentList);
    } catch {
      showNotification('Cihaz detayları yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification, stockItemId]);

  useEffect(() => {
    if (!isOpen) return;
    void loadDetails();
  }, [isOpen, loadDetails, stockItem.status, stockItem.assignedUserName, stockItem.warehouseName]);

  const handleRefreshAll = async () => {
    await loadDetails();
    onRefresh();
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const warehouseId = inWarehouse ? stockItem.warehouseId : Number(selectedWarehouseId);
    if (!warehouseId) {
      showNotification('Depo seçin', 'error');
      return;
    }
    if (!locationRootId) {
      showNotification(
        inWarehouse ? 'Çıkış lokasyonu seçin' : 'Giriş lokasyonu seçin',
        'error'
      );
      return;
    }

    const locationFields = resolveProductLocationPayload(
      locationRootId,
      locationMiddleId,
      locationLeafId
    );
    const effectiveType = inWarehouse ? 'OUT' : 'IN';
    const payload: CreateStockMovementRequest = {
      movementType: effectiveType,
      referenceType: 'MANUAL',
      referenceId: 0,
      quantity: 1,
      notes: movementNotes.trim() || `Manuel ${effectiveType === 'IN' ? 'giriş' : 'çıkış'}`,
      stockItemId,
      parentLocationId: locationFields.defaultParentLocationId ?? undefined,
      childLocationId: locationFields.defaultChildLocationId ?? undefined,
    };

    try {
      setMovementSubmitting(true);
      await warehouseService.createStockMovementWithAutoStock(warehouseId, productId, payload);
      showNotification('Stok hareketi kaydedildi', 'success');
      setMovementNotes('');
      setLocationRootId(null);
      setLocationMiddleId(null);
      setLocationLeafId(null);
      await handleRefreshAll();
      setActiveTab('gecmis');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Stok hareketi kaydedilemedi', 'error');
    } finally {
      setMovementSubmitting(false);
    }
  };

  const activeAssignment = assignments.find((a) => a.status === AssignmentStatus.ACTIVE);

  const canCancelAssignment = (assignment: Assignment) =>
    assignment.canBeCancelled ??
    (assignment.status === AssignmentStatus.ACTIVE && !assignment.hasSignedForm);

  const handleDownloadForm = async () => {
    if (!activeAssignment) return;
    try {
      setFormDownloading(true);
      await assignmentService.downloadAssignmentForm(activeAssignment.id);
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Form indirilemedi', 'error');
    } finally {
      setFormDownloading(false);
    }
  };

  const handleCancelAssignment = async () => {
    if (!activeAssignment) return;
    if (!window.confirm('Bu zimmeti iptal etmek istediğinize emin misiniz?')) return;
    try {
      setCancelling(true);
      await assignmentService.cancelAssignment(activeAssignment.id);
      showNotification('Zimmet iptal edildi', 'success');
      await handleRefreshAll();
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Zimmet iptal edilemedi', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnAssignment = async (payload: {
    photo: File;
    document: File;
    warehouseId: number;
    notes?: string;
  }) => {
    if (!activeAssignment) return;
    try {
      setReturning(true);
      await assignmentService.returnAssignment(activeAssignment.id, payload);
      showNotification('Zimmet iade edildi', 'success');
      setReturnModalOpen(false);
      await handleRefreshAll();
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Zimmet iade edilemedi', 'error');
    } finally {
      setReturning(false);
    }
  };

  const handleSignedFormSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeAssignment) return;
    try {
      setSignedUploading(true);
      await assignmentService.uploadSignedAssignmentForm(activeAssignment.id, file);
      showNotification('İmzalı form yüklendi', 'success');
      await handleRefreshAll();
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Yükleme başarısız', 'error');
    } finally {
      setSignedUploading(false);
    }
  };

  if (!isOpen) return null;

  const tabs: { id: ManageTab; label: string }[] = [
    { id: 'zimmet', label: 'Zimmet' },
    { id: 'hareket', label: 'Stok hareketi' },
    { id: 'gecmis', label: 'Geçmiş' },
  ];

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <div className="flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-xl bg-white shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{serialLabel}</h3>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(stockItem)}`}
                >
                  {statusLabel(stockItem)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {stockItem.warehouseName || 'Depo dışında'}
                {stockItem.assignedUserName
                  ? ` · Zimmet: ${stockItem.assignedUserName}`
                  : activeAssignment
                    ? ` · Zimmet: ${
                        activeAssignment.assignedUserName ||
                        activeAssignment.assignedLocationName ||
                        activeAssignment.locationName ||
                        '—'
                      }`
                    : ' · Zimmet yok'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600"
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>

          <div className="border-b border-gray-200 px-5">
            <nav className="-mb-px flex gap-4 overflow-x-auto" aria-label="Cihaz yönetimi sekmeleri">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <input
              ref={signedFormInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleSignedFormSelected}
            />

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
              </div>
            ) : (
              <>
                {activeTab === 'zimmet' && (
                  <div className="space-y-4">
                    {activeAssignment ? (
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                        <div className="text-sm text-blue-900">
                          <span className="font-semibold">Aktif zimmet: </span>
                          {activeAssignment.assignedUserName ||
                            activeAssignment.assignedLocationName ||
                            activeAssignment.locationName ||
                            '—'}
                          {activeAssignment.assignmentDate && (
                            <span className="text-blue-700">
                              {' '}
                              · {formatDate(activeAssignment.assignmentDate)}
                            </span>
                          )}
                        </div>
                        {canManage && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={handleDownloadForm}
                              disabled={formDownloading}
                              className="px-3 py-1.5 text-sm rounded-md border border-blue-300 bg-white hover:bg-blue-50 disabled:opacity-50"
                            >
                              {formDownloading ? 'İndiriliyor…' : 'Formu indir'}
                            </button>
                            <button
                              type="button"
                              onClick={() => signedFormInputRef.current?.click()}
                              disabled={signedUploading}
                              className="px-3 py-1.5 text-sm rounded-md border border-blue-300 bg-white hover:bg-blue-50 disabled:opacity-50"
                            >
                              {signedUploading ? 'Yükleniyor…' : 'İmzalı yükle'}
                            </button>
                            {activeAssignment.canBeReturned && (
                              <button
                                type="button"
                                onClick={() => setReturnModalOpen(true)}
                                disabled={returning}
                                className="px-3 py-1.5 text-sm rounded-md border border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 disabled:opacity-50"
                              >
                                Zimmeti iade et
                              </button>
                            )}
                            {canCancelAssignment(activeAssignment) && (
                              <button
                                type="button"
                                onClick={handleCancelAssignment}
                                disabled={cancelling}
                                className="px-3 py-1.5 text-sm rounded-md text-red-700 border border-red-200 bg-white hover:bg-red-50 disabled:opacity-50"
                              >
                                {cancelling ? 'İptal ediliyor…' : 'Zimmeti iptal et'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : canManage && canAssign ? (
                      <StockItemAssignmentForm
                        productId={productId}
                        stockItemId={stockItemId}
                        serialLabel={serialLabel}
                        onSuccess={handleRefreshAll}
                      />
                    ) : (
                      !canAssign && (
                        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                          Bu cihaz şu an zimmetlenemez. Depoda ve &quot;Hazır&quot; durumunda olmalıdır.
                        </p>
                      )
                    )}
                  </div>
                )}

                {activeTab === 'hareket' && (
                  <div className="space-y-4">
                    {!canManage ? (
                      <p className="text-sm text-gray-500">Stok hareketi yetkiniz yok.</p>
                    ) : (
                      <form
                        onSubmit={handleMovementSubmit}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3"
                      >
                        <p className="text-sm text-gray-600">
                          {inWarehouse
                            ? 'Bu cihaz depoda. Çıkış kaydı oluşturabilirsiniz.'
                            : 'Bu cihaz depo dışında. Depoya giriş kaydı oluşturabilirsiniz.'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {!inWarehouse && (
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Depo *
                              </label>
                              <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                                value={selectedWarehouseId}
                                onChange={(e) =>
                                  setSelectedWarehouseId(e.target.value ? Number(e.target.value) : '')
                                }
                                required
                              >
                                <option value="">Depo seçin</option>
                                {warehouses.map((w) => (
                                  <option key={w.id} value={w.id}>
                                    {w.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {inWarehouse ? 'Çıkış lokasyonu *' : 'Giriş lokasyonu *'}
                            </label>
                            <LocationHierarchyPickers
                              rootId={locationRootId}
                              middleId={locationMiddleId}
                              leafId={locationLeafId}
                              onRootChange={(id) => {
                                setLocationRootId(id);
                                setLocationMiddleId(null);
                                setLocationLeafId(null);
                              }}
                              onMiddleChange={(id) => {
                                setLocationMiddleId(id);
                                setLocationLeafId(null);
                              }}
                              onLeafChange={setLocationLeafId}
                              showLeaf
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Açıklama
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                              value={movementNotes}
                              onChange={(e) => setMovementNotes(e.target.value)}
                              placeholder="Opsiyonel açıklama"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={movementSubmitting}
                            className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {movementSubmitting ? 'Kaydediliyor…' : 'Kaydet'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {activeTab === 'gecmis' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Zimmet geçmişi</h4>
                      {assignments.length === 0 ? (
                        <p className="text-sm text-gray-500">Bu cihaza ait zimmet kaydı yok.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-md border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  Tarih
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  Durum
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  Atanan
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  Fotoğraf
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  Belgeler
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  Not
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {assignments.map((assignment) => (
                                <tr key={assignment.id}>
                                  <td className="px-3 py-2 text-gray-600">
                                    {formatDate(assignment.assignmentDate)}
                                  </td>
                                  <td className="px-3 py-2">
                                    {assignmentStatusLabel[assignment.status] ?? assignment.status}
                                  </td>
                                  <td className="px-3 py-2 text-gray-900">
                                    {assignment.assignedUserName ||
                                      assignment.assignedLocationName ||
                                      assignment.locationName ||
                                      '—'}
                                  </td>
                                  <td className="px-3 py-2">
                                    <AssignmentFormPhotoThumb
                                      assignmentId={assignment.id}
                                      hasFormPhoto={assignment.hasFormPhoto}
                                      formPhotoUrl={assignment.formPhotoUrl}
                                      className="h-8 w-8 rounded object-cover border border-gray-200"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <AssignmentDocumentLinks
                                      assignment={assignment}
                                      onError={(message) => showNotification(message, 'error')}
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-gray-500">
                                    {assignment.notes || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Stok hareketleri</h4>
                      {movements.length === 0 ? (
                        <p className="text-sm text-gray-500">Bu cihaza ait stok hareketi yok.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-md border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  Tarih
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  Tip
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  Lokasyon
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  Referans
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                  Not
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {movements.map((movement) => (
                                <tr key={movement.id}>
                                  <td className="px-3 py-2 text-gray-600">
                                    {formatDate(movement.createdAt)}
                                  </td>
                                  <td className="px-3 py-2">
                                    <span
                                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                        movement.movementType === 'IN'
                                          ? 'bg-green-100 text-green-800'
                                          : movement.movementType === 'OUT'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {movementTypeLabel[movement.movementType] ??
                                        movement.movementType}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {[movement.parentLocationName, movement.childLocationName]
                                      .filter(Boolean)
                                      .join(' / ') || '—'}
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {referenceTypeLabel[movement.referenceType] ??
                                      movement.referenceType}
                                  </td>
                                  <td className="px-3 py-2 text-gray-500">
                                    {movement.notes || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-gray-100 px-5 py-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>

      <AssignmentReturnModal
        isOpen={returnModalOpen}
        assignment={activeAssignment ?? null}
        submitting={returning}
        onClose={() => {
          if (!returning) setReturnModalOpen(false);
        }}
        onSubmit={handleReturnAssignment}
      />
    </>,
    document.body
  );
};
