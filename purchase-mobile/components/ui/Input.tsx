import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /** secureTextEntry true iken göster/gizle toggle */
  showPasswordToggle?: boolean;
};

export function Input({
  label,
  helper,
  error,
  required,
  containerStyle,
  style,
  editable = true,
  secureTextEntry,
  showPasswordToggle,
  accessibilityLabel,
  ...props
}: InputProps) {
  const { colors, spacing, radius, fontSize, minTouchTarget, opacity } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const disabled = editable === false;
  const hasToggle = showPasswordToggle && secureTextEntry;

  return (
    <View style={[styles.container, { marginBottom: spacing.lg }, containerStyle]}>
      {label ? (
        <Text variant="label" style={{ marginBottom: spacing.sm, color: colors.text }}>
          {label}
          {required ? <Text variant="label" color={colors.error}> *</Text> : null}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          {
            minHeight: minTouchTarget,
            borderRadius: radius.md,
            borderColor: error
              ? colors.error
              : focused
                ? colors.borderFocus
                : colors.border,
            backgroundColor: disabled ? colors.backgroundMuted : colors.background,
            opacity: disabled ? opacity.disabled : 1,
            paddingRight: hasToggle ? spacing.xs : spacing.lg,
          },
        ]}
      >
        <RNTextInput
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: fontSize.md,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              flex: 1,
            },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          editable={editable}
          secureTextEntry={hasToggle ? hidden : secureTextEntry}
          accessibilityLabel={accessibilityLabel ?? label}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {hasToggle ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Şifreyi göster' : 'Şifreyi gizle'}
            hitSlop={8}
            style={styles.toggle}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.icon}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text variant="error" style={{ marginTop: spacing.xs }}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="helper" style={{ marginTop: spacing.xs }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  field: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    margin: 0,
    padding: 0,
  },
  toggle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
