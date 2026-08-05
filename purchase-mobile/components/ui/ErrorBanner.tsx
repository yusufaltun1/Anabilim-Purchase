import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';

export type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ErrorBanner({ message, onRetry, onDismiss, style }: ErrorBannerProps) {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.errorMuted,
          borderColor: colors.error,
          borderWidth: 1,
          borderRadius: radius.md,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.sm,
        },
        style,
      ]}
      accessibilityRole="alert"
    >
      <Ionicons name="alert-circle" size={20} color={colors.error} style={{ marginTop: 2 }} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text variant="body" color={colors.error}>
          {message}
        </Text>
        {onRetry ? (
          <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Tekrar dene">
            <Text variant="bodyStrong" color={colors.error}>
              Tekrar dene
            </Text>
          </Pressable>
        ) : null}
      </View>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={8} accessibilityLabel="Kapat">
          <Ionicons name="close" size={18} color={colors.error} />
        </Pressable>
      ) : null}
    </View>
  );
}
