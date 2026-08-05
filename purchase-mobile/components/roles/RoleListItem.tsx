import { Button, Card, Text } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getRolePermissionNames, type Role } from '@/services/types/role.types';
import React from 'react';
import { View } from 'react-native';
import { RoleStatusBadge } from './RoleStatusBadge';

export type RoleListItemProps = {
  role: Role;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function RoleListItem({ role, onPress, onEdit, onDelete }: RoleListItemProps) {
  const { colors, spacing } = useAppTheme();
  const permissionCount = getRolePermissionNames(role).length;

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
              {role.displayName}
            </Text>
            <Text variant="caption" numberOfLines={1}>
              {role.name}
            </Text>
          </View>
          <RoleStatusBadge role={role} />
        </View>

        {role.description ? (
          <Text variant="caption" numberOfLines={2} color={colors.textSecondary}>
            {role.description}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          <Text variant="caption">
            Tip: {role.isSystemRole ? 'Sistem' : 'Özel'}
          </Text>
          <Text variant="caption">İzin: {permissionCount}</Text>
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
          {onDelete && !role.isSystemRole ? (
            <Button title="Sil" onPress={onDelete} variant="destructive" size="small" />
          ) : null}
        </View>
      )}
    </Card>
  );
}
