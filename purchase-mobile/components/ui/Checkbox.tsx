import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  error,
  style,
  accessibilityLabel,
}: CheckboxProps) {
  const { colors, spacing, minTouchTarget, opacity } = useAppTheme();

  return (
    <View style={style}>
      <Pressable
        disabled={disabled}
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={accessibilityLabel ?? label}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: minTouchTarget,
          opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
          gap: spacing.md,
        })}
      >
        <Ionicons
          name={checked ? 'checkbox' : 'square-outline'}
          size={24}
          color={error ? colors.error : checked ? colors.primary : colors.icon}
        />
        {label ? <Text variant="body" style={{ flex: 1 }}>{label}</Text> : null}
      </Pressable>
      {error ? <Text variant="error">{error}</Text> : null}
    </View>
  );
}
