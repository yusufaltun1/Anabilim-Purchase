import type { BadgeTone } from '@/components/ui';
import type { Ionicons } from '@expo/vector-icons';

export type RequestStatusCode =
  | 'DRAFT'
  | 'PENDING'
  | 'IN_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'IN_PROGRESS'
  | 'PARTIAL_APPROVAL'
  | 'PARTIALLY_APPROVED'
  | 'COMPLETED'
  | string;

export type RequestStatusMeta = {
  code: string;
  label: string;
  tone: BadgeTone;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const STATUS_MAP: Record<string, Omit<RequestStatusMeta, 'code'>> = {
  DRAFT: {
    label: 'Taslak',
    tone: 'neutral',
    icon: 'document-outline',
    color: '#64748b',
  },
  PENDING: {
    label: 'Beklemede',
    tone: 'neutral',
    icon: 'hourglass-outline',
    color: '#64748b',
  },
  IN_APPROVAL: {
    label: 'Onay Bekliyor',
    tone: 'warning',
    icon: 'time-outline',
    color: '#d97706',
  },
  APPROVED: {
    label: 'Onaylandı',
    tone: 'success',
    icon: 'checkmark-circle',
    color: '#15803d',
  },
  REJECTED: {
    label: 'Reddedildi',
    tone: 'error',
    icon: 'close-circle',
    color: '#db0032',
  },
  CANCELLED: {
    label: 'İptal Edildi',
    tone: 'neutral',
    icon: 'ban',
    color: '#64748b',
  },
  IN_PROGRESS: {
    label: 'İşlemde',
    tone: 'info',
    icon: 'sync',
    color: '#475569',
  },
  PARTIAL_APPROVAL: {
    label: 'Kısmi Onay',
    tone: 'primary',
    icon: 'git-branch-outline',
    color: '#db0032',
  },
  PARTIALLY_APPROVED: {
    label: 'Kısmi Onay',
    tone: 'primary',
    icon: 'git-branch-outline',
    color: '#db0032',
  },
  COMPLETED: {
    label: 'Tamamlandı',
    tone: 'success',
    icon: 'checkmark-done-circle',
    color: '#15803d',
  },
};

const OPEN_STATUSES = new Set([
  'PENDING',
  'IN_PROGRESS',
  'IN_APPROVAL',
  'WAITING_APPROVAL',
  'PARTIAL_APPROVAL',
  'PARTIALLY_APPROVED',
]);

export function getRequestStatusMeta(status: RequestStatusCode | undefined): RequestStatusMeta {
  const code = (status ?? 'UNKNOWN').toUpperCase();
  const meta = STATUS_MAP[code];
  if (meta) return { code, ...meta };
  return {
    code,
    label: status ?? 'Bilinmiyor',
    tone: 'neutral',
    icon: 'document-text',
    color: '#0f172a',
  };
}

export function getRequestStatusLabel(status: RequestStatusCode | undefined): string {
  return getRequestStatusMeta(status).label;
}

export function isOpenRequestStatus(status: string | undefined): boolean {
  if (!status) return false;
  return OPEN_STATUSES.has(status.toUpperCase());
}

export function formatRequestDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRequesterName(requester?: {
  fullName?: string;
  firstName?: string;
  lastName?: string;
}): string {
  if (!requester) return '—';
  if (requester.fullName?.trim()) return requester.fullName.trim();
  const name = `${requester.firstName ?? ''} ${requester.lastName ?? ''}`.trim();
  return name || '—';
}
