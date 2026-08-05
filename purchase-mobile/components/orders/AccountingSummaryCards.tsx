import { Card, Text } from '@/components/ui';
import { formatOrderMoney } from '@/domain/orders/orderStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { PurchaseOrder } from '@/services/api/purchase-order.service';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { View } from 'react-native';

export type AccountingSummaryCardsProps = {
  orders: PurchaseOrder[];
};

export function AccountingSummaryCards({ orders }: AccountingSummaryCardsProps) {
  const { colors, spacing } = useAppTheme();

  const summary = useMemo(() => {
    const totalAmount = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
    const currency = orders[0]?.supplierQuote?.currency || 'TRY';
    return {
      count: orders.length,
      deliveredCount,
      totalAmount,
      currency,
    };
  }, [orders]);

  const cards = [
    {
      key: 'count',
      label: 'Toplam sipariş',
      value: String(summary.count),
      icon: 'document-text-outline' as const,
      color: colors.primary,
    },
    {
      key: 'delivered',
      label: 'Teslim edilen',
      value: String(summary.deliveredCount),
      icon: 'checkmark-circle-outline' as const,
      color: colors.success,
    },
    {
      key: 'total',
      label: 'Toplam tutar',
      value: formatOrderMoney(summary.totalAmount, summary.currency),
      icon: 'cash-outline' as const,
      color: colors.info,
    },
  ];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
      {cards.map((c) => (
        <Card
          key={c.key}
          style={{ flexGrow: 1, flexBasis: '30%', minWidth: 100 }}
          padding={spacing.md}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
            <Ionicons name={c.icon} size={16} color={c.color} />
            <Text variant="caption" numberOfLines={1}>
              {c.label}
            </Text>
          </View>
          <Text variant="bodyStrong" numberOfLines={1}>
            {c.value}
          </Text>
        </Card>
      ))}
    </View>
  );
}
