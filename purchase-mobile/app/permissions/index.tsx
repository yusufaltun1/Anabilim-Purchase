import { AccessDenied } from '@/components/auth/AccessDenied';
import { PermissionList } from '@/components/permissions';
import { Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function PermissionsScreen() {
  const { canSystemManage } = useCapabilities();

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Permissionlar', headerShown: false }} />
        <AccessDenied description="Permission yönetimi için yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Permissionlar', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Permissionlar"
            subtitle="Permission tanımlarını yönetin"
          />
        </View>
        <PermissionList />
      </Screen>
    </>
  );
}
