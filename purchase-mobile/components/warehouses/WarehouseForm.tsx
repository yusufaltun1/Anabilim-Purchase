import { Button, Card, Input, TextArea } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { CreateWarehousePayload } from '@/services/api/warehouse.service';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export type WarehouseFormValues = CreateWarehousePayload;

export type WarehouseFormProps = {
  initialValues?: Partial<WarehouseFormValues>;
  onSubmit: (values: WarehouseFormValues) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10,11}$/;

export function emptyWarehouseForm(): WarehouseFormValues {
  return {
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    managerName: '',
  };
}

export function validateWarehouseForm(
  values: WarehouseFormValues
): { ok: true } | { ok: false; message: string } {
  if (!values.name.trim()) return { ok: false, message: 'Depo adı zorunludur' };
  if (!values.code.trim()) return { ok: false, message: 'Depo kodu zorunludur' };
  if (!values.address.trim()) return { ok: false, message: 'Adres zorunludur' };
  if (!values.phone.trim()) return { ok: false, message: 'Telefon numarası zorunludur' };
  if (!values.email.trim()) return { ok: false, message: 'E-posta adresi zorunludur' };
  if (!values.managerName.trim()) return { ok: false, message: 'Depo sorumlusu zorunludur' };

  if (!EMAIL_REGEX.test(values.email.trim())) {
    return { ok: false, message: 'Geçerli bir e-posta adresi giriniz' };
  }

  const digits = values.phone.replace(/\D/g, '');
  if (!PHONE_REGEX.test(digits)) {
    return { ok: false, message: 'Geçerli bir telefon numarası giriniz (10–11 hane)' };
  }

  return { ok: true };
}

export function WarehouseForm({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: WarehouseFormProps) {
  const { spacing } = useAppTheme();
  const [values, setValues] = useState<WarehouseFormValues>(() => ({
    ...emptyWarehouseForm(),
    ...initialValues,
  }));

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const setField = <K extends keyof WarehouseFormValues>(key: K, value: WarehouseFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const result = validateWarehouseForm(values);
    if (!result.ok) {
      Alert.alert('Doğrulama', result.message);
      return;
    }
    await onSubmit({
      name: values.name.trim(),
      code: values.code.trim(),
      address: values.address.trim(),
      phone: values.phone.replace(/\D/g, ''),
      email: values.email.trim(),
      managerName: values.managerName.trim(),
    });
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.md }}
    >
      <Card>
        <Input
          label="Depo adı"
          required
          placeholder="Depo adı"
          value={values.name}
          onChangeText={(v) => setField('name', v)}
          autoCapitalize="words"
        />
        <Input
          label="Depo kodu"
          required
          placeholder="Kod"
          value={values.code}
          onChangeText={(v) => setField('code', v)}
          autoCapitalize="characters"
        />
        <TextArea
          label="Adres"
          required
          placeholder="Açık adres"
          value={values.address}
          onChangeText={(v) => setField('address', v)}
          numberOfLines={3}
        />
        <Input
          label="Telefon"
          required
          placeholder="10–11 hane"
          value={values.phone}
          onChangeText={(v) => setField('phone', v.replace(/[^0-9]/g, '').slice(0, 11))}
          keyboardType="phone-pad"
        />
        <Input
          label="E-posta"
          required
          placeholder="depo@ornek.com"
          value={values.email}
          onChangeText={(v) => setField('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Depo sorumlusu"
          required
          placeholder="Ad soyad"
          value={values.managerName}
          onChangeText={(v) => setField('managerName', v)}
          autoCapitalize="words"
        />
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Button title="İptal" onPress={onCancel} variant="outline" style={{ flex: 1 }} disabled={loading} />
        <Button
          title="Depo Oluştur"
          onPress={() => void handleSubmit()}
          loading={loading}
          disabled={loading}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}
