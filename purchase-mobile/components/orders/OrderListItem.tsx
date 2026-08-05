import { Button, Card, Text } from '@/components/ui';
import {
  canStockEntry,
  formatOrderDate,
  formatOrderMoney,
  getOrderProductCode,
  getOrderProductName,
  getOrderSupplierName,
} from '@/domain/orders/orderStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { PurchaseOrder } from '@/services/api/purchase-order.service';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { OrderStatusBadge } from './OrderStatusBadge';

export type OrderListItemProps = {
  order: PurchaseOrder;
  onPress?: () => void;
  onStockEntry?: (order: PurchaseOrder) => void;
  showStockEntry?: boolean;
};

export function OrderListItem({
  order,
  onPress,
  onStockEntry,
  showStockEntry = false,
}: OrderListItemProps) {
  const { colors, spacing } = useAppTheme();
  const currency = order.supplierQuote?.currency || 'TRY';
  const productName = getOrderProductName(order);
  const productCode = getOrderProductCode(order);
  const supplierName = getOrderSupplierName(order);
  const canEntry = showStockEntry && canStockEntry(order.status, true) && !!onStockEntry;

  return (
    <Card onPress={onPress} style={{ marginBottom: spacing.md }} padding={0}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
          <View style={{ flex: 1, gap: spacing.xxs }}>
            <Text variant="bodyStrong" numberOfLines={1}>
              {order.orderCode || `Sipariş #${order.id}`}
            </Text>
            <Text variant="body" numberOfLines={2}>
              {productName}
            </Text>
            {productCode ? (
              <Text variant="caption" numberOfLines={1}>
                {productCode}
              </Text>
            ) : null}
          </View>
          <OrderStatusBadge status={order.status} />
        </View>

        <Text variant="caption" numberOfLines={1}>
          Tedarikçi: {supplierName}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            marginTop: spacing.xs,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="layers-outline" size={14} color={colors.textMuted} />
            <Text variant="caption">Adet: {order.quantity ?? '—'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="cash-outline" size={14} color={colors.textMuted} />
            <Text variant="caption">{formatOrderMoney(order.totalPrice, currency)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text variant="caption">{formatOrderDate(order.expectedDeliveryDate)}</Text>
          </View>
        </View>
      </View>

      {canEntry ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
            paddingTop: spacing.sm,
          }}
          onStartShouldSetResponder={() => true}
        >
          <Button
            title="Stoğa Kaydet"
            onPress={() => onStockEntry?.(order)}
            variant="outline"
            size="small"
          />
        </View>
      ) : null}
    </Card>
  );
}
