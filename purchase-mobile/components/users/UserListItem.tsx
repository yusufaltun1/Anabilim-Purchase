import { Button, Card, Text } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { isUserActive, userDisplayName, type User } from '@/services/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { UserStatusBadge } from './UserStatusBadge';

export type UserListItemProps = {
  user: User;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function UserListItem({ user, onPress, onEdit, onDelete }: UserListItemProps) {
  const { colors, spacing } = useAppTheme();
  const active = isUserActive(user);
  const name = userDisplayName(user);
  const rolesLabel = (user.roles ?? []).join(', ');

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
              {name}
            </Text>
            {user.email ? (
              <Text variant="caption" numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>
          <UserStatusBadge isActive={active} />
        </View>

        <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
          {(user.department || user.position) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="briefcase-outline" size={14} color={colors.textMuted} />
              <Text variant="caption" numberOfLines={1}>
                {[user.department, user.position].filter(Boolean).join(' · ')}
              </Text>
            </View>
          )}
          {user.phone ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="call-outline" size={14} color={colors.textMuted} />
              <Text variant="caption" numberOfLines={1}>
                {user.phone}
              </Text>
            </View>
          ) : null}
          {rolesLabel ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="shield-outline" size={14} color={colors.textMuted} />
              <Text variant="caption" numberOfLines={2}>
                {rolesLabel}
              </Text>
            </View>
          ) : null}
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
