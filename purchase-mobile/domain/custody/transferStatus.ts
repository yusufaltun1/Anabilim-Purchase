import type { BadgeTone } from '@/components/ui';
import type { Ionicons } from '@expo/vector-icons';

export type TransferStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PREPARING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'PARTIALLY_COMPLETED'
  | string;

export type TransferStatusMeta = {
  code: string;
  label: string;
  tone: BadgeTone;
  icon: keyof typeof Ionicons.glyphMap;
};

const STATUS_MAP: Record<string, Omit<TransferStatusMeta, 'code'>> = {
  PENDING: { label: 'Beklemede', tone: 'warning', icon: 'time-outline' },
  APPROVED: { label: 'Onaylandı', tone: 'info', icon: 'checkmark-circle-outline' },
  PREPARING: { label: 'Hazırlanıyor', tone: 'info', icon: 'cube-outline' },
  IN_TRANSIT: { label: 'Yolda', tone: 'primary', icon: 'car-outline' },
  DELIVERED: { label: 'Teslim Edildi', tone: 'success', icon: 'cube' },
  COMPLETED: { label: 'Tamamlandı', tone: 'success', icon: 'checkmark-done-circle' },
  CANCELLED: { label: 'İptal Edildi', tone: 'error', icon: 'ban' },
  REJECTED: { label: 'Reddedildi', tone: 'error', icon: 'close-circle' },
  PARTIALLY_COMPLETED: { label: 'Kısmen Tamamlandı', tone: 'info', icon: 'ellipsis-horizontal-circle' },
};

export const TRANSFER_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'PENDING', label: 'Beklemede' },
  { value: 'APPROVED', label: 'Onaylandı' },
  { value: 'PREPARING', label: 'Hazırlanıyor' },
  { value: 'IN_TRANSIT', label: 'Yolda' },
  { value: 'DELIVERED', label: 'Teslim Edildi' },
  { value: 'COMPLETED', label: 'Tamamlandı' },
  { value: 'CANCELLED', label: 'İptal Edildi' },
  { value: 'REJECTED', label: 'Reddedildi' },
];

export function getTransferStatusMeta(status: TransferStatus | undefined): TransferStatusMeta {
  const code = status || 'UNKNOWN';
  const meta = STATUS_MAP[code];
  if (meta) return { code, ...meta };
  return { code, label: code, tone: 'neutral', icon: 'help-circle-outline' };
}

export type TransferStatusAction = {
  next: TransferStatus;
  label: string;
  variant: 'primary' | 'destructive' | 'outline' | 'secondary';
};

/** Yönetim akışı: PENDING → APPROVED|REJECTED → PREPARING → IN_TRANSIT → DELIVERED */
export function getTransferNextActions(status: TransferStatus | undefined): TransferStatusAction[] {
  switch (status) {
    case 'PENDING':
      return [
        { next: 'APPROVED', label: 'Onayla', variant: 'primary' },
        { next: 'REJECTED', label: 'Reddet', variant: 'destructive' },
      ];
    case 'APPROVED':
      return [{ next: 'PREPARING', label: 'Hazırlamaya Başla', variant: 'primary' }];
    case 'PREPARING':
      return [{ next: 'IN_TRANSIT', label: 'Sevkiyata Başla', variant: 'primary' }];
    case 'IN_TRANSIT':
      return [{ next: 'DELIVERED', label: 'Teslim Edildi', variant: 'primary' }];
    default:
      return [];
  }
}

export function canEditTransferQuantity(status: TransferStatus | undefined): boolean {
  return status === 'PREPARING' || status === 'IN_TRANSIT';
}

export function formatTransferDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTransferDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function warehouseLabel(
  warehouse?: { id?: number; name?: string } | null,
  fallbackId?: number | null
): string {
  if (warehouse?.name) return warehouse.name;
  const id = warehouse?.id ?? fallbackId;
  return id != null ? `Depo ${id}` : '—';
}
