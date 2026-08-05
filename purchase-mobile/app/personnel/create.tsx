import { AccessDenied } from '@/components/auth/AccessDenied';
import { PersonnelForm } from '@/components/personnel';
import { Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { personnelService } from '@/services/api/personnel.service';
import {
  toCreatePersonnelRequest,
  type PersonnelFormValues,
} from '@/services/types/personnel.types';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function PersonnelCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();
  const [loading, setLoading] = useState(false);

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Personel', headerShown: false }} />
        <AccessDenied description="Personel oluşturma yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: PersonnelFormValues) => {
    if (!token) return;
    setLoading(true);
    try {
      await personnelService.createPersonnel(toCreatePersonnelRequest(values), token);
      router.replace('/personnel' as never);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Personel oluşturulamadı';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Personel', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Yeni personel" subtitle="Personel bilgilerini girin" />
        </View>
        <PersonnelForm
          mode="create"
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </Screen>
    </>
  );
}
