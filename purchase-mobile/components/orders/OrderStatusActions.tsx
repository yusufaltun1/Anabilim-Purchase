import { Button, Card, Section, Text } from '@/components/ui';
import {
  canStockEntry,
  getOrderStatusTransitions,
  type PurchaseOrderStatus,
} from '@/domain/orders/orderStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { View } from 'react-native';

export type OrderStatusActionsProps = {
  status: PurchaseOrderStatus | undefined;
  loading?: boolean;
  onTransition: (nextStatus: string, label: string) => void;
  showStockEntry?: boolean;
  onStockEntry?: () => void;
};

export function OrderStatusActions({
  status,
  loading = false,
  onTransition,
  showStockEntry = false,
  onStockEntry,
}: OrderStatusActionsProps) {
  const { spacing } = useAppTheme();
  const transitions = getOrderStatusTransitions(status);
  const stockAllowed = showStockEntry && canStockEntry(status, false) && !!onStockEntry;

  if (transitions.length === 0 && !stockAllowed) {
    return null;
  }

  return (
    <Section title="Durum işlemleri">
      <Card>
        <Text variant="caption" style={{ marginBottom: spacing.md }}>
          Sipariş durumunu güncelleyin veya stok girişi yapın.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {transitions.map((t) => (
            <Button
              key={t.next}
              title={t.label}
              onPress={() => onTransition(t.next, t.label)}
              variant={t.variant}
              size="small"
              disabled={loading}
              loading={loading}
            />
          ))}
          {stockAllowed ? (
            <Button
              title="Stoğa Kaydet"
              onPress={onStockEntry!}
              variant="secondary"
              size="small"
              disabled={loading}
            />
          ) : null}
        </View>
      </Card>
    </Section>
  );
}
