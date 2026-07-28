import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Assignment, AssignmentStatus } from '../../types/assignment';
import { assignmentService } from '../../services/assignment.service';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/date';
import { AssignmentFormPhotoThumb } from './AssignmentFormPhotoThumb';
import { AssignmentReturnModal } from './AssignmentReturnModal';
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
  onRefresh: () => void | Promise<void>;
}

export const AssignmentManageSection = ({
  title = 'Zimmetler',
  assignments,
  loading = false,
  showProductColumn = true,
  showAssigneeColumn = false,
  onRefresh,
}: AssignmentManageSectionProps) => {
  const { showNotification } = useNotification();
  const signedFormInputRef = useRef<HTMLInputElement>(null);
  const formPhotoInputRef = useRef<HTMLInputElement>(null);

  const [formDownloadingId, setFormDownloadingId] = useState<number | null>(null);
  const [returnFormDownloadingId, setReturnFormDownloadingId] = useState<number | null>(null);
  const [signedFormUploadingId, setSignedFormUploadingId] = useState<number | null>(null);
  const [formPhotoUploadingId, setFormPhotoUploadingId] = useState<number | null>(null);
  const [assignmentCancellingId, setAssignmentCancellingId] = useState<number | null>(null);
  const [returnTargetAssignment, setReturnTargetAssignment] = useState<Assignment | null>(null);
  const [returningAssignment, setReturningAssignment] = useState(false);
  const [signedFormTargetId, setSignedFormTargetId] = useState<number | null>(null);
  const [formPhotoTargetId, setFormPhotoTargetId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  return (
    <>
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">Zimmetler yükleniyor…</div>
        ) : assignments.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">Kayıtlı zimmet bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fotoğraf
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Belgeler
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    {showProductColumn && (
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <Link
                          to={`/products/${assignment.productId}`}
                          className="text-indigo-600 hover:text-indigo-800"
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
                              <div className="text-xs text-gray-500">{assignment.assignedSchoolName}</div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div>{assignment.assignedLocationName || assignment.locationName || '—'}</div>
                            {assignment.locationDetails && (
                              <div className="text-xs text-gray-500">{assignment.locationDetails}</div>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(assignment.assignmentDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {assignment.createdByUserName || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {STATUS_LABELS[assignment.status] ?? assignment.status}
                    </td>
                    <td className="px-4 py-3">
                      <AssignmentFormPhotoThumb
                        assignmentId={assignment.id}
                        hasFormPhoto={assignment.hasFormPhoto}
                        formPhotoUrl={assignment.formPhotoUrl}
                        onImageClick={(url) => setSelectedImage(url)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <AssignmentDocumentLinks
                        assignment={assignment}
                        downloadingId={formDownloadingId}
                        onDownloadingChange={setFormDownloadingId}
                        onError={(message) => showNotification(message, 'error')}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1 min-w-[9rem]">
                        {assignment.status === AssignmentStatus.ACTIVE && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDownloadAssignmentForm(assignment.id)}
                              disabled={formDownloadingId === assignment.id}
                              className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 text-left"
                            >
                              {formDownloadingId === assignment.id ? 'İndiriliyor…' : 'Zimmet formu indir'}
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
                              {signedFormUploadingId === assignment.id ? 'Yükleniyor…' : 'İmzalı zimmet yükle'}
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
                            {assignmentCancellingId === assignment.id ? 'İptal ediliyor…' : 'Zimmeti iptal et'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
