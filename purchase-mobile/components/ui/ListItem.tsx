import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ListItem({
  title,
  subtitle,
  left,
  right,
  onPress,
  showChevron = !!onPress,
  disabled = false,
  style,
}: ListItemProps) {
  const { colors, spacing, minTouchTarget, opacity } = useAppTheme();

  const content = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: minTouchTarget,
          paddingVertical: spacing.sm,
          gap: spacing.md,
          opacity: disabled ? opacity.disabled : 1,
        },
        style,
      ]}
    >
      {left}
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {showChevron ? <Ionicons name="chevron-forward" size={18} color={colors.icon} /> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        style={({ pressed }) => (pressed ? { opacity: opacity.pressed } : null)}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
