import { Badge } from '@/components/ui';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export type UserStatusBadgeProps = {
  isActive?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function UserStatusBadge({ isActive = true, style }: UserStatusBadgeProps) {
  return (
    <Badge
      label={isActive ? 'Aktif' : 'Pasif'}
      tone={isActive ? 'success' : 'neutral'}
      style={style}
    />
  );
}
