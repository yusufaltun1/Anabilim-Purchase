import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { Assignment } from '../../types/assignment';
import { assignmentService } from '../../services/assignment.service';
import { warehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../types/warehouse';
import { dataUrlToFile } from '../../utils/imageFile';

interface AssignmentBulkReturnModalProps {
  isOpen: boolean;
  assignments: Assignment[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    warehouseId: number;
    notes?: string;
    document: File;
    photos: { assignmentId: number; photo: File }[];
  }) => void | Promise<void>;
}

export const AssignmentBulkReturnModal = ({
  isOpen,
  assignments,
  submitting = false,
  onClose,
  onSubmit,
}: AssignmentBulkReturnModalProps) => {
  const photoInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const [photosByAssignmentId, setPhotosByAssignmentId] = useState<Record<number, File>>({});
  const [photoPreviewsByAssignmentId, setPhotoPreviewsByAssignmentId] = useState<
    Record<number, string>
  >({});
  const [cameraAssignmentId, setCameraAssignmentId] = useState<number | null>(null);
  const [signedDocument, setSignedDocument] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [formDownloading, setFormDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPhotosByAssignmentId({});
    setPhotoPreviewsByAssignmentId((prev) => {
      Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
      return {};
    });
    setCameraAssignmentId(null);
    setSignedDocument(null);
    setNotes('');
    setWarehouseId('');
    setError(null);
    setFormDownloading(false);

    let cancelled = false;
    const loadWarehouses = async () => {
      try {
        setWarehousesLoading(true);
        const list = await warehouseService.getActiveWarehouses();
        if (cancelled) return;
        setWarehouses(list);
        if (list.length === 1) {
          setWarehouseId(String(list[0].id));
        }
      } catch {
        if (!cancelled) {
          setError('Depolar yüklenemedi');
        }
      } finally {
        if (!cancelled) {
          setWarehousesLoading(false);
        }
      }
    };
    void loadWarehouses();

    return () => {
      cancelled = true;
    };
  }, [isOpen, assignments]);

  const applyPhoto = (assignmentId: number, file: File) => {
    setPhotoPreviewsByAssignmentId((prev) => {
      const existing = prev[assignmentId];
      if (existing) URL.revokeObjectURL(existing);
      return { ...prev, [assignmentId]: URL.createObjectURL(file) };
    });
    setPhotosByAssignmentId((prev) => ({ ...prev, [assignmentId]: file }));
    setError(null);
  };

  if (!isOpen || assignments.length === 0) return null;

  const assignmentIds = assignments.map((a) => a.id);

  const handleDownloadReturnForm = async () => {
    try {
      setFormDownloading(true);
      setError(null);
      await assignmentService.downloadBulkReturnForms(assignmentIds);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'İade formu indirilemedi');
    } finally {
      setFormDownloading(false);
    }
  };

  const handlePhotoSelected = (assignmentId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    applyPhoto(assignmentId, file);
  };

  const handleCameraCapture = (dataUrl: string) => {
    if (cameraAssignmentId == null) return;
    applyPhoto(
      cameraAssignmentId,
      dataUrlToFile(dataUrl, `iade-foto-${cameraAssignmentId}-${Date.now()}.jpg`)
    );
    setCameraAssignmentId(null);
  };

  const handleDocumentSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSignedDocument(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) {
      setError('İade için hedef depo seçilmelidir.');
      return;
    }

    if (!signedDocument) {
      setError('İmzalı toplu iade formu yüklenmelidir.');
      return;
    }

    const missingPhoto = assignments.find((a) => !photosByAssignmentId[a.id]);
    if (missingPhoto) {
      setError(`"${missingPhoto.productName}" için ürün fotoğrafı zorunludur.`);
      return;
    }

    const photos = assignments.map((a) => ({
      assignmentId: a.id,
      photo: photosByAssignmentId[a.id]!,
    }));

    await onSubmit({
      warehouseId: Number(warehouseId),
      notes: notes.trim() || undefined,
      document: signedDocument,
      photos,
    });
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 shrink-0">
            <h3 className="text-base font-semibold text-gray-900">
              Toplu zimmet iadesi ({assignments.length})
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
            <div className="px-4 py-4 space-y-4 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600">
                Seçili tüm ürünler için tek bir iade formu indirilir. Formu imzalattıktan sonra
                imzalı formu bir kez yükleyin; her ürün için ayrı fotoğraf ekleyin.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    İade deposu *
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={warehouseId}
                    onChange={(e) => {
                      setWarehouseId(e.target.value);
                      setError(null);
                    }}
                    disabled={submitting || warehousesLoading}
                    required
                  >
                    <option value="">
                      {warehousesLoading ? 'Depolar yükleniyor…' : 'Depo seçin'}
                    </option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">İade notu</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tüm iadeler için opsiyonel açıklama"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-3 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadReturnForm}
                    disabled={submitting || formDownloading}
                    className="px-3 py-1.5 text-sm rounded-md border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    {formDownloading
                      ? 'İndiriliyor…'
                      : `Toplu iade formunu indir (${assignments.length} ürün)`}
                  </button>
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    disabled={submitting}
                    className="px-3 py-1.5 text-sm rounded-md border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                  >
                    {signedDocument ? signedDocument.name : 'İmzalı formu yükle (.xlsx) *'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Ürün
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Fotoğraf *
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {assignments.map((assignment) => {
                      const photo = photosByAssignmentId[assignment.id];
                      const preview = photoPreviewsByAssignmentId[assignment.id];
                      return (
                        <tr key={assignment.id}>
                          <td className="px-3 py-2 text-gray-900">
                            <div>{assignment.productName}</div>
                            {assignment.serialNumber && (
                              <div className="text-xs text-gray-500">{assignment.serialNumber}</div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setCameraAssignmentId(assignment.id)}
                                disabled={submitting}
                                className="px-2 py-1 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                              >
                                Kameradan çek
                              </button>
                              <button
                                type="button"
                                onClick={() => photoInputRefs.current[assignment.id]?.click()}
                                disabled={submitting}
                                className="px-2 py-1 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                              >
                                Dosyadan seç
                              </button>
                            </div>
                            {preview && (
                              <img
                                src={preview}
                                alt={`${assignment.productName} iade fotoğrafı`}
                                className="mt-2 h-16 w-16 rounded object-cover border border-gray-200"
                              />
                            )}
                            {photo && !preview && (
                              <p className="mt-1 text-xs text-gray-500">{photo.name}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1.5 text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'İade ediliyor…' : `${assignments.length} zimmeti iade et`}
              </button>
            </div>
          </form>
        </div>
      </div>

      <input
        ref={documentInputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={handleDocumentSelected}
      />

      {assignments.map((assignment) => (
        <input
          key={`photo-${assignment.id}`}
          ref={(el) => {
            photoInputRefs.current[assignment.id] = el;
          }}
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => handlePhotoSelected(assignment.id, e)}
        />
      ))}

      <CameraCaptureModal
        isOpen={cameraAssignmentId != null}
        onClose={() => setCameraAssignmentId(null)}
        onCapture={handleCameraCapture}
      />
    </>,
    document.body
  );
};
