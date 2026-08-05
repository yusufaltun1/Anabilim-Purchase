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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from './IconButton';
import { Text } from './Text';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  footer,
  contentStyle,
}: BottomSheetProps) {
  const { colors, spacing, radius, shadow, zIndex } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { zIndex: zIndex.modal }]}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={onClose}
          accessibilityLabel="Kapat"
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundElevated,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
              ...shadow.lg,
            },
            contentStyle,
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.borderDark }]} />
          {title ? (
            <View style={[styles.header, { marginBottom: spacing.md }]}>
              <Text variant="h3" style={{ flex: 1 }}>
                {title}
              </Text>
              <IconButton name="close" onPress={onClose} accessibilityLabel="Kapat" />
            </View>
          ) : null}
          {children}
          {footer ? <View style={{ marginTop: spacing.lg }}>{footer}</View> : null}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
