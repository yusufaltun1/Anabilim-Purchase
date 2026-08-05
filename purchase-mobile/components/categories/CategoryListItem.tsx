import { Button, Card, Chip, Text } from '@/components/ui';
import { getCategoryProductTypeLabel } from '@/domain/stockroom/categoryLabels';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Category } from '@/services/types/category.types';
import React from 'react';
import { View } from 'react-native';
import { CategoryStatusBadge } from './CategoryStatusBadge';

export type CategoryListItemProps = {
  category: Category;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function CategoryListItem({ category, onPress, onEdit, onDelete }: CategoryListItemProps) {
  const { colors, spacing } = useAppTheme();
  const available = category.availableQuantity ?? 0;
  const isLowStock =
    category.minStockNotifyAt != null && available <= category.minStockNotifyAt;

  return (
    <Card onPress={onPress} style={{ marginBottom: spacing.md }} padding={0}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm }}>
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
              {category.name}
            </Text>
            {category.code ? (
              <Text variant="caption" numberOfLines={1}>
                {category.code}
              </Text>
            ) : null}
            <Text variant="caption" color={colors.textMuted}>
              {getCategoryProductTypeLabel(category.productType)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
            <CategoryStatusBadge isActive={category.isActive} />
            {category.requestable ? <Chip label="Talep edilebilir" selected disabled /> : null}
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            marginTop: spacing.xs,
          }}
        >
          <Metric label="Ürün" value={category.activeProductCount ?? 0} />
          <Metric label="Toplam" value={category.totalQuantity ?? 0} />
          <Metric label="Atanan" value={category.assignedQuantity ?? 0} />
          <Metric
            label="Kalan"
            value={available}
            valueColor={isLowStock ? colors.error : undefined}
          />
        </View>
      </View>

      {(onEdit || onDelete) && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
            paddingTop: spacing.sm,
          }}
          onStartShouldSetResponder={() => true}
        >
          {onEdit ? (
            <Button title="Düzenle" onPress={onEdit} variant="outline" size="small" />
          ) : null}
          {onDelete ? (
            <Button title="Sil" onPress={onDelete} variant="destructive" size="small" />
          ) : null}
        </View>
      )}
    </Card>
  );
}

function Metric({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: number;
  valueColor?: string;
}) {
  return (
    <View style={{ minWidth: 56 }}>
      <Text variant="caption">{label}</Text>
      <Text variant="bodyStrong" color={valueColor} style={{ marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}
