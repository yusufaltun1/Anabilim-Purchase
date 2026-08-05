import { useEffect, useRef, useState } from 'react';
import { assignmentService } from '../../services/assignment.service';

export type AssignmentPhotoKind = 'form' | 'return';

interface AssignmentPhotoThumbProps {
  assignmentId: number;
  kind?: AssignmentPhotoKind;
  hasPhoto?: boolean;
  photoUrl?: string;
  className?: string;
  alt?: string;
  onImageClick?: (blobUrl: string) => void;
}

/** Zimmet veya iade fotoğrafını indirmeden önizler; tıklanınca lightbox için URL verir. */
export const AssignmentPhotoThumb = ({
  assignmentId,
  kind = 'form',
  hasPhoto,
  photoUrl,
  className = 'h-10 w-10 rounded object-cover border border-gray-200',
  alt,
  onImageClick,
}: AssignmentPhotoThumbProps) => {
  const showPhoto = hasPhoto || !!photoUrl;
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!showPhoto) {
      setSrc(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchUrl =
      kind === 'return'
        ? assignmentService.fetchReturnPhotoBlobUrl(assignmentId)
        : assignmentService.fetchFormPhotoBlobUrl(assignmentId);

    fetchUrl
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        blobUrlRef.current = url;
        setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [assignmentId, showPhoto, kind]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  if (!showPhoto) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  if (loading) {
    return <div className={`${className} animate-pulse bg-gray-100`} />;
  }

  if (!src) {
    return <span className="text-xs text-gray-400">Yüklenemedi</span>;
  }

  const imageAlt =
    alt ?? (kind === 'return' ? 'İade ürün fotoğrafı' : 'Zimmet ürün fotoğrafı');

  if (onImageClick) {
    return (
      <button type="button" onClick={() => onImageClick(src)} className="block">
        <img src={src} alt={imageAlt} className={className} />
      </button>
    );
  }

  return <img src={src} alt={imageAlt} className={className} />;
};

/** @deprecated AssignmentPhotoThumb kullanın */
export const AssignmentFormPhotoThumb = ({
  assignmentId,
  hasFormPhoto,
  formPhotoUrl,
  className,
  onImageClick,
}: {
  assignmentId: number;
  hasFormPhoto?: boolean;
  formPhotoUrl?: string;
  className?: string;
  onImageClick?: (blobUrl: string) => void;
}) => (
  <AssignmentPhotoThumb
    assignmentId={assignmentId}
    kind="form"
    hasPhoto={hasFormPhoto}
    photoUrl={formPhotoUrl}
    className={className}
    onImageClick={onImageClick}
  />
);
