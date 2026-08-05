import {
  Button,
  Card,
  Checkbox,
  Input,
  NumberInput,
  Select,
  TextArea,
} from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  emptySchoolForm,
  generateSchoolCode,
  SCHOOL_TYPE_OPTIONS,
  validateSchoolForm,
  type SchoolFormValues,
} from '@/services/types/school.types';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export type SchoolFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<SchoolFormValues>;
  onSubmit: (values: SchoolFormValues) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function SchoolForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: SchoolFormProps) {
  const { spacing } = useAppTheme();
  const [values, setValues] = useState<SchoolFormValues>(() => ({
    ...emptySchoolForm(),
    ...initialValues,
  }));
  const [codeTouched, setCodeTouched] = useState(mode === 'edit');

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const setField = <K extends keyof SchoolFormValues>(key: K, value: SchoolFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    setValues((prev) => ({
      ...prev,
      name,
      code: codeTouched ? prev.code : generateSchoolCode(name),
    }));
  };

  const handleSubmit = async () => {
    const result = validateSchoolForm(values);
    if (!result.ok) {
      Alert.alert('Doğrulama', result.message);
      return;
    }
    await onSubmit({
      ...values,
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      address: values.address.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      principalName: values.principalName.trim(),
      district: values.district.trim(),
      city: values.city.trim(),
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
          label="Okul adı"
          required
          placeholder="Atatürk İlkokulu"
          value={values.name}
          onChangeText={handleNameChange}
          autoCapitalize="words"
        />
        <Input
          label="Okul kodu"
          required
          placeholder="ATK_ILK_001"
          value={values.code}
          onChangeText={(v) => {
            setCodeTouched(true);
            setField('code', v.toUpperCase());
          }}
          autoCapitalize="characters"
          helper={
            mode === 'create'
              ? 'Okul adından otomatik oluşturulur, düzenleyebilirsiniz'
              : undefined
          }
        />
        <Select
          label="Okul türü"
          required
          placeholder="Tür seçin"
          options={SCHOOL_TYPE_OPTIONS}
          value={values.schoolType}
          onChange={(value) => {
            if (value) setField('schoolType', value);
          }}
          clearable={false}
          searchable={false}
        />
        <TextArea
          label="Adres"
          required
          placeholder="Cumhuriyet Mahallesi, Atatürk Caddesi No:15"
          value={values.address}
          onChangeText={(v) => setField('address', v)}
          numberOfLines={3}
        />
      </Card>

      <Card>
        <Input
          label="Şehir"
          required
          placeholder="İstanbul"
          value={values.city}
          onChangeText={(v) => setField('city', v)}
        />
        <Input
          label="İlçe"
          required
          placeholder="Merkez"
          value={values.district}
          onChangeText={(v) => setField('district', v)}
        />
        <Input
          label="Müdür adı"
          required
          placeholder="Mehmet Yılmaz"
          value={values.principalName}
          onChangeText={(v) => setField('principalName', v)}
        />
        <NumberInput
          label="Öğrenci kapasitesi"
          required
          placeholder="500"
          value={values.studentCapacity}
          onChangeValue={(v) => setField('studentCapacity', v ?? 0)}
          min={1}
        />
      </Card>

      <Card>
        <Input
          label="Telefon"
          required
          placeholder="+90 212 555 0101"
          value={values.phone}
          onChangeText={(v) => setField('phone', v)}
          keyboardType="phone-pad"
        />
        <Input
          label="E-posta"
          required
          placeholder="info@okul.edu.tr"
          value={values.email}
          onChangeText={(v) => setField('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {mode === 'create' ? (
          <Checkbox
            label="Aktif"
            checked={values.isActive}
            onChange={(checked) => setField('isActive', checked)}
          />
        ) : null}
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Button title="İptal" onPress={onCancel} variant="outline" style={{ flex: 1 }} disabled={loading} />
        <Button
          title={mode === 'create' ? 'Kaydet' : 'Güncelle'}
          onPress={() => void handleSubmit()}
          loading={loading}
          disabled={loading}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}
