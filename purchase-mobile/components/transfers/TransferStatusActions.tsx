import { Button, Card, Section, Text } from '@/components/ui';
import {
  getTransferNextActions,
  type TransferStatus,
} from '@/domain/custody/transferStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { View } from 'react-native';

export type TransferStatusActionsProps = {
  status: TransferStatus | undefined;
  loading?: boolean;
  onTransition: (nextStatus: string, label: string) => void;
};

export function TransferStatusActions({
  status,
  loading = false,
  onTransition,
}: TransferStatusActionsProps) {
  const { spacing } = useAppTheme();
  const actions = getTransferNextActions(status);

  if (actions.length === 0) return null;

  return (
    <Section title="Durum işlemleri">
      <Card>
        <Text variant="caption" style={{ marginBottom: spacing.md }}>
          Transfer durumunu güncelleyin.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {actions.map((a) => (
            <Button
              key={a.next}
              title={a.label}
              onPress={() => onTransition(a.next, a.label)}
              variant={a.variant}
              size="small"
              disabled={loading}
              loading={loading}
            />
          ))}
        </View>
      </Card>
    </Section>
  );
}
