import { useEffect, useRef, useState } from 'react';
import { assignmentService } from '../../services/assignment.service';

interface AssignmentFormPhotoThumbProps {
  assignmentId: number;
  hasFormPhoto?: boolean;
  formPhotoUrl?: string;
  className?: string;
  onImageClick?: (blobUrl: string) => void;
}

export const AssignmentFormPhotoThumb = ({
  assignmentId,
  hasFormPhoto,
  formPhotoUrl,
  className = 'h-10 w-10 rounded object-cover border border-gray-200',
  onImageClick,
}: AssignmentFormPhotoThumbProps) => {
  const showPhoto = hasFormPhoto || !!formPhotoUrl;
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

    assignmentService
      .fetchFormPhotoBlobUrl(assignmentId)
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
  }, [assignmentId, showPhoto]);

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

  if (onImageClick) {
    return (
      <button type="button" onClick={() => onImageClick(src)} className="block">
        <img src={src} alt="Zimmet ürün fotoğrafı" className={className} />
      </button>
    );
  }

  return <img src={src} alt="Zimmet ürün fotoğrafı" className={className} />;
};
