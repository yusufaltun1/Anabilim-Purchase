import { Badge } from '@/components/ui';
import type { Role } from '@/services/types/role.types';
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

export type RoleStatusBadgeProps = {
  role: Pick<Role, 'isActive' | 'isSystemRole'>;
  style?: StyleProp<ViewStyle>;
};

export function RoleStatusBadge({ role, style }: RoleStatusBadgeProps) {
  if (!role.isActive) {
    return <Badge label="Pasif" tone="error" style={style} />;
  }
  if (role.isSystemRole) {
    return (
      <View style={[{ flexDirection: 'row', gap: 6 }, style]}>
        <Badge label="Aktif" tone="success" />
        <Badge label="Sistem" tone="info" />
      </View>
    );
  }
  return <Badge label="Aktif" tone="success" style={style} />;
}
