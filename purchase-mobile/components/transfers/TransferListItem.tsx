import { Card, Text } from '@/components/ui';
import {
  formatTransferDate,
  warehouseLabel,
} from '@/domain/custody/transferStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AssetTransfer } from '@/services/api/transfer.service';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { TransferStatusBadge } from './TransferStatusBadge';

export type TransferListItemProps = {
  transfer: AssetTransfer;
  onPress?: () => void;
  showReceiveHint?: boolean;
};

export function TransferListItem({
  transfer,
  onPress,
  showReceiveHint = false,
}: TransferListItemProps) {
  const { colors, spacing } = useAppTheme();
  const source = warehouseLabel(transfer.sourceWarehouse, transfer.sourceWarehouseId);
  const target = warehouseLabel(
    transfer.targetWarehouse ??
      (transfer.targetSchool
        ? { id: transfer.targetSchool.id, name: transfer.targetSchool.name }
        : null),
    transfer.targetWarehouseId
  );
  const canHint =
    showReceiveHint &&
    (transfer.status === 'IN_TRANSIT' ||
      transfer.status === 'DELIVERED' ||
      transfer.status === 'PREPARING');

  return (
    <Card onPress={onPress} style={{ marginBottom: spacing.md }} padding={0}>
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
            {transfer.transferCode || `Transfer #${transfer.id}`}
          </Text>
          <TransferStatusBadge
            status={transfer.status}
            displayName={transfer.statusDisplayName}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="swap-horizontal" size={14} color={colors.textMuted} />
          <Text variant="caption" numberOfLines={2} style={{ flex: 1 }}>
            {source} → {target}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text variant="caption">{formatTransferDate(transfer.transferDate)}</Text>
          </View>
          {transfer.totalItemCount != null ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="cube-outline" size={14} color={colors.textMuted} />
              <Text variant="caption">{transfer.totalItemCount} kalem</Text>
            </View>
          ) : null}
        </View>

        {canHint ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              marginTop: spacing.xs,
              padding: spacing.sm,
              borderRadius: 8,
              backgroundColor: colors.primary + '14',
            }}
          >
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <Text variant="caption" color={colors.primary}>
              Teslim almak için dokunun
            </Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
