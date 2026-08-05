import {
  Button,
  Card,
  Checkbox,
  Input,
  MultiSelect,
  Select,
  Text,
  TextArea,
} from '@/components/ui';
import {
  CURRENCY_OPTIONS,
  normalizeProductType,
  PRODUCT_TYPE_OPTIONS,
  UNIT_OF_MEASURE_OPTIONS,
  type ProductTypeValue,
} from '@/domain/stockroom/productLabels';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { categoryService, type Category } from '@/services/api/category.service';
import { supplierService } from '@/services/api/supplier.service';
import {
  emptyProductForm,
  validateProductForm,
  type ProductFormValues,
} from '@/services/types/product.types';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, View } from 'react-native';

export type ProductFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function ProductForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}: ProductFormProps) {
  const { token } = useAuth();
  const { colors, spacing, radius } = useAppTheme();
  const [values, setValues] = useState<ProductFormValues>(() => ({
    ...emptyProductForm(),
    ...initialValues,
  }));
  const [categories, setCategories] = useState<Category[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<{ label: string; value: number }[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [productTypeLocked, setProductTypeLocked] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  useEffect(() => {
    if (!token) {
      setMetaLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setMetaLoading(true);
        const cats = await categoryService.getActiveCategories(token);
        if (!cancelled) setCategories(cats);
      } catch (err) {
        console.error('Categories load failed:', err);
        if (!cancelled) Alert.alert('Hata', 'Kategoriler yüklenirken bir sorun oluştu');
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !values.categoryId) {
      setSupplierOptions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const suppliers = await supplierService.getSuppliersByCategory(values.categoryId!, token);
        if (!cancelled) {
          setSupplierOptions(suppliers.map((s) => ({ label: s.name, value: s.id })));
        }
      } catch {
        if (!cancelled) {
          try {
            const all = await supplierService.getActiveSuppliers(token);
            if (!cancelled) {
              setSupplierOptions(all.map((s) => ({ label: s.name, value: s.id })));
            }
          } catch {
            if (!cancelled) setSupplierOptions([]);
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, values.categoryId]);

  // İlk yüklemede kategori tipi kilidi
  useEffect(() => {
    if (!values.categoryId || categories.length === 0) return;
    const cat = categories.find((c) => c.id === values.categoryId);
    const fromCat = normalizeProductType(cat?.productType);
    setProductTypeLocked(Boolean(fromCat));
  }, [values.categoryId, categories]);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, value: c.id })),
    [categories]
  );

  const setField = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCategoryChange = (categoryId: number | null) => {
    const cat = categories.find((c) => c.id === categoryId);
    const fromCat = normalizeProductType(cat?.productType);
    setProductTypeLocked(Boolean(fromCat));
    setValues((prev) => ({
      ...prev,
      categoryId,
      productType: fromCat ?? prev.productType,
      supplierIds: [],
    }));
  };

  const handleImagePick = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('İzin gerekli', 'Galeri erişimi için izin vermeniz gerekir.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      if (asset.base64) {
        setField('imageUrl', `data:image/jpeg;base64,${asset.base64}`);
      } else if (asset.uri) {
        setField('imageUrl', asset.uri);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Resim yüklenirken bir sorun oluştu');
    }
  };

  const handleSubmit = async () => {
    const result = validateProductForm(values, mode);
    if (!result.ok) {
      Alert.alert('Doğrulama', result.message);
      return;
    }
    await onSubmit({
      ...values,
      name: values.name.trim(),
      code: values.code.trim(),
      description: values.description.trim(),
      serialNumber: values.serialNumber.trim(),
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
          label="Ürün adı"
          required
          placeholder="Ürün adını giriniz"
          value={values.name}
          onChangeText={(v) => setField('name', v)}
        />
        <Input
          label="Ürün kodu"
          required={mode === 'edit'}
          placeholder={mode === 'create' ? 'Boş bırakılırsa otomatik' : 'Ürün kodu'}
          value={values.code}
          onChangeText={(v) => setField('code', v)}
          editable={mode === 'create'}
          helper={mode === 'edit' ? 'Kod düzenlenemez' : undefined}
        />
        <Select
          label="Kategori"
          required
          placeholder={metaLoading ? 'Yükleniyor…' : 'Kategori seçiniz'}
          options={categoryOptions}
          value={values.categoryId}
          onChange={handleCategoryChange}
          disabled={metaLoading}
          searchable
        />
        <Select
          label="Ürün tipi"
          required
          placeholder="Tip seçiniz"
          options={PRODUCT_TYPE_OPTIONS}
          value={values.productType}
          onChange={(v) => setField('productType', (v ?? 'CONSUMABLE') as ProductTypeValue)}
          disabled={productTypeLocked}
          clearable={false}
          helper={productTypeLocked ? 'Kategoriden otomatik alındı' : undefined}
        />
        <Select
          label="Birim"
          required
          placeholder="Birim seçiniz"
          options={UNIT_OF_MEASURE_OPTIONS}
          value={values.unitOfMeasure}
          onChange={(v) => setField('unitOfMeasure', v ?? 'PIECE')}
          clearable={false}
        />
        <TextArea
          label="Açıklama"
          placeholder="Ürün açıklaması (opsiyonel)"
          value={values.description}
          onChangeText={(v) => setField('description', v)}
          numberOfLines={3}
        />
        {mode === 'create' ? (
          <Input
            label="Seri no"
            placeholder="Opsiyonel"
            value={values.serialNumber}
            onChangeText={(v) => setField('serialNumber', v)}
          />
        ) : null}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Min. miktar"
              placeholder="0"
              value={values.minQuantity}
              onChangeText={(v) => setField('minQuantity', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Max. miktar"
              placeholder="0"
              value={values.maxQuantity}
              onChangeText={(v) => setField('maxQuantity', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
            />
          </View>
        </View>
        <Input
          label="Tahmini birim fiyat"
          placeholder="0.00"
          value={values.estimatedUnitPrice}
          onChangeText={(v) =>
            setField('estimatedUnitPrice', v.replace(/[^0-9.,]/g, '').replace(',', '.'))
          }
          keyboardType="decimal-pad"
        />
        <Select
          label="Para birimi"
          options={CURRENCY_OPTIONS}
          value={values.currency}
          onChange={(v) => setField('currency', v ?? 'TRY')}
          clearable={false}
        />
        {values.categoryId ? (
          <MultiSelect
            label="Tedarikçiler"
            placeholder="Kategoriye göre tedarikçi"
            options={supplierOptions}
            value={values.supplierIds}
            onChange={(ids) => setField('supplierIds', ids)}
          />
        ) : null}

        <View style={{ marginBottom: spacing.lg }}>
          <Text variant="label" style={{ marginBottom: spacing.sm }}>
            Ürün resmi
          </Text>
          {values.imageUrl ? (
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: values.imageUrl }}
                style={{ width: '100%', height: 160, borderRadius: radius.lg }}
                resizeMode="cover"
              />
              <Pressable
                onPress={() => setField('imageUrl', '')}
                accessibilityLabel="Resmi kaldır"
                style={{
                  position: 'absolute',
                  top: spacing.sm,
                  right: spacing.sm,
                  backgroundColor: colors.error,
                  borderRadius: radius.full,
                  padding: spacing.xs,
                }}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => void handleImagePick()}
              style={{
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.xl,
                alignItems: 'center',
                gap: spacing.sm,
                backgroundColor: colors.backgroundSecondary,
              }}
            >
              <Ionicons name="image-outline" size={28} color={colors.primary} />
              <Text variant="bodyStrong" color={colors.primary}>
                Resim yükle
              </Text>
            </Pressable>
          )}
        </View>

        {mode === 'edit' ? (
          <Checkbox
            label="Aktif"
            checked={values.isActive}
            onChange={(checked) => setField('isActive', checked)}
          />
        ) : null}
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Button title="İptal" onPress={onCancel} variant="outline" style={{ flex: 1 }} />
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
