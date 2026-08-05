import { Button, Card, Text } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getSchoolTypeLabel, type School } from '@/services/types/school.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { SchoolStatusBadge } from './SchoolStatusBadge';

export type SchoolListItemProps = {
  school: School;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function SchoolListItem({ school, onPress, onEdit, onDelete }: SchoolListItemProps) {
  const { colors, spacing } = useAppTheme();

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
              {school.name}
            </Text>
            <Text variant="caption" numberOfLines={1}>
              {school.code} · {getSchoolTypeLabel(school.schoolType)}
            </Text>
          </View>
          <SchoolStatusBadge isActive={school.isActive} />
        </View>

        <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text variant="caption" numberOfLines={1}>
              {school.city}, {school.district}
            </Text>
          </View>
          {school.principalName ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="person-outline" size={14} color={colors.textMuted} />
              <Text variant="caption" numberOfLines={1}>
                {school.principalName}
              </Text>
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="people-outline" size={14} color={colors.textMuted} />
            <Text variant="caption" numberOfLines={1}>
              Kapasite: {school.studentCapacity.toLocaleString('tr-TR')}
            </Text>
          </View>
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
