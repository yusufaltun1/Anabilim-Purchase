import { AccessDenied } from '@/components/auth/AccessDenied';
import { WarehouseList } from '@/components/warehouses';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter, type Href } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function WarehousesScreen() {
  const router = useRouter();
  const { canSystemManage, canQuoteCollect, canInventoryView } = useCapabilities();
  const canAccess = canSystemManage || canQuoteCollect || canInventoryView;

  if (!canAccess) {
    return (
      <>
        <Stack.Screen options={{ title: 'Depolar', headerShown: false }} />
        <AccessDenied description="Depo listesini görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Depolar', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Depolar"
            subtitle="Depo listesi ve durum yönetimi"
            right={
              <IconButton
                name="add"
                onPress={() => router.push('/warehouses/create' as Href)}
                accessibilityLabel="Yeni depo"
              />
            }
          />
        </View>
        <WarehouseList
          onCreate={() => router.push('/warehouses/create' as Href)}
          onPress={(w) => router.push(`/warehouses/${w.id}` as Href)}
        />
      </Screen>
    </>
  );
}
