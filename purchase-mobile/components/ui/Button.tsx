import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, spacing, radius, fontSize, minTouchTarget, opacity } = useAppTheme();
  const isDisabled = disabled || loading;

  const sizePad = {
    small: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: Math.max(36, minTouchTarget - 8) },
    medium: { paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md, minHeight: Math.max(48, minTouchTarget) },
    large: { paddingHorizontal: spacing['3xl'], paddingVertical: spacing.lg, minHeight: 56 },
  }[size];

  const font = {
    small: fontSize.sm,
    medium: fontSize.md,
    large: fontSize.lg,
  }[size];

  const bg = (() => {
    if (variant === 'primary') return colors.primary;
    if (variant === 'destructive') return colors.error;
    if (variant === 'secondary') return colors.backgroundSecondary;
    if (variant === 'outline' || variant === 'ghost') return 'transparent';
    return colors.primary;
  })();

  const borderColor = (() => {
    if (variant === 'outline') return colors.primary;
    if (variant === 'secondary') return colors.border;
    return 'transparent';
  })();

  const labelColor = (() => {
    if (variant === 'primary' || variant === 'destructive') return colors.textInverse;
    if (variant === 'outline' || variant === 'ghost') return colors.primary;
    return colors.text;
  })();

  const spinnerColor =
    variant === 'primary' || variant === 'destructive' ? colors.textInverse : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        sizePad,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
          borderRadius: radius.md,
          opacity: isDisabled ? opacity.disabled : pressed ? opacity.pressed : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text
            variant="bodyStrong"
            style={[{ color: labelColor, fontSize: font }, textStyle]}
          >
            {title}
          </Text>
          {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
