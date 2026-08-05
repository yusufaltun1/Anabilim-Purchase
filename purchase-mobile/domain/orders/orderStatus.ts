import type { BadgeTone } from '@/components/ui';
import type { Ionicons } from '@expo/vector-icons';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED'
  | string;

export type OrderStatusMeta = {
  code: string;
  label: string;
  tone: BadgeTone;
  icon: keyof typeof Ionicons.glyphMap;
};

const STATUS_MAP: Record<string, Omit<OrderStatusMeta, 'code'>> = {
  DRAFT: { label: 'Taslak', tone: 'neutral', icon: 'document-outline' },
  PENDING: { label: 'Beklemede', tone: 'warning', icon: 'time-outline' },
  CONFIRMED: { label: 'Onaylandı', tone: 'success', icon: 'checkmark-circle' },
  SHIPPED: { label: 'Sevk Edildi', tone: 'info', icon: 'airplane-outline' },
  DELIVERED: { label: 'Teslim Edildi', tone: 'success', icon: 'cube' },
  CANCELLED: { label: 'İptal Edildi', tone: 'error', icon: 'ban' },
  REJECTED: { label: 'Reddedildi', tone: 'error', icon: 'close-circle' },
};

export const ORDER_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'PENDING', label: 'Beklemede' },
  { value: 'CONFIRMED', label: 'Onaylandı' },
  { value: 'SHIPPED', label: 'Sevk Edildi' },
  { value: 'DELIVERED', label: 'Teslim Edildi' },
  { value: 'CANCELLED', label: 'İptal Edildi' },
  { value: 'REJECTED', label: 'Reddedildi' },
];

export function getOrderStatusMeta(status: PurchaseOrderStatus | undefined): OrderStatusMeta {
  const code = status || 'UNKNOWN';
  const meta = STATUS_MAP[code];
  if (meta) return { code, ...meta };
  return { code, label: code, tone: 'neutral', icon: 'help-circle-outline' };
}

export function formatOrderMoney(amount: number | null | undefined, currency = 'TRY'): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₺';
  try {
    return `${amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ${symbol}`;
  } catch {
    return `${amount} ${symbol}`;
  }
}

export function formatOrderDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getOrderProductName(order: {
  supplierQuote?: { product?: { name?: string; code?: string } | null } | null;
}): string {
  return order.supplierQuote?.product?.name || 'Ürün bilgisi yok';
}

export function getOrderProductCode(order: {
  supplierQuote?: { product?: { name?: string; code?: string } | null } | null;
}): string {
  return order.supplierQuote?.product?.code || '';
}

export function getOrderSupplierName(order: {
  supplierQuote?: { supplier?: { companyName?: string; name?: string } | null } | null;
}): string {
  const s = order.supplierQuote?.supplier;
  return s?.companyName || s?.name || 'Tedarikçi yok';
}

export type StatusTransition = {
  next: PurchaseOrderStatus;
  label: string;
  variant: 'primary' | 'destructive' | 'outline';
};

export function getOrderStatusTransitions(status: PurchaseOrderStatus | undefined): StatusTransition[] {
  if (status === 'PENDING') {
    return [
      { next: 'CONFIRMED', label: 'Onayla', variant: 'primary' },
      { next: 'REJECTED', label: 'Reddet', variant: 'destructive' },
      { next: 'CANCELLED', label: 'İptal Et', variant: 'outline' },
    ];
  }
  if (status === 'CONFIRMED') {
    return [
      { next: 'SHIPPED', label: 'Sevk Et', variant: 'primary' },
      { next: 'CANCELLED', label: 'İptal Et', variant: 'outline' },
    ];
  }
  return [];
}

export function canStockEntry(status: PurchaseOrderStatus | undefined, fromList = false): boolean {
  if (fromList) return status === 'SHIPPED';
  return status !== 'PENDING' && status !== 'CONFIRMED' && status !== 'DELIVERED' && status !== 'CANCELLED' && status !== 'REJECTED';
}
