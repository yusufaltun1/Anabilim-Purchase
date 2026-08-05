import { Button, Card, Text } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  formatCategoryLabel,
  formatWorkflowAmount,
  type ApprovalWorkflow,
} from '@/services/types/workflow.types';
import React from 'react';
import { View } from 'react-native';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

export type WorkflowListItemProps = {
  workflow: ApprovalWorkflow;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function WorkflowListItem({
  workflow,
  onPress,
  onEdit,
  onDelete,
}: WorkflowListItemProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <Card onPress={onPress} style={{ marginBottom: spacing.md }} padding={0}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <View style={{ flex: 1, gap: spacing.xxs }}>
            <Text variant="bodyStrong" numberOfLines={2}>
              {workflow.name}
            </Text>
          </View>
          <WorkflowStatusBadge workflow={workflow} />
        </View>

        {workflow.description ? (
          <Text variant="caption" numberOfLines={2} color={colors.textSecondary}>
            {workflow.description}
          </Text>
        ) : null}

        <View style={{ gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="caption" color={colors.textMuted}>
              Kategori
            </Text>
            <Text variant="caption">{formatCategoryLabel(workflow.category)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="caption" color={colors.textMuted}>
              Min tutar
            </Text>
            <Text variant="caption">{formatWorkflowAmount(workflow.minAmount)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="caption" color={colors.textMuted}>
              Max tutar
            </Text>
            <Text variant="caption">{formatWorkflowAmount(workflow.maxAmount)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="caption" color={colors.textMuted}>
              Adım sayısı
            </Text>
            <Text variant="caption">{workflow.steps?.length ?? 0}</Text>
          </View>
        </View>
      </View>

      {(onEdit || onDelete) && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.borderLight,
            paddingTop: spacing.sm,
          }}
          onStartShouldSetResponder={() => true}
        >
          {onEdit ? (
            <Button title="Düzenle" onPress={onEdit} variant="outline" size="small" />
          ) : null}
          {onDelete ? (
            <Button title="Sil" onPress={onDelete} variant="destructive" size="small" />
          ) : null}
        </View>
      )}
    </Card>
  );
}
