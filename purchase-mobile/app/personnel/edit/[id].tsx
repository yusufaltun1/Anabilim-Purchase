import { AccessDenied } from '@/components/auth/AccessDenied';
import { PersonnelForm } from '@/components/personnel';
import { Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { personnelService } from '@/services/api/personnel.service';
import {
  personnelToForm,
  toUpdatePersonnelRequest,
  type PersonnelFormValues,
  type SchoolPersonnel,
} from '@/services/types/personnel.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

export default function PersonnelEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();
  const [personnel, setPersonnel] = useState<SchoolPersonnel | null>(null);
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
        const data = await personnelService.getPersonnelById(Number(id), token);
        if (!cancelled) setPersonnel(data);
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          Alert.alert('Hata', err instanceof Error ? err.message : 'Personel yüklenemedi', [
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
        <Stack.Screen options={{ title: 'Personel Düzenle', headerShown: false }} />
        <AccessDenied description="Personel düzenleme yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: PersonnelFormValues) => {
    if (!token || !personnel) return;
    setSaving(true);
    try {
      await personnelService.updatePersonnel(
        personnel.id,
        toUpdatePersonnelRequest(values),
        token
      );
      router.replace(`/personnel/${personnel.id}` as never);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Personel güncellenemedi';
      Alert.alert('Hata', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Personel Düzenle', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Personel düzenle"
            subtitle={
              personnel
                ? `${personnel.firstName} ${personnel.lastName}`
                : 'Personel bilgilerini güncelleyin'
            }
          />
        </View>
        {loading || !personnel ? (
          <Loading fullScreen label="Personel yükleniyor…" />
        ) : (
          <PersonnelForm
            mode="edit"
            initialValues={personnelToForm(personnel)}
            loading={saving}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </Screen>
    </>
  );
}
