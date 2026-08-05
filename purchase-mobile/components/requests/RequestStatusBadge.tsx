import { Badge, type BadgeTone } from '@/components/ui';
import { getRequestStatusMeta, type RequestStatusCode } from '@/domain/requests/requestStatus';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export type RequestStatusBadgeProps = {
  status: RequestStatusCode | undefined;
  style?: StyleProp<ViewStyle>;
  toneOverride?: BadgeTone;
};

export function RequestStatusBadge({ status, style, toneOverride }: RequestStatusBadgeProps) {
  const meta = getRequestStatusMeta(status);
  return <Badge label={meta.label} tone={toneOverride ?? meta.tone} style={style} />;
}
