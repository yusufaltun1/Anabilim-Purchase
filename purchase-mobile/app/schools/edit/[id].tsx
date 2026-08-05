import { AccessDenied } from '@/components/auth/AccessDenied';
import { SchoolForm } from '@/components/schools';
import { Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { schoolService } from '@/services/api/school.service';
import {
  schoolToForm,
  type School,
  type SchoolFormValues,
} from '@/services/types/school.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

export default function SchoolEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !id || !canSystemManage) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await schoolService.getSchoolById(Number(id), token);
        if (!cancelled) setSchool(data);
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          Alert.alert('Hata', err instanceof Error ? err.message : 'Okul yüklenemedi', [
            { text: 'Tamam', onPress: () => router.back() },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, id, canSystemManage, router]);

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Okul Düzenle', headerShown: false }} />
        <AccessDenied description="Okul düzenleme yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: SchoolFormValues) => {
    if (!token || !school) return;
    setSaving(true);
    try {
      await schoolService.updateSchool(
        school.id,
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
        },
        token
      );
      router.replace(`/schools/${school.id}` as never);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Okul güncellenemedi';
      Alert.alert('Hata', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Okul Düzenle', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Okul düzenle"
            subtitle={school?.name ?? 'Okul bilgilerini güncelleyin'}
          />
        </View>
        {loading || !school ? (
          <Loading fullScreen label="Okul yükleniyor…" />
        ) : (
          <SchoolForm
            mode="edit"
            initialValues={schoolToForm(school)}
            loading={saving}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </Screen>
    </>
  );
}
