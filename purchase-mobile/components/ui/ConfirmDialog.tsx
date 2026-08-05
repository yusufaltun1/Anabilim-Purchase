import React from 'react';
import { View } from 'react-native';
import { AppModal } from './Modal';
import { Button } from './Button';
import { Text } from './Text';
import { useAppTheme } from '@/hooks/useAppTheme';

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmTitle?: string;
  cancelTitle?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmTitle = 'Onayla',
  cancelTitle = 'İptal',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { spacing } = useAppTheme();

  return (
    <AppModal
      visible={visible}
      onClose={onCancel}
      title={title}
      footer={
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Button title={cancelTitle} variant="secondary" onPress={onCancel} disabled={loading} fullWidth />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={confirmTitle}
              variant={destructive ? 'destructive' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              fullWidth
            />
          </View>
        </View>
      }
    >
      <Text variant="body">{message}</Text>
    </AppModal>
  );
}
