import React from 'react';
import { Stack, useRouter } from 'expo-router';

import { EmptyState, Screen } from '@/components/ui';
import { RequestList } from '@/components/requests/RequestList';
import { useCapabilities } from '@/hooks/useCapabilities';
import { purchaseService } from '@/services/api/purchase.service';

export default function PendingApprovalsScreen() {
  const router = useRouter();
  const { canApprove } = useCapabilities();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Onay Bekleyenler',
        }}
      />
      {canApprove ? (
        <RequestList
          listKey="pending"
          fetchFunction={purchaseService.getPendingApprovals}
          onNav={(id) => router.push(`/approval-detail/${id}`)}
        />
      ) : (
        <Screen>
          <EmptyState
            title="Yetkiniz yok"
            description="Onay bekleyen talepleri görüntüleme yetkiniz bulunmuyor."
            icon="lock-closed-outline"
            actionTitle="Ana sayfaya dön"
            onAction={() => router.replace('/(tabs)')}
          />
        </Screen>
      )}
    </>
  );
}
