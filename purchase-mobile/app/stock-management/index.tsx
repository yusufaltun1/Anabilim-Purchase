import { AccessDenied } from '@/components/auth/AccessDenied';
import { StockProductList } from '@/components/stock';
import { Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function StockManagementScreen() {
  const router = useRouter();
  const { canInventoryView } = useCapabilities();

  if (!canInventoryView) {
    return (
      <>
        <Stack.Screen options={{ title: 'Stok Yönetimi', headerShown: false }} />
        <AccessDenied description="Stok yönetimini görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Stok Yönetimi', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Stok yönetimi" subtitle="Ürün bazlı stok özeti" />
        </View>
        <StockProductList
          onPress={(s) => router.push(`/stock-management/${s.id}`)}
        />
      </Screen>
    </>
  );
}
