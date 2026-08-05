import { Button, Card, Text } from '@/components/ui';
import { isWarehouseActive } from '@/domain/sitemap/warehouseLabels';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Warehouse } from '@/services/api/warehouse.service';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { WarehouseStatusBadge } from './WarehouseStatusBadge';

export type WarehouseListItemProps = {
  warehouse: Warehouse;
  onPress?: () => void;
  onToggleStatus?: () => void;
  statusLoading?: boolean;
};

export function WarehouseListItem({
  warehouse,
  onPress,
  onToggleStatus,
  statusLoading = false,
}: WarehouseListItemProps) {
  const { colors, spacing } = useAppTheme();
  const active = isWarehouseActive(warehouse);

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
              {warehouse.name}
            </Text>
            {warehouse.code ? (
              <Text variant="caption" color={colors.primary} numberOfLines={1}>
                {warehouse.code}
              </Text>
            ) : null}
          </View>
          <WarehouseStatusBadge isActive={active} />
        </View>

        <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
          {warehouse.managerName ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="person-outline" size={14} color={colors.textMuted} />
              <Text variant="caption" numberOfLines={1}>
                {warehouse.managerName}
              </Text>
            </View>
          ) : null}
          {warehouse.phone ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="call-outline" size={14} color={colors.textMuted} />
              <Text variant="caption" numberOfLines={1}>
                {warehouse.phone}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {onToggleStatus ? (
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
          <Button
            title={active ? 'Pasife Al' : 'Aktife Al'}
            onPress={onToggleStatus}
            variant={active ? 'destructive' : 'outline'}
            size="small"
            loading={statusLoading}
            disabled={statusLoading}
          />
        </View>
      ) : null}
    </Card>
  );
}
