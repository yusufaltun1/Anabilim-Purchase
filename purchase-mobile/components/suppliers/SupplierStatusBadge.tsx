import { Badge, Chip } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

export type SupplierStatusBadgeProps = {
  isActive?: boolean;
  isPreferred?: boolean;
  showPreferred?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SupplierStatusBadge({
  isActive = true,
  isPreferred = false,
  showPreferred = true,
  style,
}: SupplierStatusBadgeProps) {
  const { spacing } = useAppTheme();

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, alignItems: 'center' }, style]}>
      <Badge label={isActive ? 'Aktif' : 'Pasif'} tone={isActive ? 'success' : 'neutral'} />
      {showPreferred && isPreferred ? <Chip label="Tercih edilen" selected disabled /> : null}
    </View>
  );
}
