import { Text } from '@/components/ui';
import { formatRequestDate } from '@/domain/requests/requestStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { PurchaseRequestApproval } from '@/services/types/purchase.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

export type ApprovalTimelineProps = {
  approvals: PurchaseRequestApproval[];
};

function approverName(a: PurchaseRequestApproval): string {
  const p = a.approver;
  if (!p) return '—';
  const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
  return name || p.email || '—';
}

function stepMeta(status: PurchaseRequestApproval['status'], colors: ReturnType<typeof useAppTheme>['colors']) {
  switch (status) {
    case 'APPROVED':
      return { icon: 'checkmark-circle' as const, color: colors.success, label: 'Onaylandı' };
    case 'REJECTED':
      return { icon: 'close-circle' as const, color: colors.error, label: 'Reddedildi' };
    default:
      return { icon: 'time-outline' as const, color: colors.warning, label: 'Bekliyor' };
  }
}

export function ApprovalTimeline({ approvals }: ApprovalTimelineProps) {
  const { colors, spacing } = useAppTheme();
  const sorted = [...(approvals ?? [])].sort((a, b) => a.stepOrder - b.stepOrder);

  if (sorted.length === 0) {
    return (
      <Text variant="helper">Henüz onay adımı bulunmuyor.</Text>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      {sorted.map((step, index) => {
        const meta = stepMeta(step.status, colors);
        const isLast = index === sorted.length - 1;
        return (
          <View key={step.id} style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ alignItems: 'center', width: 24 }}>
              <Ionicons name={meta.icon} size={22} color={meta.color} />
              {!isLast ? (
                <View
                  style={{
                    flex: 1,
                    width: 2,
                    minHeight: 28,
                    marginTop: 4,
                    backgroundColor: colors.border,
                  }}
                />
              ) : null}
            </View>
            <View style={{ flex: 1, paddingBottom: spacing.sm, gap: 2 }}>
              <Text variant="bodyStrong">
                Adım {step.stepOrder}: {step.roleName || 'Onay'}
              </Text>
              <Text variant="caption">{approverName(step)}</Text>
              <Text variant="caption" color={meta.color}>
                {meta.label}
                {step.actionTakenAt ? ` · ${formatRequestDate(step.actionTakenAt)}` : ''}
              </Text>
              {step.comment ? (
                <Text variant="helper" style={{ marginTop: 2 }}>
                  “{step.comment}”
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
