import { Button, Card, Text } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fullName, type SchoolPersonnel } from '@/services/types/personnel.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { PersonnelStatusBadge } from './PersonnelStatusBadge';

export type PersonnelListItemProps = {
  person: SchoolPersonnel;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function PersonnelListItem({
  person,
  onPress,
  onEdit,
  onDelete,
}: PersonnelListItemProps) {
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
              {fullName(person)}
            </Text>
            <Text variant="caption" numberOfLines={1}>
              {person.role} · {person.employmentType}
            </Text>
          </View>
          <PersonnelStatusBadge status={person.status} />
        </View>

        <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="school-outline" size={14} color={colors.textMuted} />
            <Text variant="caption" numberOfLines={1}>
              {person.schoolName || 'Okul bilgisi yok'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
            <Text variant="caption" numberOfLines={1}>
              {person.email}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="call-outline" size={14} color={colors.textMuted} />
            <Text variant="caption" numberOfLines={1}>
              {person.phone}
            </Text>
          </View>
          {person.branchSubject ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="book-outline" size={14} color={colors.textMuted} />
              <Text variant="caption" numberOfLines={1}>
                Branş: {person.branchSubject}
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
