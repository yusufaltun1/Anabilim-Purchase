import { Assignment, AssignmentStatus } from '../../types/assignment';
import { assignmentService } from '../../services/assignment.service';
import { AssignmentPhotoThumb } from './AssignmentFormPhotoThumb';

interface AssignmentDocumentLinksProps {
  assignment: Assignment;
  downloadingId?: number | null;
  onDownloadingChange?: (id: number | null) => void;
  onError?: (message: string) => void;
  onImageClick?: (blobUrl: string) => void;
  className?: string;
}

export const AssignmentDocumentLinks = ({
  assignment,
  downloadingId = null,
  onDownloadingChange,
  onError,
  onImageClick,
  className = 'flex flex-col gap-1',
}: AssignmentDocumentLinksProps) => {
  const busy = downloadingId === assignment.id;

  const run = async (action: () => Promise<void>, fallbackError: string) => {
    try {
      onDownloadingChange?.(assignment.id);
      await action();
    } catch (err: unknown) {
      onError?.(err instanceof Error ? err.message : fallbackError);
    } finally {
      onDownloadingChange?.(null);
    }
  };

  const links: { key: string; label: string; show: boolean; action: () => Promise<void>; error: string }[] = [
    {
      key: 'signed',
      label: 'İmzalı zimmet indir',
      show: !!assignment.hasSignedForm,
      action: () => assignmentService.downloadSignedAssignmentForm(assignment.id),
      error: 'İmzalı form indirilemedi',
    },
    {
      key: 'return-doc',
      label: 'İade belgesi indir',
      show: !!assignment.hasReturnDocument,
      action: () => assignmentService.downloadReturnDocument(assignment.id),
      error: 'İade belgesi indirilemedi',
    },
  ];

  const visible = links.filter((l) => l.show);
  const hasReturnPhoto = !!assignment.hasReturnPhoto || !!assignment.returnPhotoUrl;

  if (visible.length === 0 && !hasReturnPhoto && assignment.status !== AssignmentStatus.ACTIVE) {
    return <span className="text-xs text-gray-400">—</span>;
  }
  if (visible.length === 0 && !hasReturnPhoto) {
    return null;
  }

  return (
    <div className={className}>
      {hasReturnPhoto && (
        <div className="flex items-center gap-2">
          <AssignmentPhotoThumb
            assignmentId={assignment.id}
            kind="return"
            hasPhoto={assignment.hasReturnPhoto}
            photoUrl={assignment.returnPhotoUrl}
            className="h-10 w-10 rounded object-cover border border-gray-200"
            onImageClick={onImageClick}
          />
          <span className="text-xs text-gray-500">İade fotoğrafı</span>
        </div>
      )}
      {visible.map((link) => (
        <button
          key={link.key}
          type="button"
          onClick={() => run(link.action, link.error)}
          disabled={busy}
          className="text-green-700 hover:text-green-900 disabled:opacity-50 text-left text-sm"
        >
          {busy ? 'İndiriliyor…' : link.label}
        </button>
      ))}
    </div>
  );
};
