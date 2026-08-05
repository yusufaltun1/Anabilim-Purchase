import { Badge, type BadgeTone } from '@/components/ui';
import { getTransferStatusMeta, type TransferStatus } from '@/domain/custody/transferStatus';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export type TransferStatusBadgeProps = {
  status: TransferStatus | undefined;
  displayName?: string;
  style?: StyleProp<ViewStyle>;
  toneOverride?: BadgeTone;
};

export function TransferStatusBadge({
  status,
  displayName,
  style,
  toneOverride,
}: TransferStatusBadgeProps) {
  const meta = getTransferStatusMeta(status);
  return (
    <Badge
      label={displayName || meta.label}
      tone={toneOverride ?? meta.tone}
      style={style}
    />
  );
}
