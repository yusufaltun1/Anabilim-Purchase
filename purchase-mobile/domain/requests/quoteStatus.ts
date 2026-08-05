import type { BadgeTone } from '@/components/ui';

export type QuoteStatusCode =
  | 'PENDING'
  | 'RESPONDED'
  | 'REJECTED'
  | 'CONVERTED_TO_ORDER'
  | string
  | undefined;

export type QuoteStatusMeta = {
  label: string;
  tone: BadgeTone;
};

export function getQuoteStatusMeta(status: QuoteStatusCode): QuoteStatusMeta {
  switch (status) {
    case 'RESPONDED':
      return { label: 'Yanıtlandı', tone: 'success' };
    case 'PENDING':
      return { label: 'Bekliyor', tone: 'warning' };
    case 'REJECTED':
      return { label: 'Reddedildi', tone: 'error' };
    case 'CONVERTED_TO_ORDER':
      return { label: 'Siparişe dönüştü', tone: 'info' };
    default:
      return { label: status || '—', tone: 'neutral' };
  }
}

export function formatQuoteMoney(amount: number | null | undefined, currency = 'TRY'): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₺';
  try {
    return `${amount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ${symbol}`;
  } catch {
    return `${amount} ${symbol}`;
  }
}
