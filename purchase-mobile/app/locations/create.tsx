import { AccessDenied } from '@/components/auth/AccessDenied';
import { LocationForm } from '@/components/locations';
import { Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { locationService } from '@/services/api/location.service';
import {
  resolveParentForNewLocation,
  type LocationFormValues,
} from '@/services/types/location.types';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function LocationCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { canInventoryManage } = useCapabilities();
  const [loading, setLoading] = useState(false);

  if (!canInventoryManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Konum', headerShown: false }} />
        <AccessDenied description="Konum oluşturma yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: LocationFormValues) => {
    if (!token) return;
    setLoading(true);
    try {
      const parentId = resolveParentForNewLocation(values.parentRootId, values.parentMiddleId);
      await locationService.createLocation(
        {
          name: values.name,
          description: values.description.trim() || values.name,
          parentId,
          isDefault: values.isDefault,
        },
        token
      );
      router.replace('/locations');
    } catch (err: unknown) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Konum oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Konum', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Yeni konum" subtitle="Hiyerarşik site haritasına ekleyin" />
        </View>
        <LocationForm
          mode="create"
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </Screen>
    </>
  );
}
