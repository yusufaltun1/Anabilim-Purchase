import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import {
  Switch as RNSwitch,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from './Text';

export type SwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  helper?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Switch({
  value,
  onChange,
  label,
  helper,
  disabled = false,
  style,
  accessibilityLabel,
}: SwitchProps) {
  const { colors, spacing, minTouchTarget, opacity } = useAppTheme();

  return (
    <View style={[{ marginBottom: spacing.lg, opacity: disabled ? opacity.disabled : 1 }, style]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: minTouchTarget,
          gap: spacing.md,
        }}
      >
        {label ? (
          <View style={{ flex: 1 }}>
            <Text variant="body">{label}</Text>
            {helper ? <Text variant="helper">{helper}</Text> : null}
          </View>
        ) : null}
        <RNSwitch
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{ false: colors.borderDark, true: colors.primaryMuted }}
          thumbColor={value ? colors.primary : colors.backgroundElevated}
          ios_backgroundColor={colors.borderDark}
          accessibilityLabel={accessibilityLabel ?? label}
        />
      </View>
    </View>
  );
}
