import { AccessDenied } from '@/components/auth/AccessDenied';
import { WarehouseForm, type WarehouseFormValues } from '@/components/warehouses';
import { Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { warehouseService } from '@/services/api/warehouse.service';
import { Stack, useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function WarehouseCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { canSystemManage, canQuoteCollect, canInventoryView } = useCapabilities();
  const canAccess = canSystemManage || canQuoteCollect || canInventoryView;
  const [loading, setLoading] = useState(false);

  if (!canAccess) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Depo', headerShown: false }} />
        <AccessDenied description="Depo oluşturma yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: WarehouseFormValues) => {
    if (!token) return;
    setLoading(true);
    try {
      await warehouseService.createWarehouse(values, token);
      router.replace('/warehouses' as Href);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Depo oluşturulamadı';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Depo', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Yeni depo" subtitle="Depo bilgilerini girin" />
        </View>
        <WarehouseForm
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </Screen>
    </>
  );
}
