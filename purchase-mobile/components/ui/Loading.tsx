import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';

export type LoadingProps = {
  label?: string;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Loading({ label, fullScreen = false, style }: LoadingProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.md,
          padding: spacing['2xl'],
          ...(fullScreen ? { flex: 1 } : null),
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Yükleniyor'}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? <Text variant="helper">{label}</Text> : null}
    </View>
  );
}
