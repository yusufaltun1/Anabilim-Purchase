import { Badge } from '@/components/ui';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export type SchoolStatusBadgeProps = {
  isActive?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SchoolStatusBadge({ isActive = true, style }: SchoolStatusBadgeProps) {
  return (
    <Badge
      label={isActive ? 'Aktif' : 'Pasif'}
      tone={isActive ? 'success' : 'neutral'}
      style={style}
    />
  );
}
