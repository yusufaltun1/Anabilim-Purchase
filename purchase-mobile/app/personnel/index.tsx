import { AccessDenied } from '@/components/auth/AccessDenied';
import { PersonnelList } from '@/components/personnel';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function PersonnelScreen() {
  const router = useRouter();
  const { canSystemManage } = useCapabilities();

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Personel', headerShown: false }} />
        <AccessDenied description="Personel yönetimi için yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Personel', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Okul personeli"
            subtitle="Personel kayıtları ve filtreler"
            right={
              <IconButton
                name="add"
                onPress={() => router.push('/personnel/create' as never)}
                accessibilityLabel="Yeni personel"
              />
            }
          />
        </View>
        <PersonnelList
          onCreate={() => router.push('/personnel/create' as never)}
          onEdit={(p) => router.push(`/personnel/edit/${p.id}` as never)}
          onPress={(p) => router.push(`/personnel/${p.id}` as never)}
        />
      </Screen>
    </>
  );
}
