import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const { colors, spacing, radius, fontSize } = useAppTheme();

  const palette = {
    neutral: { bg: colors.backgroundMuted, fg: colors.textSecondary },
    primary: { bg: colors.primaryMuted, fg: colors.primary },
    success: { bg: colors.successMuted, fg: colors.success },
    warning: { bg: colors.warningMuted, fg: colors.warning },
    error: { bg: colors.errorMuted, fg: colors.error },
    info: { bg: colors.infoMuted, fg: colors.info },
  }[tone];

  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: palette.bg,
          borderRadius: radius.full,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        },
        style,
      ]}
    >
      <Text variant="caption" color={palette.fg} style={{ fontSize: fontSize.xs, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}
