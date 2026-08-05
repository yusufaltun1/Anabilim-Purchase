import { AccessDenied } from '@/components/auth/AccessDenied';
import { SupplierList } from '@/components/suppliers';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function SuppliersScreen() {
  const router = useRouter();
  const { canSystemManage } = useCapabilities();

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Tedarikçiler', headerShown: false }} />
        <AccessDenied description="Tedarikçi yönetimi için yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Tedarikçiler', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Tedarikçiler"
            subtitle="Firma ve iletişim kayıtları"
            right={
              <IconButton
                name="add"
                onPress={() => router.push('/suppliers/create')}
                accessibilityLabel="Yeni tedarikçi"
              />
            }
          />
        </View>
        <SupplierList
          onCreate={() => router.push('/suppliers/create')}
          onEdit={(s) => router.push(`/suppliers/edit/${s.id}`)}
          onPress={(s) => router.push(`/suppliers/edit/${s.id}`)}
        />
      </Screen>
    </>
  );
}
