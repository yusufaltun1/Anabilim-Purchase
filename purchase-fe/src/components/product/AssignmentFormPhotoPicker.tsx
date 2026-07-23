import { useRef, useState } from 'react';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { dataUrlToFile } from '../../utils/imageFile';

interface AssignmentFormPhotoPickerProps {
  file: File | null;
  preview: string | null;
  onChange: (file: File | null, preview: string | null) => void;
  disabled?: boolean;
  label?: string;
}

export const AssignmentFormPhotoPicker = ({
  file,
  preview,
  onChange,
  disabled = false,
  label = 'Ürün fotoğrafı (form F8 hücresi)',
}: AssignmentFormPhotoPickerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const applyPhoto = (nextFile: File) => {
    if (preview) URL.revokeObjectURL(preview);
    onChange(nextFile, URL.createObjectURL(nextFile));
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0];
    e.target.value = '';
    if (!nextFile) return;
    applyPhoto(nextFile);
  };

  const handleCameraCapture = (dataUrl: string) => {
    applyPhoto(dataUrlToFile(dataUrl, `zimmet-foto-${Date.now()}.jpg`));
    setCameraOpen(false);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          disabled={disabled}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Kameradan çek
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Dosyadan seç
        </button>
      </div>
      {preview && (
        <img
          src={preview}
          alt="Seçilen ürün fotoğrafı"
          className="mt-2 h-16 w-16 rounded object-cover border border-gray-200"
        />
      )}
      {file && !preview && <p className="mt-1 text-xs text-gray-500">{file.name}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileSelected}
      />
      <CameraCaptureModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
