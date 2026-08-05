import { useAppTheme } from '@/hooks/useAppTheme';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { IconButton } from './IconButton';
import { Text } from './Text';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  right,
  style,
}: ScreenHeaderProps) {
  const { colors, spacing, minTouchTarget } = useAppTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.row,
        {
          minHeight: minTouchTarget,
          marginBottom: spacing.md,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      {showBack ? (
        <IconButton
          name="chevron-back"
          onPress={handleBack}
          accessibilityLabel="Geri"
          color={colors.text}
        />
      ) : (
        <View style={{ width: minTouchTarget }} />
      )}
      <View style={{ flex: 1 }}>
        <Text variant="h3" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <View style={{ width: minTouchTarget }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
