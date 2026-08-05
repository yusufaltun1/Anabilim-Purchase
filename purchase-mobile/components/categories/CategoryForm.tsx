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
  CATEGORY_PRODUCT_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  UNIT_OF_MEASURE_OPTIONS,
  emptyCategoryForm,
  generateCategoryCode,
  validateCategoryForm,
  type CategoryFormValues,
  type CategoryProductType,
} from '@/services/types/category.types';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export type CategoryFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<CategoryFormValues>;
  onSubmit: (values: CategoryFormValues) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function CategoryForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: CategoryFormProps) {
  const { spacing } = useAppTheme();
  const [values, setValues] = useState<CategoryFormValues>(() => ({
    ...emptyCategoryForm(),
    ...initialValues,
  }));

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const setField = <K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    setValues((prev) => ({
      ...prev,
      name,
      ...(mode === 'create' ? { code: generateCategoryCode(name) } : {}),
    }));
  };

  const handleSubmit = async () => {
    const result = validateCategoryForm(values, mode);
    if (!result.ok) {
      Alert.alert('Doğrulama', result.message);
      return;
    }
    await onSubmit({
      ...values,
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      description: values.description.trim(),
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
          label="Kategori adı"
          required
          placeholder="Kategori adı"
          value={values.name}
          onChangeText={handleNameChange}
          autoCapitalize="words"
        />
        {mode === 'create' ? (
          <Input
            label="Kategori kodu"
            required
            placeholder="KOD"
            value={values.code}
            onChangeText={(v) => setField('code', v.toUpperCase())}
            autoCapitalize="characters"
          />
        ) : null}
        <TextArea
          label="Açıklama"
          placeholder="İsteğe bağlı açıklama"
          value={values.description}
          onChangeText={(v) => setField('description', v)}
          numberOfLines={3}
        />
        <Select
          label="Ürün tipi"
          required
          options={CATEGORY_PRODUCT_TYPE_OPTIONS}
          value={values.productType}
          onChange={(v) => setField('productType', (v ?? 'CONSUMABLE') as CategoryProductType)}
          searchable={false}
          clearable={false}
        />
        <Checkbox
          label="Talep edilebilir (mail: bilgiislem@anabilim.k12.tr)"
          checked={values.requestable}
          onChange={(checked) => setField('requestable', checked)}
        />
        {mode === 'edit' ? (
          <Checkbox
            label="Aktif"
            checked={values.isActive}
            onChange={(checked) => setField('isActive', checked)}
          />
        ) : null}
      </Card>

      <Card>
        <NumberInput
          label="Bildirim eşiği (kalan adet)"
          helper="Kalan miktar bu değere düştüğünde bildirim gönderilir"
          placeholder="Örn: 5"
          value={values.minStockNotifyAt}
          onChangeValue={(v) => setField('minStockNotifyAt', v)}
          min={0}
        />
        <Select
          label="Ölçü birimi"
          required
          options={UNIT_OF_MEASURE_OPTIONS}
          value={values.unitOfMeasure}
          onChange={(v) => setField('unitOfMeasure', v ?? 'PIECE')}
          searchable={false}
          clearable={false}
        />
        <NumberInput
          label="Min. miktar"
          required
          value={values.minQuantity}
          onChangeValue={(v) => setField('minQuantity', v ?? 0)}
          min={0}
        />
        <NumberInput
          label="Max. miktar"
          required
          value={values.maxQuantity}
          onChangeValue={(v) => setField('maxQuantity', v ?? 0)}
          min={0}
        />
        <Select
          label="Para birimi"
          required
          options={CURRENCY_OPTIONS}
          value={values.currency}
          onChange={(v) => setField('currency', v ?? 'TRY')}
          searchable={false}
          clearable={false}
          helper="Bu kategorideki ürünlerde stok alanları bu değerlerden gelir"
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
