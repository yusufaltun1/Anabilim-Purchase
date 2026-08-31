import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Assignment, AssignmentStatus } from '../../types/assignment';
import { assignmentService } from '../../services/assignment.service';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/date';
import { AssignmentFormPhotoThumb } from './AssignmentFormPhotoThumb';
import { AssignmentReturnModal } from './AssignmentReturnModal';
import { AssignmentBulkReturnModal } from './AssignmentBulkReturnModal';
import { AssignmentDocumentLinks } from './AssignmentDocumentLinks';

const STATUS_LABELS: Record<AssignmentStatus, string> = {
  [AssignmentStatus.ACTIVE]: 'Aktif',
  [AssignmentStatus.RETURNED]: 'İade edildi',
  [AssignmentStatus.LOST]: 'Kayıp',
  [AssignmentStatus.DAMAGED]: 'Hasarlı',
  [AssignmentStatus.EXPIRED]: 'Süresi doldu',
};

interface AssignmentManageSectionProps {
  title?: string;
  assignments: Assignment[];
  loading?: boolean;
  showProductColumn?: boolean;
  showAssigneeColumn?: boolean;
  enableBulkActions?: boolean;
  readOnly?: boolean;
  printTitle?: string;
  onRefresh: () => void | Promise<void>;
}

export const AssignmentManageSection = ({
  title = 'Zimmetler',
  assignments,
  loading = false,
  showProductColumn = true,
  showAssigneeColumn = false,
  enableBulkActions = false,
  readOnly = false,
  printTitle,
  onRefresh,
}: AssignmentManageSectionProps) => {
  const { showNotification } = useNotification();
  const signedFormInputRef = useRef<HTMLInputElement>(null);
  const formPhotoInputRef = useRef<HTMLInputElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [formDownloadingId, setFormDownloadingId] = useState<number | null>(null);
  const [returnFormDownloadingId, setReturnFormDownloadingId] = useState<number | null>(null);
  const [signedFormUploadingId, setSignedFormUploadingId] = useState<number | null>(null);
  const [formPhotoUploadingId, setFormPhotoUploadingId] = useState<number | null>(null);
  const [assignmentCancellingId, setAssignmentCancellingId] = useState<number | null>(null);
  const [returnTargetAssignment, setReturnTargetAssignment] = useState<Assignment | null>(null);
  const [returningAssignment, setReturningAssignment] = useState(false);
  const [bulkReturnAssignments, setBulkReturnAssignments] = useState<Assignment[]>([]);
  const [bulkReturning, setBulkReturning] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState<'assignment' | 'return' | null>(null);
  const [signedFormTargetId, setSignedFormTargetId] = useState<number | null>(null);
  const [formPhotoTargetId, setFormPhotoTargetId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const activeAssignments = useMemo(
    () => assignments.filter((a) => a.status === AssignmentStatus.ACTIVE),
    [assignments]
  );

  const returnableAssignments = useMemo(
    () => activeAssignments.filter((a) => a.canBeReturned),
    [activeAssignments]
  );

  const selectableAssignments = enableBulkActions ? returnableAssignments : [];

  const selectedReturnable = useMemo(
    () => returnableAssignments.filter((a) => selectedIds.has(a.id)),
    [returnableAssignments, selectedIds]
  );

  const bulkTargetIds = useMemo(() => {
    if (selectedReturnable.length > 0) {
      return selectedReturnable.map((a) => a.id);
    }
    return returnableAssignments.map((a) => a.id);
  }, [selectedReturnable, returnableAssignments]);

  const bulkAssignmentFormIds = useMemo(() => {
    if (selectedReturnable.length > 0) {
      return selectedReturnable.map((a) => a.id);
    }
    return activeAssignments.map((a) => a.id);
  }, [selectedReturnable, activeAssignments]);

  const allSelectableSelected =
    selectableAssignments.length > 0 &&
    selectableAssignments.every((a) => selectedIds.has(a.id));

  const toggleSelectAll = () => {
    if (allSelectableSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableAssignments.map((a) => a.id)));
    }
  };

  const toggleSelect = (assignmentId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(assignmentId)) {
        next.delete(assignmentId);
      } else {
        next.add(assignmentId);
      }
      return next;
    });
  };

  const canCancelAssignment = (assignment: Assignment) =>
    assignment.canBeCancelled ??
    (assignment.status === AssignmentStatus.ACTIVE && !assignment.hasSignedForm);

  const handleDownloadAssignmentForm = async (assignmentId: number) => {
    try {
      setFormDownloadingId(assignmentId);
      await assignmentService.downloadAssignmentForm(assignmentId);
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Zimmet formu indirilemedi', 'error');
    } finally {
      setFormDownloadingId(null);
    }
  };

  const handleDownloadReturnForm = async (assignmentId: number) => {
    try {
      setReturnFormDownloadingId(assignmentId);
      await assignmentService.downloadReturnAssignmentForm(assignmentId);
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'İade formu indirilemedi', 'error');
    } finally {
      setReturnFormDownloadingId(null);
    }
  };

  const handleBulkDownloadAssignmentForms = async () => {
    if (bulkAssignmentFormIds.length === 0) {
      showNotification('İndirilecek aktif zimmet bulunamadı', 'error');
      return;
    }
    try {
      setBulkDownloading('assignment');
      await assignmentService.downloadBulkAssignmentForms(bulkAssignmentFormIds);
      showNotification(`${bulkAssignmentFormIds.length} zimmet formu indirildi`, 'success');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Toplu form indirilemedi', 'error');
    } finally {
      setBulkDownloading(null);
    }
  };

  const handleBulkDownloadReturnForms = async () => {
    if (bulkTargetIds.length === 0) {
      showNotification('İade edilebilir zimmet bulunamadı', 'error');
      return;
    }
    try {
      setBulkDownloading('return');
      await assignmentService.downloadBulkReturnForms(bulkTargetIds);
      showNotification(`${bulkTargetIds.length} iade formu indirildi`, 'success');
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Toplu iade formu indirilemedi', 'error');
    } finally {
      setBulkDownloading(null);
    }
  };

  const handlePrintAll = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      showNotification('Yazdırma penceresi açılamadı. Pop-up engelleyiciyi kontrol edin.', 'error');
      return;
    }

    const heading = printTitle || title;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${heading}</title>
          <style>
            body { font-family: system-ui, sans-serif; font-size: 12px; padding: 16px; color: #111; }
            h1 { font-size: 18px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
            th { background: #f3f4f6; font-size: 11px; text-transform: uppercase; }
            .muted { color: #666; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>${heading}</h1>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleUploadSignedFormClick = (assignmentId: number) => {
    setSignedFormTargetId(assignmentId);
    signedFormInputRef.current?.click();
  };

  const handleSignedFormSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !signedFormTargetId) return;

    try {
      setSignedFormUploadingId(signedFormTargetId);
      await assignmentService.uploadSignedAssignmentForm(signedFormTargetId, file);
      showNotification('İmzalı zimmet formu yüklendi', 'success');
      await onRefresh();
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'İmzalı form yüklenemedi', 'error');
    } finally {
      setSignedFormUploadingId(null);
      setSignedFormTargetId(null);
    }
  };

  const handleUploadFormPhotoClick = (assignmentId: number) => {
    setFormPhotoTargetId(assignmentId);
    formPhotoInputRef.current?.click();
  };

  const handleFormPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !formPhotoTargetId) return;

    try {
      setFormPhotoUploadingId(formPhotoTargetId);
      await assignmentService.uploadFormPhoto(formPhotoTargetId, file);
      showNotification('Ürün fotoğrafı yüklendi', 'success');
      await onRefresh();
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Fotoğraf yüklenemedi', 'error');
    } finally {
      setFormPhotoUploadingId(null);
      setFormPhotoTargetId(null);
    }
  };

  const handleCancelAssignment = async (assignmentId: number) => {
    if (
      !window.confirm(
        'Bu zimmet kaydını iptal etmek istiyor musunuz? Bağlı stok hareketi silinecek ve kayıt kaldırılacak.'
      )
    ) {
      return;
    }

    try {
      setAssignmentCancellingId(assignmentId);
      await assignmentService.cancelAssignment(assignmentId);
      showNotification('Zimmet iptal edildi', 'success');
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(assignmentId);
        return next;
      });
      await onRefresh();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : 'Zimmet iptal edilirken bir hata oluştu',
        'error'
      );
    } finally {
      setAssignmentCancellingId(null);
    }
  };

  const handleReturnAssignment = async (payload: {
    photo: File;
    document: File;
    warehouseId: number;
    notes?: string;
  }) => {
    if (!returnTargetAssignment) return;
    try {
      setReturningAssignment(true);
      await assignmentService.returnAssignment(returnTargetAssignment.id, payload);
      showNotification('Zimmet iade edildi', 'success');
      setReturnTargetAssignment(null);
      await onRefresh();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : 'Zimmet iade edilirken bir hata oluştu',
        'error'
      );
    } finally {
      setReturningAssignment(false);
    }
  };

  const handleBulkReturn = async (payload: {
    warehouseId: number;
    notes?: string;
    document: File;
    photos: { assignmentId: number; photo: File }[];
  }) => {
    try {
      setBulkReturning(true);
      const result = await assignmentService.bulkReturnAssignments(
        payload.photos.map((i) => i.assignmentId),
        payload.warehouseId,
        payload.notes,
        payload.document,
        payload.photos
      );

      if (result.failureCount === 0) {
        showNotification(`${result.successCount} zimmet iade edildi`, 'success');
      } else if (result.successCount > 0) {
        showNotification(
          `${result.successCount} başarılı, ${result.failureCount} hatalı iade`,
          'error'
        );
        result.errors.forEach((msg) => showNotification(msg, 'error'));
      } else {
        showNotification('Toplu iade tamamlanamadı', 'error');
        result.errors.forEach((msg) => showNotification(msg, 'error'));
      }

      setBulkReturnAssignments([]);
      setSelectedIds(new Set());
      await onRefresh();
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : 'Toplu iade sırasında bir hata oluştu',
        'error'
      );
    } finally {
      setBulkReturning(false);
    }
  };

  const openBulkReturn = () => {
    const targets =
      selectedReturnable.length > 0 ? selectedReturnable : returnableAssignments;
    if (targets.length === 0) {
      showNotification('İade edilebilir zimmet bulunamadı', 'error');
      return;
    }
    setBulkReturnAssignments(targets);
  };

  const showToolbar = assignments.length > 0;

  return (
    <>
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg assignment-manage-section">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {showToolbar && (
              <div className="flex flex-wrap gap-2 print:hidden">
                <button
                  type="button"
                  onClick={handlePrintAll}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Tümünü yazdır
                </button>
                {enableBulkActions && activeAssignments.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDownloadAssignmentForms}
                    disabled={bulkDownloading === 'assignment'}
                    className="px-3 py-1.5 text-sm rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    {bulkDownloading === 'assignment'
                      ? 'İndiriliyor…'
                      : `Zimmet formları (ZIP${bulkAssignmentFormIds.length ? ` · ${bulkAssignmentFormIds.length}` : ''})`}
                  </button>
                )}
                {enableBulkActions && returnableAssignments.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleBulkDownloadReturnForms}
                      disabled={bulkDownloading === 'return'}
                      className="px-3 py-1.5 text-sm rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                    >
                      {bulkDownloading === 'return'
                        ? 'İndiriliyor…'
                        : `Toplu iade formu${bulkTargetIds.length ? ` (${bulkTargetIds.length} ürün)` : ''}`}
                    </button>
                    <button
                      type="button"
                      onClick={openBulkReturn}
                      disabled={bulkReturning || bulkTargetIds.length === 0}
                      className="px-3 py-1.5 text-sm rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Toplu iade{bulkTargetIds.length ? ` (${bulkTargetIds.length})` : ''}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {enableBulkActions && selectableAssignments.length > 0 && (
            <p className="mt-2 text-xs text-gray-500 print:hidden">
              Seçili satırlar toplu işlemlerde kullanılır. Seçim yoksa tüm uygun zimmetler dahil
              edilir.
            </p>
          )}
        </div>

        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">Zimmetler yükleniyor…</div>
        ) : assignments.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">Kayıtlı zimmet bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto" ref={printAreaRef}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {enableBulkActions && selectableAssignments.length > 0 && (
                    <th className="px-3 py-3 print:hidden">
                      <input
                        type="checkbox"
                        checked={allSelectableSelected}
                        onChange={toggleSelectAll}
                        aria-label="Tümünü seç"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                  )}
                  {showProductColumn && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ürün
                    </th>
                  )}
                  {showAssigneeColumn && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Zimmetli
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tarih
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Oluşturan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Durum
                  </th>
                  {!readOnly && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase print:hidden">
                        Fotoğraf
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase print:hidden">
                        Belgeler
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase print:hidden">
                        İşlemler
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => {
                  const isSelectable =
                    enableBulkActions &&
                    assignment.status === AssignmentStatus.ACTIVE &&
                    assignment.canBeReturned;

                  return (
                    <tr key={assignment.id}>
                      {enableBulkActions && selectableAssignments.length > 0 && (
                        <td className="px-3 py-3 print:hidden">
                          {isSelectable ? (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(assignment.id)}
                              onChange={() => toggleSelect(assignment.id)}
                              aria-label={`${assignment.productName} seç`}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          ) : null}
                        </td>
                      )}
                      {showProductColumn && (
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <Link
                            to={`/products/${assignment.productId}`}
                            className="text-indigo-600 hover:text-indigo-800 print:text-black print:no-underline"
                          >
                            {assignment.productName}
                          </Link>
                          {assignment.serialNumber && (
                            <div className="text-xs text-gray-500">{assignment.serialNumber}</div>
                          )}
                        </td>
                      )}
                      {showAssigneeColumn && (
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {assignment.userAssignment ? (
                            <div>
                              <div>{assignment.assignedUserName || '—'}</div>
                              {assignment.assignedSchoolName && (
                                <div className="text-xs text-gray-500">
                                  {assignment.assignedSchoolName}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div>
                                {assignment.assignedLocationName || assignment.locationName || '—'}
                              </div>
                              {assignment.locationDetails && (
                                <div className="text-xs text-gray-500">
                                  {assignment.locationDetails}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(assignment.assignmentDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        <div>{assignment.createdByUserName || '—'}</div>
                        {assignment.status === AssignmentStatus.RETURNED &&
                          assignment.returnedByUserName && (
                            <div className="text-xs text-gray-400">
                              İade: {assignment.returnedByUserName}
                            </div>
                          )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {STATUS_LABELS[assignment.status] ?? assignment.status}
                      </td>
                      {!readOnly && (
                        <>
                          <td className="px-4 py-3 print:hidden">
                            <AssignmentFormPhotoThumb
                              assignmentId={assignment.id}
                              hasFormPhoto={assignment.hasFormPhoto}
                              formPhotoUrl={assignment.formPhotoUrl}
                              onImageClick={(url) => setSelectedImage(url)}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm print:hidden">
                            <AssignmentDocumentLinks
                              assignment={assignment}
                              downloadingId={formDownloadingId}
                              onDownloadingChange={setFormDownloadingId}
                              onError={(message) => showNotification(message, 'error')}
                              onImageClick={(url) => setSelectedImage(url)}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm print:hidden">
                            <div className="flex flex-col gap-1 min-w-[9rem]">
                              {assignment.status === AssignmentStatus.ACTIVE && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadAssignmentForm(assignment.id)}
                                    disabled={formDownloadingId === assignment.id}
                                    className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 text-left"
                                  >
                                    {formDownloadingId === assignment.id
                                      ? 'İndiriliyor…'
                                      : 'Zimmet formu indir'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUploadFormPhotoClick(assignment.id)}
                                    disabled={formPhotoUploadingId === assignment.id}
                                    className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 text-left"
                                  >
                                    {formPhotoUploadingId === assignment.id
                                      ? 'Fotoğraf yükleniyor…'
                                      : assignment.hasFormPhoto
                                        ? 'Fotoğrafı değiştir'
                                        : 'Fotoğraf yükle'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUploadSignedFormClick(assignment.id)}
                                    disabled={signedFormUploadingId === assignment.id}
                                    className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 text-left"
                                  >
                                    {signedFormUploadingId === assignment.id
                                      ? 'Yükleniyor…'
                                      : 'İmzalı zimmet yükle'}
                                  </button>
                                </>
                              )}
                              {assignment.canBeReturned && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadReturnForm(assignment.id)}
                                    disabled={returnFormDownloadingId === assignment.id}
                                    className="text-emerald-700 hover:text-emerald-900 disabled:opacity-50 text-left"
                                  >
                                    {returnFormDownloadingId === assignment.id
                                      ? 'İndiriliyor…'
                                      : 'İade formu indir'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReturnTargetAssignment(assignment)}
                                    disabled={returningAssignment}
                                    className="text-emerald-700 hover:text-emerald-900 disabled:opacity-50 text-left"
                                  >
                                    İade et
                                  </button>
                                </>
                              )}
                              {canCancelAssignment(assignment) && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelAssignment(assignment.id)}
                                  disabled={assignmentCancellingId === assignment.id}
                                  className="text-red-600 hover:text-red-800 disabled:opacity-50 text-left"
                                >
                                  {assignmentCancellingId === assignment.id
                                    ? 'İptal ediliyor…'
                                    : 'Zimmeti iptal et'}
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!readOnly && (
        <>
          <input
            ref={signedFormInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleSignedFormSelected}
          />
          <input
            ref={formPhotoInputRef}
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFormPhotoSelected}
          />

          <AssignmentReturnModal
            isOpen={!!returnTargetAssignment}
            assignment={returnTargetAssignment}
            submitting={returningAssignment}
            onClose={() => setReturnTargetAssignment(null)}
            onSubmit={handleReturnAssignment}
          />

          <AssignmentBulkReturnModal
            isOpen={bulkReturnAssignments.length > 0}
            assignments={bulkReturnAssignments}
            submitting={bulkReturning}
            onClose={() => setBulkReturnAssignments([])}
            onSubmit={handleBulkReturn}
          />
        </>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedImage(null)}
          role="presentation"
        >
          <img
            src={selectedImage}
            alt="Zimmet fotoğrafı"
            className="max-h-[90vh] max-w-full rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
