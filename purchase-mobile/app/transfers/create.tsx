import { AccessDenied } from '@/components/auth/AccessDenied';
import { TransferCreateForm } from '@/components/transfers';
import { Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function TransferCreateScreen() {
  const router = useRouter();
  const { canSystemManage } = useCapabilities();

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Transfer', headerShown: false }} />
        <AccessDenied description="Transfer oluşturmak için yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Transfer', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Yeni Transfer" subtitle="Depolar arası varlık transferi" />
        </View>
        <TransferCreateForm
          onCancel={() => router.back()}
          onSuccess={(id) => {
            if (id) {
              router.replace(`/transfers/${id}` as never);
            } else {
              router.replace('/transfers' as never);
            }
          }}
        />
      </Screen>
    </>
  );
}
