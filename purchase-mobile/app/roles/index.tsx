import { AccessDenied } from '@/components/auth/AccessDenied';
import { RoleList } from '@/components/roles';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function RolesScreen() {
  const router = useRouter();
  const { canSystemManage } = useCapabilities();

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Roller', headerShown: false }} />
        <AccessDenied description="Rol yönetimi için yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Roller', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Roller"
            subtitle="Sistem rolleri ve izin atamaları"
            right={
              <IconButton
                name="add"
                onPress={() => router.push('/roles/create' as never)}
                accessibilityLabel="Yeni rol"
              />
            }
          />
        </View>
        <RoleList
          onCreate={() => router.push('/roles/create' as never)}
          onEdit={(role) => {
            if (role.id != null) {
              router.push(`/roles/edit/${role.id}` as never);
            }
          }}
          onPress={(role) => {
            if (role.id != null) {
              router.push(`/roles/edit/${role.id}` as never);
            }
          }}
        />
      </Screen>
    </>
  );
}
