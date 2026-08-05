import { Button, Card, Text } from '@/components/ui';
import { productTypeLabel } from '@/domain/stockroom/productLabels';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Product } from '@/services/types/product.types';
import React from 'react';
import { View } from 'react-native';
import { ProductStatusBadge } from './ProductStatusBadge';

export type ProductListItemProps = {
  product: Product;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClone?: () => void;
  canManage?: boolean;
};

export function ProductListItem({
  product,
  onPress,
  onEdit,
  onDelete,
  onClone,
  canManage = false,
}: ProductListItemProps) {
  const { colors, spacing } = useAppTheme();
  const isActive = product.isActive ?? product.active ?? true;
  const categoryName =
    product.category?.name ??
    (typeof product.category === 'string' ? product.category : undefined);

  const locationLines: string[] = [];
  if (product.schoolName) locationLines.push(product.schoolName);
  if (product.defaultParentLocationName) locationLines.push(product.defaultParentLocationName);
  if (product.defaultChildLocationName) locationLines.push(product.defaultChildLocationName);
  if (product.stockItemStatus === 'IN_STOCK' && product.warehouseName) {
    locationLines.push(`Depo: ${product.warehouseName}`);
  }

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
              {product.name}
            </Text>
            {product.code ? (
              <Text variant="caption" numberOfLines={1}>
                {product.code}
              </Text>
            ) : null}
          </View>
          <ProductStatusBadge isActive={isActive} />
        </View>

        <View style={{ gap: spacing.xs }}>
          {categoryName ? (
            <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
              Kategori: {categoryName}
            </Text>
          ) : null}
          {product.productType ? (
            <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
              Tip: {productTypeLabel(product.productType)}
            </Text>
          ) : null}
          {locationLines.length > 0 ? (
            <Text variant="caption" color={colors.textSecondary} numberOfLines={3}>
              Konum: {locationLines.join(' · ')}
            </Text>
          ) : null}
        </View>
      </View>

      {canManage && (onEdit || onDelete || onClone) ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
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
          {onClone ? (
            <Button title="Kopyala" onPress={onClone} variant="ghost" size="small" />
          ) : null}
          {onEdit ? (
            <Button title="Düzenle" onPress={onEdit} variant="outline" size="small" />
          ) : null}
          {onDelete ? (
            <Button title="Sil" onPress={onDelete} variant="destructive" size="small" />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
