import { Button, Card, Chip, Text } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Location } from '@/services/types/location.types';
import React from 'react';
import { View } from 'react-native';
import { LocationLevelBadge } from './LocationLevelBadge';

export type LocationListItemProps = {
  location: Location;
  depth?: number;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function LocationListItem({
  location,
  depth = 0,
  onPress,
  onEdit,
  onDelete,
}: LocationListItemProps) {
  const { colors, spacing } = useAppTheme();
  const indent = Math.min(depth, 2) * spacing.lg;

  return (
    <Card onPress={onPress} style={{ marginBottom: spacing.md }} padding={0}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: spacing.sm,
            paddingLeft: indent,
          }}
        >
          <View style={{ flex: 1, gap: spacing.xxs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              {depth > 0 ? (
                <Text variant="caption" color={colors.textMuted}>
                  └
                </Text>
              ) : null}
              <Text variant="bodyStrong" numberOfLines={2} style={{ flex: 1 }}>
                {location.name}
              </Text>
            </View>
            <Text variant="caption" color={colors.textMuted} numberOfLines={2}>
              {location.path || location.name}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
            <LocationLevelBadge level={location.level} depth={depth} />
            {location.isDefault ? <Chip label="Varsayılan" selected disabled /> : null}
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
