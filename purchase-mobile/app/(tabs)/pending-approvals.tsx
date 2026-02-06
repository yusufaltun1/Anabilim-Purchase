import React from 'react';
import { Stack, useRouter } from 'expo-router';

import { RequestList } from '@/components/requests/RequestList';
import { purchaseService } from '@/services/api/purchase.service';

export default function PendingApprovalsScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Onay Bekleyenler',
          headerBackTitleVisible: false,
        }}
      />
      <RequestList
        listKey="pending"
        fetchFunction={purchaseService.getPendingApprovals}
        onNav={(id) => router.push(`/approval-detail/${id}`)}
      />
    </>
  );
}
