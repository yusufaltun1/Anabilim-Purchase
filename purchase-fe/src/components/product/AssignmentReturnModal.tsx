import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { Assignment } from '../../types/assignment';
import { assignmentService } from '../../services/assignment.service';

interface AssignmentReturnModalProps {
  isOpen: boolean;
  assignment: Assignment | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: { photo: File; document: File; notes?: string }) => void | Promise<void>;
}

const dataUrlToFile = (dataUrl: string, fileName: string): File => {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header?.match(/data:(.*?);/);
  const mime = mimeMatch?.[1] || 'image/jpeg';
  const binary = atob(base64 || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], fileName, { type: mime });
};

export const AssignmentReturnModal = ({
  isOpen,
  assignment,
  submitting = false,
  onClose,
  onSubmit,
}: AssignmentReturnModalProps) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formDownloading, setFormDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPhoto(null);
    setPhotoPreview(null);
    setDocumentFile(null);
    setNotes('');
    setError(null);
    setCameraOpen(false);
    setFormDownloading(false);
  }, [isOpen, assignment?.id]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  if (!isOpen || !assignment) return null;

  const assigneeLabel =
    assignment.assignedUserName ||
    assignment.assignedLocationName ||
    assignment.locationName ||
    '—';

  const applyPhoto = (file: File) => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    applyPhoto(file);
  };

  const handleDocumentSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setDocumentFile(file);
    setError(null);
  };

  const handleCameraCapture = (dataUrl: string) => {
    applyPhoto(dataUrlToFile(dataUrl, `iade-foto-${Date.now()}.jpg`));
    setCameraOpen(false);
  };

  const handleDownloadReturnForm = async () => {
    if (!assignment) return;
    try {
      setFormDownloading(true);
      setError(null);
      await assignmentService.downloadReturnAssignmentForm(assignment.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'İade formu indirilemedi');
    } finally {
      setFormDownloading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) {
      setError('İade için ürün fotoğrafı zorunludur.');
      return;
    }
    if (!documentFile) {
      setError('İade için imzalı iade formu yüklemeniz gerekir.');
      return;
    }
    await onSubmit({
      photo,
      document: documentFile,
      notes: notes.trim() || undefined,
    });
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 className="text-base font-semibold text-gray-900">Zimmet iadesi</h3>
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

          <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">{assigneeLabel}</span> üzerindeki zimmet
              geri alınacak. Önce iade formunu indirip imzalatın, ardından ürün fotoğrafı ve imzalı
              formu yükleyin.
            </p>

            <div className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-3 space-y-2">
              <p className="text-xs font-medium text-indigo-900">1. İade formu</p>
              <button
                type="button"
                onClick={handleDownloadReturnForm}
                disabled={submitting || formDownloading}
                className="px-3 py-1.5 text-sm rounded-md border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
              >
                {formDownloading ? 'İndiriliyor…' : 'İade formunu indir'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ürün fotoğrafı *
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCameraOpen(true)}
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Kameradan çek
                </button>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Dosyadan seç
                </button>
              </div>
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="İade fotoğrafı önizleme"
                  className="mt-2 h-28 w-28 rounded object-cover border border-gray-200"
                />
              )}
              {photo && !photoPreview && (
                <p className="mt-1 text-xs text-gray-500">{photo.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                İmzalı iade formu *
              </label>
              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                disabled={submitting}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {documentFile ? 'İmzalı formu değiştir' : 'İmzalı iade formu yükle'}
              </button>
              {documentFile && (
                <p className="mt-1 text-xs text-gray-600 truncate">{documentFile.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">Sadece Excel `.xlsx` dosyası (max 20 MB)</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">İade notu</label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Opsiyonel açıklama"
                disabled={submitting}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
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
                {submitting ? 'İade ediliyor…' : 'İade et'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handlePhotoSelected}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={handleDocumentSelected}
      />

      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>,
    document.body
  );
};
