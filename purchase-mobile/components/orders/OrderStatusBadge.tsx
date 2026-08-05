import { Badge, type BadgeTone } from '@/components/ui';
import { getOrderStatusMeta, type PurchaseOrderStatus } from '@/domain/orders/orderStatus';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export type OrderStatusBadgeProps = {
  status: PurchaseOrderStatus | undefined;
  style?: StyleProp<ViewStyle>;
  toneOverride?: BadgeTone;
};

export function OrderStatusBadge({ status, style, toneOverride }: OrderStatusBadgeProps) {
  const meta = getOrderStatusMeta(status);
  return <Badge label={meta.label} tone={toneOverride ?? meta.tone} style={style} />;
}
