import { Badge } from '@/components/ui';
import { getPersonnelStatusTone } from '@/services/types/personnel.types';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export type PersonnelStatusBadgeProps = {
  status: string;
  style?: StyleProp<ViewStyle>;
};

export function PersonnelStatusBadge({ status, style }: PersonnelStatusBadgeProps) {
  return <Badge label={status || '—'} tone={getPersonnelStatusTone(status)} style={style} />;
}
