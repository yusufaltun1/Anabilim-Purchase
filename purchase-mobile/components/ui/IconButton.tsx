import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

export type IconButtonProps = {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  name,
  onPress,
  size = 22,
  color,
  disabled = false,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const { colors, minTouchTarget, opacity, radius } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: minTouchTarget,
          height: minTouchTarget,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
        },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color ?? colors.icon} />
    </Pressable>
  );
}
