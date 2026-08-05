import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  disabled = false,
  style,
}: ChipProps) {
  const { colors, spacing, radius, minTouchTarget, opacity } = useAppTheme();

  return (
    <Pressable
      disabled={disabled || (!onPress && !onRemove)}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          minHeight: Math.max(32, minTouchTarget - 12),
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          borderRadius: radius.full,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primaryMuted : colors.background,
          opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
        },
        style,
      ]}
    >
      <Text variant="label" color={selected ? colors.primary : colors.text}>
        {label}
      </Text>
      {onRemove ? (
        <Pressable hitSlop={8} onPress={onRemove} accessibilityLabel={`${label} kaldır`}>
          <Ionicons name="close" size={14} color={selected ? colors.primary : colors.icon} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
