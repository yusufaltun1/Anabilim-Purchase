import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { IconButton } from './IconButton';
import { Text } from './Text';

export type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** center | fullscreen */
  variant?: 'center' | 'fullscreen';
  contentStyle?: StyleProp<ViewStyle>;
};

export function AppModal({
  visible,
  onClose,
  title,
  children,
  footer,
  variant = 'center',
  contentStyle,
}: AppModalProps) {
  const { colors, spacing, radius, shadow, zIndex } = useAppTheme();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.root, { zIndex: zIndex.modal }]}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={onClose}
          accessibilityLabel="Kapat"
        />
        <View
          style={[
            variant === 'fullscreen' ? styles.full : styles.center,
            {
              backgroundColor: colors.backgroundElevated,
              borderRadius: variant === 'fullscreen' ? 0 : radius.xl,
              padding: spacing.lg,
              ...(variant === 'center' ? shadow.lg : null),
            },
            contentStyle,
          ]}
        >
          {title ? (
            <View style={[styles.header, { marginBottom: spacing.md }]}>
              <Text variant="h3" style={{ flex: 1 }}>
                {title}
              </Text>
              <IconButton name="close" onPress={onClose} accessibilityLabel="Kapat" />
            </View>
          ) : null}
          <View style={{ flexGrow: variant === 'fullscreen' ? 1 : undefined }}>{children}</View>
          {footer ? <View style={{ marginTop: spacing.lg }}>{footer}</View> : null}
        </View>
      </View>
    </RNModal>
  );
}

/** Geriye dönük isim */
export const Modal = AppModal;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  center: {
    maxHeight: '85%',
    width: '100%',
  },
  full: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
