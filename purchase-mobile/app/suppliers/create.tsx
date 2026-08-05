import { AccessDenied } from '@/components/auth/AccessDenied';
import { SupplierForm } from '@/components/suppliers';
import { Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { supplierService } from '@/services/api/supplier.service';
import type { SupplierFormValues } from '@/services/types/supplier.types';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function SupplierCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { canSystemManage } = useCapabilities();
  const [loading, setLoading] = useState(false);

  if (!canSystemManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Tedarikçi', headerShown: false }} />
        <AccessDenied description="Tedarikçi oluşturma yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: SupplierFormValues) => {
    if (!token) return;
    setLoading(true);
    try {
      await supplierService.createSupplier(
        {
          name: values.name,
          taxNumber: values.taxNumber,
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
          categoryIds: values.categoryIds,
          isPreferred: values.isPreferred,
          isActive: values.isActive,
        },
        token
      );
      router.replace('/suppliers');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Tedarikçi oluşturulamadı';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Tedarikçi', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Yeni tedarikçi" subtitle="Firma bilgilerini girin" />
        </View>
        <SupplierForm
          mode="create"
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </Screen>
    </>
  );
}
