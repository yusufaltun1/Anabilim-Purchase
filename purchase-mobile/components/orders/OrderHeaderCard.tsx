import { Card, Text } from '@/components/ui';
import {
  formatOrderDate,
  getOrderProductCode,
  getOrderProductName,
  getOrderSupplierName,
} from '@/domain/orders/orderStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { PurchaseOrder } from '@/services/api/purchase-order.service';
import React from 'react';
import { View } from 'react-native';
import { OrderStatusBadge } from './OrderStatusBadge';

export type OrderHeaderCardProps = {
  order: PurchaseOrder;
};

export function OrderHeaderCard({ order }: OrderHeaderCardProps) {
  const { spacing } = useAppTheme();
  const productName = getOrderProductName(order);
  const productCode = getOrderProductCode(order);
  const supplierName = getOrderSupplierName(order);

  return (
    <Card style={{ marginBottom: spacing.lg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text variant="h3">{order.orderCode || `Sipariş #${order.id}`}</Text>
          <Text variant="body">{productName}</Text>
          {productCode ? <Text variant="caption">{productCode}</Text> : null}
        </View>
        <OrderStatusBadge status={order.status} />
      </View>
      <View style={{ gap: spacing.xs }}>
        <Text variant="caption">Tedarikçi: {supplierName}</Text>
        <Text variant="caption">Oluşturulma: {formatOrderDate(order.createdAt)}</Text>
        {order.updatedAt ? (
          <Text variant="caption">Güncelleme: {formatOrderDate(order.updatedAt)}</Text>
        ) : null}
      </View>
    </Card>
  );
}
