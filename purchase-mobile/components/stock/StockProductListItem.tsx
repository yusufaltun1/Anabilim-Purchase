import { StockStatusBadge } from '@/components/products/ProductStatusBadge';
import { Card, Text } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  resolveStockStatus,
  type ProductStockSummary,
} from '@/services/types/product.types';
import React from 'react';
import { View } from 'react-native';

export type StockProductListItemProps = {
  stock: ProductStockSummary;
  onPress?: () => void;
};

export function StockProductListItem({ stock, onPress }: StockProductListItemProps) {
  const { colors, spacing } = useAppTheme();
  const status = resolveStockStatus(stock);

  return (
    <Card onPress={onPress} style={{ marginBottom: spacing.md }} padding={0}>
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <View style={{ flex: 1, gap: spacing.xxs }}>
            <Text variant="bodyStrong" numberOfLines={2}>
              {stock.name}
            </Text>
            {stock.code ? (
              <Text variant="caption" numberOfLines={1}>
                {stock.code}
              </Text>
            ) : null}
          </View>
          <StockStatusBadge status={status} />
        </View>

        <View style={{ gap: spacing.xs }}>
          {stock.category ? (
            <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
              Kategori: {stock.category}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs }}>
            <Text variant="caption" color={colors.text}>
              Stok: {stock.totalStock ?? 0}
              {stock.unit ? ` ${stock.unit}` : ''}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              Depo: {stock.warehouseCount ?? 0}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
