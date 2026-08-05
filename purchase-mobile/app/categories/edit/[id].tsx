import { AccessDenied } from '@/components/auth/AccessDenied';
import { CategoryForm } from '@/components/categories';
import { Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { categoryService } from '@/services/api/category.service';
import {
  categoryToForm,
  DEFAULT_CATEGORY_STOCK,
  type Category,
  type CategoryFormValues,
} from '@/services/types/category.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

export default function CategoryEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { canInventoryManage } = useCapabilities();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !id || !canInventoryManage) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await categoryService.getCategoryById(Number(id), token);
        if (!cancelled) setCategory(data);
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          Alert.alert('Hata', err instanceof Error ? err.message : 'Kategori yüklenemedi', [
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
  }, [token, id, canInventoryManage, router]);

  if (!canInventoryManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Kategori Düzenle', headerShown: false }} />
        <AccessDenied description="Kategori düzenleme yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: CategoryFormValues) => {
    if (!token || !category) return;
    setSaving(true);
    try {
      await categoryService.updateCategory(
        category.id,
        {
          name: values.name,
          description: values.description,
          productType: values.productType,
          minStockNotifyAt: values.minStockNotifyAt,
          requestable: values.requestable,
          unitOfMeasure: values.unitOfMeasure || DEFAULT_CATEGORY_STOCK.unitOfMeasure,
          minQuantity: values.minQuantity ?? DEFAULT_CATEGORY_STOCK.minQuantity,
          maxQuantity: values.maxQuantity ?? DEFAULT_CATEGORY_STOCK.maxQuantity,
          currency: values.currency || DEFAULT_CATEGORY_STOCK.currency,
          isActive: values.isActive,
        },
        token
      );
      router.replace(`/categories/${category.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kategori güncellenemedi';
      Alert.alert('Hata', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Kategori Düzenle', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Kategori düzenle"
            subtitle={category?.name ?? 'Kategori bilgilerini güncelleyin'}
          />
        </View>
        {loading || !category ? (
          <Loading fullScreen label="Kategori yükleniyor…" />
        ) : (
          <CategoryForm
            mode="edit"
            initialValues={categoryToForm(category)}
            loading={saving}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </Screen>
    </>
  );
}
