import { AccessDenied } from '@/components/auth/AccessDenied';
import { UserList } from '@/components/users';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function UsersScreen() {
  const router = useRouter();
  const { canSystemManage } = useCapabilities();

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Kullanıcılar', headerShown: false }} />
        <AccessDenied description="Kullanıcı yönetimi için yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Kullanıcılar', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Kullanıcılar"
            subtitle="Sistem kullanıcıları ve roller"
            right={
              <IconButton
                name="add"
                onPress={() => router.push('/users/create' as never)}
                accessibilityLabel="Yeni kullanıcı"
              />
            }
          />
        </View>
        <UserList
          onCreate={() => router.push('/users/create' as never)}
          onEdit={(u) => router.push(`/users/edit/${u.id}` as never)}
          onPress={(u) => router.push(`/users/edit/${u.id}` as never)}
        />
      </Screen>
    </>
  );
}
