import {
  Button,
  Card,
  Checkbox,
  Input,
  MultiSelect,
  TextArea,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { categoryService } from '@/services/api/category.service';
import {
  emptySupplierForm,
  validateSupplierForm,
  type SupplierFormValues,
} from '@/services/types/supplier.types';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export type SupplierFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<SupplierFormValues>;
  onSubmit: (values: SupplierFormValues) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function SupplierForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: SupplierFormProps) {
  const { token } = useAuth();
  const { spacing } = useAppTheme();
  const [values, setValues] = useState<SupplierFormValues>(() => ({
    ...emptySupplierForm(),
    ...initialValues,
  }));
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: number }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  useEffect(() => {
    if (!token) {
      setCategoriesLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setCategoriesLoading(true);
        const cats = await categoryService.getActiveCategories(token);
        if (!cancelled) {
          setCategoryOptions(cats.map((c) => ({ label: c.name, value: c.id })));
        }
      } catch (err) {
        console.error('Categories load failed:', err);
        if (!cancelled) {
          Alert.alert('Hata', 'Kategoriler yüklenirken bir sorun oluştu');
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const setField = <K extends keyof SupplierFormValues>(key: K, value: SupplierFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const result = validateSupplierForm(values, mode);
    if (!result.ok) {
      Alert.alert('Doğrulama', result.message);
      return;
    }
    await onSubmit({
      ...values,
      name: values.name.trim(),
      taxNumber: values.taxNumber.trim(),
      taxOffice: values.taxOffice.trim(),
      address: values.address.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      website: values.website.trim(),
      contactPerson: values.contactPerson.trim(),
      contactPhone: values.contactPhone.replace(/\s/g, ''),
      contactEmail: values.contactEmail.trim(),
      bankAccount: values.bankAccount.trim(),
      iban: values.iban.replace(/\s/g, '').toUpperCase(),
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
          label="Firma adı"
          required
          placeholder="Tedarikçi firma adı"
          value={values.name}
          onChangeText={(v) => setField('name', v)}
          autoCapitalize="words"
        />
        <Input
          label="Vergi numarası"
          required={mode === 'create'}
          placeholder="10 haneli vergi no"
          value={values.taxNumber}
          onChangeText={(v) => setField('taxNumber', v.replace(/[^0-9]/g, '').slice(0, 10))}
          keyboardType="number-pad"
          editable={mode === 'create'}
          helper={mode === 'edit' ? 'Vergi numarası düzenlenemez' : undefined}
        />
        <Input
          label="Vergi dairesi"
          required
          placeholder="Vergi dairesi"
          value={values.taxOffice}
          onChangeText={(v) => setField('taxOffice', v)}
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
          placeholder="Firma telefonu"
          value={values.phone}
          onChangeText={(v) => setField('phone', v)}
          keyboardType="phone-pad"
        />
        <Input
          label="E-posta"
          required
          placeholder="firma@ornek.com"
          value={values.email}
          onChangeText={(v) => setField('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Web sitesi"
          placeholder="https://"
          value={values.website}
          onChangeText={(v) => setField('website', v)}
          autoCapitalize="none"
          keyboardType="url"
        />
      </Card>

      <Card>
        <Input
          label="İletişim kişisi"
          required
          placeholder="Ad soyad"
          value={values.contactPerson}
          onChangeText={(v) => setField('contactPerson', v)}
        />
        <Input
          label="İletişim telefonu"
          required
          placeholder="10–11 hane"
          value={values.contactPhone}
          onChangeText={(v) => setField('contactPhone', v.replace(/[^0-9]/g, '').slice(0, 11))}
          keyboardType="phone-pad"
        />
        <Input
          label="İletişim e-postası"
          required
          placeholder="iletisim@ornek.com"
          value={values.contactEmail}
          onChangeText={(v) => setField('contactEmail', v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Card>

      <Card>
        <Input
          label="Banka hesabı"
          required
          placeholder="Banka / hesap bilgisi"
          value={values.bankAccount}
          onChangeText={(v) => setField('bankAccount', v)}
        />
        <Input
          label="IBAN"
          placeholder="TRxxxxxxxxxxxxxxxxxxxxxxxx"
          value={values.iban}
          onChangeText={(v) => setField('iban', v.toUpperCase())}
          autoCapitalize="characters"
        />
        <MultiSelect
          label="Kategoriler"
          placeholder={categoriesLoading ? 'Yükleniyor…' : 'Kategori seçin'}
          options={categoryOptions}
          value={values.categoryIds}
          onChange={(ids) => setField('categoryIds', ids)}
          disabled={categoriesLoading}
        />
        <Checkbox
          label="Tercih edilen tedarikçi"
          checked={values.isPreferred}
          onChange={(checked) => setField('isPreferred', checked)}
        />
        <Checkbox
          label="Aktif"
          checked={values.isActive}
          onChange={(checked) => setField('isActive', checked)}
        />
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Button title="İptal" onPress={onCancel} variant="outline" style={{ flex: 1 }} disabled={loading} />
        <Button
          title={mode === 'create' ? 'Oluştur' : 'Kaydet'}
          onPress={() => void handleSubmit()}
          loading={loading}
          disabled={loading}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}
