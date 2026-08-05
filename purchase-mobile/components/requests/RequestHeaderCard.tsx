import { Card, Section, Text } from '@/components/ui';
import {
  formatRequestDate,
  formatRequesterName,
} from '@/domain/requests/requestStatus';
import { getCurrentApprover } from '@/domain/requests/approvalRules';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { PurchaseRequest } from '@/services/types/purchase.types';
import React from 'react';
import { View } from 'react-native';
import { RequestStatusBadge } from './RequestStatusBadge';

export type RequestHeaderCardProps = {
  request: PurchaseRequest;
};

export function RequestHeaderCard({ request }: RequestHeaderCardProps) {
  const { spacing } = useAppTheme();
  const approver = getCurrentApprover(request);
  const approverName = approver
    ? `${approver.firstName ?? ''} ${approver.lastName ?? ''}`.trim() || approver.email
    : null;

  return (
    <Card style={{ marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text variant="h3">{request.title}</Text>
        </View>
        <RequestStatusBadge status={request.status} />
      </View>
      {request.description ? (
        <Text variant="body" style={{ marginBottom: spacing.md }}>
          {request.description}
        </Text>
      ) : null}
      <View style={{ gap: spacing.xs }}>
        <Text variant="caption">Talep sahibi: {formatRequesterName(request.requester)}</Text>
        <Text variant="caption">Oluşturulma: {formatRequestDate(request.createdAt)}</Text>
        {request.updatedAt ? (
          <Text variant="caption">Güncelleme: {formatRequestDate(request.updatedAt)}</Text>
        ) : null}
        {approverName ? <Text variant="caption">Onaylayacak: {approverName}</Text> : null}
      </View>
    </Card>
  );
}

export type RequestMetaSectionProps = {
  request: PurchaseRequest;
};

export function RequestMetaSection({ request }: RequestMetaSectionProps) {
  return (
    <Section title="Talep bilgileri">
      <RequestHeaderCard request={request} />
    </Section>
  );
}
