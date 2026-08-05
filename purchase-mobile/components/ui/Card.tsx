import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import {
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  margin?: number;
  onPress?: () => void;
  elevated?: boolean;
};

export function Card({
  children,
  style,
  padding,
  margin = 0,
  onPress,
  elevated = true,
}: CardProps) {
  const { colors, spacing, radius, shadow } = useAppTheme();
  const pad = padding ?? spacing.lg;

  const cardStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: colors.backgroundElevated,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: pad,
      margin,
      ...(elevated ? shadow.sm : shadow.none),
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [cardStyle, pressed ? { opacity: 0.85 } : null]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
