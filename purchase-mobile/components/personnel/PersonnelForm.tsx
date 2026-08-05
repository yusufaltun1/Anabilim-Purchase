import {
  Button,
  Card,
  Checkbox,
  DateTimeField,
  Input,
  NumberInput,
  Select,
  TextArea,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { schoolService } from '@/services/api/school.service';
import {
  EMPLOYMENT_TYPE_OPTIONS,
  PERSONNEL_ROLE_OPTIONS,
  PERSONNEL_STATUS_OPTIONS,
  emptyPersonnelForm,
  validatePersonnelForm,
  type PersonnelFormValues,
} from '@/services/types/personnel.types';
import type { School } from '@/services/types/school.types';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

function parseIsoDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toIsoDate(date: Date | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type PersonnelFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<PersonnelFormValues>;
  onSubmit: (values: PersonnelFormValues) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function PersonnelForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: PersonnelFormProps) {
  const { token } = useAuth();
  const { spacing } = useAppTheme();
  const [values, setValues] = useState<PersonnelFormValues>(() => ({
    ...emptyPersonnelForm(),
    ...initialValues,
  }));
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  useEffect(() => {
    if (!token) {
      setSchoolsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setSchoolsLoading(true);
        const active = await schoolService.getActiveSchools(token);
        if (cancelled) return;
        setSchools(active);
        if (mode === 'create') {
          setValues((prev) => (prev.schoolId ? prev : { ...prev, schoolId: active[0]?.id ?? 0 }));
        }
      } catch (err) {
        console.error('Failed to load schools for personnel form:', err);
        if (!cancelled) {
          Alert.alert('Hata', 'Okullar yüklenirken bir hata oluştu');
        }
      } finally {
        if (!cancelled) setSchoolsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, mode]);

  const schoolOptions = (() => {
    const options = schools.map((s) => ({ label: s.name, value: String(s.id) }));
    if (
      values.schoolId &&
      !options.some((o) => o.value === String(values.schoolId)) &&
      initialValues?.schoolId === values.schoolId
    ) {
      options.unshift({
        label: values.schoolName || `Okul #${values.schoolId}`,
        value: String(values.schoolId),
      });
    }
    return options;
  })();

  const setField = <K extends keyof PersonnelFormValues>(key: K, value: PersonnelFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const result = validatePersonnelForm(values, mode);
    if (!result.ok) {
      Alert.alert('Doğrulama', result.message);
      return;
    }
    await onSubmit(values);
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.md }}
    >
      <Card>
        <Select
          label="Okul"
          required={mode === 'create'}
          placeholder={schoolsLoading ? 'Okullar yükleniyor…' : 'Okul seçiniz'}
          options={schoolOptions}
          value={values.schoolId ? String(values.schoolId) : null}
          onChange={(value) => {
            if (mode === 'edit') return;
            setField('schoolId', value ? Number(value) : 0);
          }}
          clearable={false}
          searchable
          disabled={mode === 'edit' || schoolsLoading || loading}
        />
        <Input
          label="Ad"
          required
          placeholder="Mehmet"
          value={values.firstName}
          onChangeText={(v) => setField('firstName', v)}
          autoCapitalize="words"
        />
        <Input
          label="Soyad"
          required
          placeholder="Yılmaz"
          value={values.lastName}
          onChangeText={(v) => setField('lastName', v)}
          autoCapitalize="words"
        />
        <Input
          label="TC Kimlik No"
          required
          placeholder="12345678901"
          value={values.tcNo}
          onChangeText={(v) => setField('tcNo', v.replace(/\D/g, '').slice(0, 11))}
          keyboardType="number-pad"
          maxLength={11}
        />
      </Card>

      <Card>
        <Input
          label="E-posta"
          required
          placeholder="mehmet.yilmaz@okul.edu.tr"
          value={values.email}
          onChangeText={(v) => setField('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Telefon"
          required
          placeholder="+90 555 123 45 67"
          value={values.phone}
          onChangeText={(v) => setField('phone', v)}
          keyboardType="phone-pad"
        />
        <TextArea
          label="Adres"
          required
          placeholder="Ev adresi…"
          value={values.address}
          onChangeText={(v) => setField('address', v)}
          numberOfLines={3}
        />
      </Card>

      <Card>
        <Select
          label="Görev"
          required
          placeholder="Görev seçin"
          options={PERSONNEL_ROLE_OPTIONS}
          value={values.role}
          onChange={(value) => {
            if (value) setField('role', value);
          }}
          clearable={false}
          searchable={false}
        />
        <Select
          label="İstihdam türü"
          required
          placeholder="Tür seçin"
          options={EMPLOYMENT_TYPE_OPTIONS}
          value={values.employmentType}
          onChange={(value) => {
            if (value) setField('employmentType', value);
          }}
          clearable={false}
          searchable={false}
        />
        <Select
          label="Durum"
          required
          placeholder="Durum seçin"
          options={PERSONNEL_STATUS_OPTIONS}
          value={values.status}
          onChange={(value) => {
            if (value) setField('status', value);
          }}
          clearable={false}
          searchable={false}
        />
        <DateTimeField
          label="İşe başlama tarihi"
          required
          mode="date"
          value={parseIsoDate(values.startDate)}
          onChange={(date) => setField('startDate', toIsoDate(date))}
          clearable={false}
        />
        <DateTimeField
          label="İşten ayrılma tarihi"
          mode="date"
          value={parseIsoDate(values.endDate)}
          onChange={(date) => setField('endDate', toIsoDate(date))}
          clearable
        />
      </Card>

      <Card>
        <NumberInput
          label="Maaş (TL)"
          placeholder="15000"
          value={values.salary}
          onChangeValue={(v) => setField('salary', v)}
          min={0}
        />
        <Input
          label="Departman"
          placeholder="Matematik Bölümü"
          value={values.department}
          onChangeText={(v) => setField('department', v)}
        />
        <Input
          label="Branş (öğretmenler için)"
          placeholder="Matematik, Türkçe, İngilizce…"
          value={values.branchSubject}
          onChangeText={(v) => setField('branchSubject', v)}
        />
        <TextArea
          label="Nitelikler / eğitim durumu"
          placeholder="Eğitim durumu, sertifikalar…"
          value={values.qualifications}
          onChangeText={(v) => setField('qualifications', v)}
          numberOfLines={3}
        />
        <TextArea
          label="Notlar"
          placeholder="Ek bilgiler…"
          value={values.notes}
          onChangeText={(v) => setField('notes', v)}
          numberOfLines={3}
        />
        {mode === 'edit' ? (
          <Checkbox
            label="Aktif"
            checked={values.isActive}
            onChange={(checked) => setField('isActive', checked)}
          />
        ) : null}
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Button
          title="İptal"
          onPress={onCancel}
          variant="outline"
          style={{ flex: 1 }}
          disabled={loading}
        />
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
