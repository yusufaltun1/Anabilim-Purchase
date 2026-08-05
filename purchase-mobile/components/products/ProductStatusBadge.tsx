import { Badge } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';
import React from 'react';

export type ProductStatusBadgeProps = {
  isActive?: boolean;
};

export function ProductStatusBadge({ isActive = true }: ProductStatusBadgeProps) {
  return <Badge label={isActive ? 'Aktif' : 'Pasif'} tone={isActive ? 'success' : 'neutral'} />;
}

export type StockStatusBadgeProps = {
  status: 'passive' | 'low' | 'normal';
};

const STOCK_STATUS: Record<
  StockStatusBadgeProps['status'],
  { label: string; tone: BadgeTone }
> = {
  passive: { label: 'Pasif', tone: 'neutral' },
  low: { label: 'Düşük', tone: 'error' },
  normal: { label: 'Normal', tone: 'success' },
};

export function StockStatusBadge({ status }: StockStatusBadgeProps) {
  const cfg = STOCK_STATUS[status];
  return <Badge label={cfg.label} tone={cfg.tone} />;
}
