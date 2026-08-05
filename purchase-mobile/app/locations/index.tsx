import { AccessDenied } from '@/components/auth/AccessDenied';
import { LocationList } from '@/components/locations';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function LocationsScreen() {
  const router = useRouter();
  const { canInventoryView, canInventoryManage } = useCapabilities();

  if (!canInventoryView) {
    return (
      <>
        <Stack.Screen options={{ title: 'Konumlar', headerShown: false }} />
        <AccessDenied description="Konum listesini görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Konumlar', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Konumlar"
            subtitle="Üst → alt → detay · en fazla 3 seviye"
            right={
              canInventoryManage ? (
                <IconButton
                  name="add"
                  onPress={() => router.push('/locations/create')}
                  accessibilityLabel="Yeni konum"
                />
              ) : undefined
            }
          />
        </View>
        <LocationList
          canManage={canInventoryManage}
          onCreate={canInventoryManage ? () => router.push('/locations/create') : undefined}
          onPress={(loc) => router.push(`/locations/${loc.id}`)}
          onEdit={
            canInventoryManage ? (loc) => router.push(`/locations/edit/${loc.id}`) : undefined
          }
        />
      </Screen>
    </>
  );
}
