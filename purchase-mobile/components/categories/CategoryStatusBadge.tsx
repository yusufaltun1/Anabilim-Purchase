import { Badge } from '@/components/ui';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export type CategoryStatusBadgeProps = {
  isActive?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CategoryStatusBadge({ isActive = true, style }: CategoryStatusBadgeProps) {
  return (
    <Badge
      label={isActive ? 'Aktif' : 'Pasif'}
      tone={isActive ? 'success' : 'neutral'}
      style={style}
    />
  );
}
