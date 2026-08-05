import { AccessDenied } from '@/components/auth/AccessDenied';
import { SupplierForm } from '@/components/suppliers';
import { Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { supplierService } from '@/services/api/supplier.service';
import {
  supplierToForm,
  type Supplier,
  type SupplierFormValues,
} from '@/services/types/supplier.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

export default function SupplierEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
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
        const data = await supplierService.getSupplierById(Number(id), token);
        if (!cancelled) setSupplier(data);
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          Alert.alert('Hata', err instanceof Error ? err.message : 'Tedarikçi yüklenemedi', [
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
        <Stack.Screen options={{ title: 'Tedarikçi Düzenle', headerShown: false }} />
        <AccessDenied description="Tedarikçi düzenleme yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: SupplierFormValues) => {
    if (!token || !supplier) return;
    setSaving(true);
    try {
      await supplierService.updateSupplier(
        supplier.id,
        {
          name: values.name,
          taxOffice: values.taxOffice,
          address: values.address,
          phone: values.phone,
          email: values.email,
          website: values.website || undefined,
          contactPerson: values.contactPerson,
          contactPhone: values.contactPhone,
          contactEmail: values.contactEmail,
          bankAccount: values.bankAccount,
          iban: values.iban || undefined,
          isActive: values.isActive,
          isPreferred: values.isPreferred,
          categoryIds: values.categoryIds,
        },
        token
      );
      router.replace('/suppliers');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Tedarikçi güncellenemedi';
      Alert.alert('Hata', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Tedarikçi Düzenle', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Tedarikçi düzenle"
            subtitle={supplier?.name ?? 'Firma bilgilerini güncelleyin'}
          />
        </View>
        {loading || !supplier ? (
          <Loading fullScreen label="Tedarikçi yükleniyor…" />
        ) : (
          <SupplierForm
            mode="edit"
            initialValues={supplierToForm(supplier)}
            loading={saving}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </Screen>
    </>
  );
}
