import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';

export type SectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Section({ title, description, children, style }: SectionProps) {
  const { spacing } = useAppTheme();

  return (
    <View style={[{ marginBottom: spacing['2xl'] }, style]}>
      {title ? (
        <Text variant="h3" style={{ marginBottom: description ? spacing.xs : spacing.md }}>
          {title}
        </Text>
      ) : null}
      {description ? (
        <Text variant="helper" style={{ marginBottom: spacing.md }}>
          {description}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
