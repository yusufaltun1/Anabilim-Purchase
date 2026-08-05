import { Badge } from '@/components/ui';
import type { ApprovalWorkflow } from '@/services/types/workflow.types';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export type WorkflowStatusBadgeProps = {
  workflow: Pick<ApprovalWorkflow, 'isActive'>;
  style?: StyleProp<ViewStyle>;
};

/** Web ile aynı: yalnızca aktif workflow'larda "Aktif" rozeti */
export function WorkflowStatusBadge({ workflow, style }: WorkflowStatusBadgeProps) {
  if (!workflow.isActive) return null;
  return <Badge label="Aktif" tone="success" style={style} />;
}
