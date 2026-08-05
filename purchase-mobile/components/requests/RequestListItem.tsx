import { Button, Card, Text } from '@/components/ui';
import {
  formatRequestDate,
  formatRequesterName,
  getRequestStatusMeta,
} from '@/domain/requests/requestStatus';
import { getCurrentApprover } from '@/domain/requests/approvalRules';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { PurchaseRequest } from '@/services/types/purchase.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { RequestStatusBadge } from './RequestStatusBadge';

export type RequestListItemProps = {
  request: PurchaseRequest;
  onPress: () => void;
  /** Liste varyantı: my = sahip odaklı, pending = onaycı odaklı */
  variant?: 'my' | 'pending';
  showRequester?: boolean;
  showCurrentApprover?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
};

export function RequestListItem({
  request,
  onPress,
  variant = 'my',
  showRequester = variant === 'pending',
  showCurrentApprover = variant === 'my',
  onEdit,
  onDelete,
  showEdit = false,
  showDelete = false,
}: RequestListItemProps) {
  const { colors, spacing, radius } = useAppTheme();
  const meta = getRequestStatusMeta(request.status);
  const approver = getCurrentApprover(request);
  const requesterName = formatRequesterName(request.requester);
  const approverName = approver
    ? `${approver.firstName ?? ''} ${approver.lastName ?? ''}`.trim() || approver.email
    : null;
  const hasActions = (showEdit && !!onEdit) || (showDelete && !!onDelete);

  return (
    <Card onPress={onPress} style={{ marginBottom: spacing.md }} padding={0}>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.md, flexDirection: 'row', gap: spacing.md }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.full,
            backgroundColor: `${meta.color}20`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {request.title}
          </Text>
          {request.description ? (
            <Text variant="caption" numberOfLines={2}>
              {request.description}
            </Text>
          ) : null}
          {showRequester ? (
            <Text variant="caption">Talep sahibi: {requesterName}</Text>
          ) : null}
          {showCurrentApprover && approverName ? (
            <Text variant="caption">Onaylayacak: {approverName}</Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.icon} style={{ marginTop: 4 }} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingBottom: hasActions ? spacing.sm : spacing.md,
          gap: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          paddingTop: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
          <RequestStatusBadge status={request.status} />
          {request.status === 'REJECTED' && request.rejectionReason ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: colors.errorMuted,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xxs,
                borderRadius: radius.full,
                maxWidth: 130,
              }}
            >
              <Ionicons name="alert-circle" size={12} color={colors.error} />
              <Text variant="caption" color={colors.error} numberOfLines={1}>
                Red nedeni
              </Text>
            </View>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
          <Text variant="caption">{formatRequestDate(request.createdAt)}</Text>
        </View>
      </View>

      {hasActions ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
          }}
          onStartShouldSetResponder={() => true}
        >
          {showEdit && onEdit ? (
            <Button
              title="Düzenle"
              onPress={onEdit}
              variant="outline"
              size="small"
            />
          ) : null}
          {showDelete && onDelete ? (
            <Button title="Sil" onPress={onDelete} variant="ghost" size="small" />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
