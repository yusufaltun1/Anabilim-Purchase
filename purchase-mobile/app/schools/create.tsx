import { AccessDenied } from '@/components/auth/AccessDenied';
import { SchoolForm } from '@/components/schools';
import { Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { schoolService } from '@/services/api/school.service';
import type { SchoolFormValues } from '@/services/types/school.types';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function SchoolCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();
  const [loading, setLoading] = useState(false);

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Okul', headerShown: false }} />
        <AccessDenied description="Okul oluşturma yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: SchoolFormValues) => {
    if (!token) return;
    setLoading(true);
    try {
      await schoolService.createSchool(
        {
          name: values.name,
          code: values.code,
          address: values.address,
          phone: values.phone,
          email: values.email,
          principalName: values.principalName,
          district: values.district,
          city: values.city,
          schoolType: values.schoolType,
          studentCapacity: values.studentCapacity,
          isActive: values.isActive,
        },
        token
      );
      router.replace('/schools' as never);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Okul oluşturulamadı';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Okul', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Yeni okul" subtitle="Okul bilgilerini girin" />
        </View>
        <SchoolForm
          mode="create"
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </Screen>
    </>
  );
}
