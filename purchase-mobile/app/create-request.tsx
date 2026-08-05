import { AccessDenied } from '@/components/auth/AccessDenied';
import { PurchaseRequestForm } from '@/components/forms/PurchaseRequestForm';
import { Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { router, Stack } from 'expo-router';
import React from 'react';

export default function CreateRequestScreen() {
  const { canCreateRequest } = useCapabilities();

  if (!canCreateRequest) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Talep', headerShown: false }} />
        <AccessDenied description="Satın alma talebi oluşturma yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Talep', headerShown: false }} />
      <Screen padded edges={['top', 'left', 'right', 'bottom']}>
        <ScreenHeader title="Yeni talep" subtitle="Satın alma talebi oluşturun" />
        <PurchaseRequestForm
          onSuccess={() => router.replace('/(tabs)/my-requests')}
          onCancel={() => router.back()}
        />
      </Screen>
    </>
  );
}
