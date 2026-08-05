import { Badge } from '@/components/ui';
import { getWarehouseStatusLabel } from '@/domain/sitemap/warehouseLabels';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export type WarehouseStatusBadgeProps = {
  isActive?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function WarehouseStatusBadge({ isActive = true, style }: WarehouseStatusBadgeProps) {
  return (
    <Badge
      label={getWarehouseStatusLabel(isActive)}
      tone={isActive ? 'success' : 'neutral'}
      style={style}
    />
  );
}
