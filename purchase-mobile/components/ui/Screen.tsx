import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

export type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  keyboardAvoiding?: boolean;
  refreshControl?: React.ComponentProps<typeof ScrollView>['refreshControl'];
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'left', 'right'],
  style,
  contentStyle,
  keyboardAvoiding = true,
  refreshControl,
}: ScreenProps) {
  const { colors, spacing } = useAppTheme();
  const pad = padded ? { padding: spacing.lg } : undefined;

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[pad, { flexGrow: 1 }, contentStyle]}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, pad, contentStyle]}>{children}</View>
  );

  const content = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }, style]} edges={edges}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
