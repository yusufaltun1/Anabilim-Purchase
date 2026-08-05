import { ThemedText } from '@/components/themed-text';
import {
  Button,
  Card,
  DateTimeField,
  Input,
  MultiSelect,
  NumberInput,
  Select,
  TextArea,
} from '@/components/ui';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { productService } from '@/services/api/product.service';
import { purchaseService } from '@/services/api/purchase.service';
import type { PurchaseRequest, Supplier } from '@/services/types/purchase.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

type ActiveProduct = {
  id: number;
  name: string;
  code?: string;
  description?: string;
  categoryId?: number;
  category?: { id: number; name?: string };
};

type FormItem = {
  id?: number;
  productId: number | null;
  productName: string;
  description: string;
  quantity: number;
  productLink: string;
  estimatedDeliveryDate: string;
  notes: string;
  potentialSupplierIds: number[];
  categoryId?: number | null;
};

export type PurchaseRequestItemsFormProps = {
  requestId: number;
  initialData: PurchaseRequest;
  onSuccess?: (request: PurchaseRequest) => void;
  onCancel?: () => void;
};

function toLocalDateTime(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}:${s}`;
}

function parseOptionalDate(value?: string): Date | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function resolveCategoryId(product: ActiveProduct | undefined): number | null {
  if (!product) return null;
  if (product.categoryId != null) return product.categoryId;
  if (product.category?.id != null) return product.category.id;
  return null;
}

function mapInitialItems(items?: PurchaseRequest['items']): FormItem[] {
  if (!items?.length) {
    return [
      {
        productId: null,
        productName: '',
        description: '',
        quantity: 1,
        productLink: '',
        estimatedDeliveryDate: '',
        notes: '',
        potentialSupplierIds: [],
        categoryId: null,
      },
    ];
  }
  return items.map((item) => ({
    id: item.id,
    productId: item.productId ?? item.product?.id ?? null,
    productName: item.productName || item.product?.name || '',
    description: item.description || item.product?.description || '',
    quantity: item.quantity || 1,
    productLink: item.productLink || '',
    estimatedDeliveryDate: item.estimatedDeliveryDate || '',
    notes: item.notes || '',
    potentialSupplierIds:
      item.potentialSupplierIds ?? item.potentialSuppliers?.map((s) => s.id) ?? [],
    categoryId: item.product?.category?.id ?? null,
  }));
}

export const PurchaseRequestItemsForm: React.FC<PurchaseRequestItemsFormProps> = ({
  requestId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [items, setItems] = useState<FormItem[]>(() => mapInitialItems(initialData.items));
  const [products, setProducts] = useState<ActiveProduct[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [itemSuppliers, setItemSuppliers] = useState<Record<number, Supplier[]>>({});
  const [showAllSuppliers, setShowAllSuppliers] = useState<Record<number, boolean>>({});
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialData.title || '');
    setDescription(initialData.description || '');
    setItems(mapInitialItems(initialData.items));
  }, [initialData]);

  useEffect(() => {
    if (!token) {
      setLoadingMeta(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingMeta(true);
        const [productList, supplierList] = await Promise.all([
          productService.getActiveProducts(token),
          purchaseService.getActiveSuppliers(token),
        ]);
        if (cancelled) return;
        setProducts(productList);
        setAllSuppliers(supplierList);
      } catch (err) {
        console.error('Ürün/tedarikçi yükleme hatası:', err);
        if (!cancelled) {
          Alert.alert('Hata', 'Ürün veya tedarikçi listesi yüklenemedi.');
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const loadSuppliersForItem = useCallback(
    async (index: number, categoryId: number | null | undefined, forceAll = false) => {
      if (!token) return;
      if (forceAll || categoryId == null) {
        setItemSuppliers((prev) => ({ ...prev, [index]: allSuppliers }));
        setShowAllSuppliers((prev) => ({ ...prev, [index]: true }));
        return;
      }
      try {
        const list = await purchaseService.getSuppliersByCategory(categoryId, token);
        setItemSuppliers((prev) => ({ ...prev, [index]: list }));
        setShowAllSuppliers((prev) => ({ ...prev, [index]: false }));
      } catch {
        setItemSuppliers((prev) => ({ ...prev, [index]: allSuppliers }));
        setShowAllSuppliers((prev) => ({ ...prev, [index]: true }));
      }
    },
    [token, allSuppliers]
  );

  useEffect(() => {
    if (loadingMeta || !allSuppliers.length) return;
    items.forEach((item, index) => {
      void loadSuppliersForItem(index, item.categoryId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed suppliers once meta is ready
  }, [loadingMeta, allSuppliers]);

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: p.code ? `${p.name} (${p.code})` : p.name,
      })),
    [products]
  );

  const getSupplierOptions = (index: number) => {
    const list = showAllSuppliers[index] ? allSuppliers : itemSuppliers[index] ?? allSuppliers;
    return list.map((s) => ({ value: s.id, label: s.name }));
  };

  const updateItem = <K extends keyof FormItem>(index: number, field: K, value: FormItem[K]) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleProductSelect = async (index: number, productId: number | null) => {
    const selected = products.find((p) => p.id === productId);
    const categoryId = resolveCategoryId(selected);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              productId,
              productName: selected?.name || item.productName,
              description: selected?.description || item.description,
              categoryId,
              potentialSupplierIds: categoryId != null ? [] : item.potentialSupplierIds,
            }
          : item
      )
    );
    await loadSuppliersForItem(index, categoryId);
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: null,
        productName: '',
        description: '',
        quantity: 1,
        productLink: '',
        estimatedDeliveryDate: '',
        notes: '',
        potentialSupplierIds: [],
        categoryId: null,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setItemSuppliers((prev) => {
      const next: Record<number, Supplier[]> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const k = Number(key);
        if (k < index) next[k] = value;
        else if (k > index) next[k - 1] = value;
      });
      return next;
    });
    setShowAllSuppliers((prev) => {
      const next: Record<number, boolean> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const k = Number(key);
        if (k < index) next[k] = value;
        else if (k > index) next[k - 1] = value;
      });
      return next;
    });
  };

  const toggleShowAllSuppliers = async (index: number) => {
    const next = !showAllSuppliers[index];
    setShowAllSuppliers((prev) => ({ ...prev, [index]: next }));
    if (next) {
      setItemSuppliers((prev) => ({ ...prev, [index]: allSuppliers }));
      if (!allSuppliers.length && token) {
        try {
          const list = await purchaseService.getActiveSuppliers(token);
          setAllSuppliers(list);
          setItemSuppliers((prev) => ({ ...prev, [index]: list }));
        } catch {
          /* keep empty */
        }
      }
    } else {
      await loadSuppliersForItem(index, items[index]?.categoryId, false);
    }
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Talep başlığı gereklidir');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Hata', 'Açıklama gereklidir');
      return false;
    }
    if (items.length === 0) {
      Alert.alert('Hata', 'En az bir ürün eklemelisiniz');
      return false;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const n = i + 1;
      if (item.productId == null) {
        Alert.alert('Hata', `${n}. kalem için ürün seçiniz`);
        return false;
      }
      if (!item.productName.trim()) {
        Alert.alert('Hata', `${n}. ürün için ürün adı gereklidir`);
        return false;
      }
      if (!item.description.trim()) {
        Alert.alert('Hata', `${n}. ürün için açıklama gereklidir`);
        return false;
      }
      if (!item.quantity || item.quantity < 1) {
        Alert.alert('Hata', `${n}. ürün için geçerli bir miktar giriniz`);
        return false;
      }
      if (!item.estimatedDeliveryDate?.trim()) {
        Alert.alert('Hata', `${n}. ürün için tahmini teslimat tarihi gereklidir`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || !token) return;
    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        items: items.map((item) => ({
          id: item.id ?? null,
          productId: item.productId,
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          productLink: item.productLink || '',
          estimatedDeliveryDate: item.estimatedDeliveryDate,
          notes: item.notes || '',
          potentialSupplierIds: item.potentialSupplierIds ?? [],
        })),
      };
      const updated = await purchaseService.updateItems(requestId, payload, token);
      Alert.alert('Başarılı', 'Talep kalemleri güncellendi', [
        { text: 'Tamam', onPress: () => onSuccess?.(updated) },
      ]);
    } catch (error) {
      console.error('updateItems error:', error);
      Alert.alert(
        'Hata',
        error instanceof Error ? error.message : 'Kalemler güncellenirken bir hata oluştu'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Card style={styles.sectionCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Talep Bilgileri
          </ThemedText>
          <Input
            label="Başlık"
            required
            placeholder="Talep başlığını giriniz"
            value={title}
            onChangeText={setTitle}
          />
          <TextArea
            label="Açıklama"
            required
            placeholder="Talep açıklamasını giriniz"
            value={description}
            onChangeText={setDescription}
            numberOfLines={3}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Kalemler ({items.length})
            </ThemedText>
            <Button title="Kalem Ekle" onPress={addItem} variant="outline" size="small" />
          </View>

          {loadingMeta ? (
            <ThemedText style={{ color: colors.textSecondary }}>Ürünler yükleniyor…</ThemedText>
          ) : null}

          {items.map((item, index) => (
            <Card key={`item-${index}-${item.id ?? 'new'}`} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <ThemedText style={styles.itemTitle}>Kalem {index + 1}</ThemedText>
                {items.length > 1 ? (
                  <Pressable onPress={() => removeItem(index)} style={styles.removeButton} hitSlop={8}>
                    <Ionicons name="close" size={18} color={colors.error} />
                  </Pressable>
                ) : null}
              </View>

              <Select<number>
                label="Ürün"
                required
                placeholder="Ürün seçin"
                options={productOptions}
                value={item.productId}
                onChange={(value) => void handleProductSelect(index, value)}
                searchable
              />

              <Input
                label="Ürün Adı"
                required
                placeholder="Ürün adı"
                value={item.productName}
                onChangeText={(value) => updateItem(index, 'productName', value)}
              />

              <TextArea
                label="Açıklama"
                required
                placeholder="Ürün açıklaması"
                value={item.description}
                onChangeText={(value) => updateItem(index, 'description', value)}
                numberOfLines={2}
              />

              <View style={styles.supplierToggleRow}>
                <ThemedText style={styles.supplierLabel}>Potansiyel Tedarikçiler</ThemedText>
                <Button
                  title={showAllSuppliers[index] ? 'Kategori tedarikçileri' : 'Tüm tedarikçileri göster'}
                  onPress={() => void toggleShowAllSuppliers(index)}
                  variant="ghost"
                  size="small"
                />
              </View>

              <MultiSelect<number>
                label="Tedarikçiler"
                placeholder="Tedarikçi seçin"
                options={getSupplierOptions(index)}
                value={item.potentialSupplierIds}
                onChange={(value) => updateItem(index, 'potentialSupplierIds', value)}
                searchable
              />

              <NumberInput
                label="Miktar"
                required
                value={item.quantity}
                onChangeValue={(value) => updateItem(index, 'quantity', value ?? 1)}
                min={1}
              />

              <DateTimeField
                label="Tahmini Teslimat"
                required
                mode="date"
                value={parseOptionalDate(item.estimatedDeliveryDate)}
                onChange={(date) =>
                  updateItem(index, 'estimatedDeliveryDate', date ? toLocalDateTime(date) : '')
                }
                minimumDate={new Date()}
                placeholder="Teslimat tarihi seçin"
              />

              <TextArea
                label="Notlar"
                placeholder="Ek notlar"
                value={item.notes}
                onChangeText={(value) => updateItem(index, 'notes', value)}
                numberOfLines={2}
              />

              <Input
                label="Ürün Linki"
                placeholder="https://example.com/product"
                value={item.productLink}
                onChangeText={(value) => updateItem(index, 'productLink', value)}
                keyboardType="url"
                autoCapitalize="none"
              />
            </Card>
          ))}
        </Card>

        <View style={styles.buttonContainer}>
          <Button title="İptal" onPress={() => onCancel?.()} variant="outline" style={styles.cancelButton} />
          <Button
            title="Güncelle"
            onPress={() => void handleSubmit()}
            loading={isSubmitting}
            disabled={isSubmitting || loadingMeta}
            style={styles.submitButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 20 },
  sectionCard: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  itemCard: { marginBottom: 16 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(219, 0, 50, 0.08)',
  },
  supplierToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  supplierLabel: { fontSize: 14, fontWeight: '500', flex: 1 },
  buttonContainer: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  cancelButton: { flex: 1 },
  submitButton: { flex: 2 },
});
