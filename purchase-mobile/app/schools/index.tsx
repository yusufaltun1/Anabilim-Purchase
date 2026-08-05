import { AccessDenied } from '@/components/auth/AccessDenied';
import { SchoolList } from '@/components/schools';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function SchoolsScreen() {
  const router = useRouter();
  const { canSystemManage } = useCapabilities();

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Okullar', headerShown: false }} />
        <AccessDenied description="Okul yönetimi için yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Okullar', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Okullar"
            subtitle="Okul kayıtları ve filtreler"
            right={
              <IconButton
                name="add"
                onPress={() => router.push('/schools/create' as never)}
                accessibilityLabel="Yeni okul"
              />
            }
          />
        </View>
        <SchoolList
          onCreate={() => router.push('/schools/create' as never)}
          onEdit={(s) => router.push(`/schools/edit/${s.id}` as never)}
          onPress={(s) => router.push(`/schools/${s.id}` as never)}
        />
      </Screen>
    </>
  );
}
