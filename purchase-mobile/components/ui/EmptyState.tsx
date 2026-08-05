import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Button } from './Button';
import { Text } from './Text';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionTitle?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  title,
  description,
  icon = 'file-tray-outline',
  actionTitle,
  onAction,
  style,
}: EmptyStateProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing['3xl'],
          gap: spacing.md,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text variant="h3" center>
        {title}
      </Text>
      {description ? (
        <Text variant="helper" center>
          {description}
        </Text>
      ) : null}
      {actionTitle && onAction ? (
        <Button title={actionTitle} onPress={onAction} variant="outline" style={{ marginTop: spacing.sm }} />
      ) : null}
    </View>
  );
}
