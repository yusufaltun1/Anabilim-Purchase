import { Button, Card, Text } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Supplier } from '@/services/types/supplier.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { SupplierStatusBadge } from './SupplierStatusBadge';

export type SupplierListItemProps = {
  supplier: Supplier;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function SupplierListItem({ supplier, onPress, onEdit, onDelete }: SupplierListItemProps) {
  const { colors, spacing } = useAppTheme();
  const isActive = supplier.isActive ?? supplier.active ?? true;
  const isPreferred = Boolean(supplier.isPreferred ?? supplier.preferred);

  const taxLine = [supplier.taxNumber, supplier.taxOffice].filter(Boolean).join(' · ');
  const contactBits = [
    supplier.contactPerson,
    supplier.phone || supplier.contactPhone,
    supplier.email || supplier.contactEmail,
  ].filter(Boolean);

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
              {supplier.name}
            </Text>
            {taxLine ? (
              <Text variant="caption" numberOfLines={1}>
                {taxLine}
              </Text>
            ) : null}
          </View>
          <SupplierStatusBadge isActive={isActive} isPreferred={isPreferred} />
        </View>

        {contactBits.length > 0 ? (
          <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
            {supplier.contactPerson ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="person-outline" size={14} color={colors.textMuted} />
                <Text variant="caption" numberOfLines={1}>
                  {supplier.contactPerson}
                </Text>
              </View>
            ) : null}
            {(supplier.phone || supplier.contactPhone) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="call-outline" size={14} color={colors.textMuted} />
                <Text variant="caption" numberOfLines={1}>
                  {supplier.phone || supplier.contactPhone}
                </Text>
              </View>
            )}
            {(supplier.email || supplier.contactEmail) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
                <Text variant="caption" numberOfLines={1}>
                  {supplier.email || supplier.contactEmail}
                </Text>
              </View>
            )}
          </View>
        ) : null}
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
