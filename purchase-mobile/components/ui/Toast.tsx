import { useAppTheme } from '@/hooks/useAppTheme';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export type ToastOptions = {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (options: ToastOptions | string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors, spacing, radius, shadow, zIndex } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setToast(null);
    });
  }, [opacity]);

  const showToast = useCallback(
    (options: ToastOptions | string) => {
      const next: ToastOptions = typeof options === 'string' ? { message: options } : options;
      if (timer.current) clearTimeout(timer.current);
      idRef.current += 1;
      setToast({ ...next, id: idRef.current, tone: next.tone ?? 'info' });
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, next.durationMs ?? 2800);
    },
    [hide, opacity]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  const toneColors = {
    success: { bg: colors.success, fg: colors.textInverse },
    error: { bg: colors.error, fg: colors.textInverse },
    warning: { bg: colors.warning, fg: colors.textInverse },
    info: { bg: colors.info, fg: colors.textInverse },
  } as const;

  const palette = toast ? toneColors[toast.tone ?? 'info'] : toneColors.info;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.wrap,
            {
              top: insets.top + spacing.sm,
              zIndex: zIndex.toast,
              opacity,
            },
          ]}
        >
          <Pressable
            onPress={hide}
            style={[
              styles.toast,
              {
                backgroundColor: palette.bg,
                borderRadius: radius.md,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                ...shadow.md,
              },
            ]}
            accessibilityRole="alert"
          >
            <Text variant="bodyStrong" color={palette.fg}>
              {toast.message}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast ToastProvider içinde kullanılmalıdır');
  }
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  toast: {
    alignItems: 'center',
  },
});
