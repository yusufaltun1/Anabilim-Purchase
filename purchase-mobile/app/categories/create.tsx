import { AccessDenied } from '@/components/auth/AccessDenied';
import { CategoryForm } from '@/components/categories';
import { Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { categoryService } from '@/services/api/category.service';
import {
  DEFAULT_CATEGORY_STOCK,
  type CategoryFormValues,
} from '@/services/types/category.types';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function CategoryCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { canInventoryManage } = useCapabilities();
  const [loading, setLoading] = useState(false);

  if (!canInventoryManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Kategori', headerShown: false }} />
        <AccessDenied description="Kategori oluşturma yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: CategoryFormValues) => {
    if (!token) return;
    setLoading(true);
    try {
      await categoryService.createCategory(
        {
          name: values.name,
          code: values.code,
          description: values.description,
          productType: values.productType,
          minStockNotifyAt: values.minStockNotifyAt,
          requestable: values.requestable,
          unitOfMeasure: values.unitOfMeasure || DEFAULT_CATEGORY_STOCK.unitOfMeasure,
          minQuantity: values.minQuantity ?? DEFAULT_CATEGORY_STOCK.minQuantity,
          maxQuantity: values.maxQuantity ?? DEFAULT_CATEGORY_STOCK.maxQuantity,
          currency: values.currency || DEFAULT_CATEGORY_STOCK.currency,
        },
        token
      );
      router.replace('/categories');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kategori oluşturulamadı';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Kategori', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Yeni kategori" subtitle="Stok varsayılanlarını tanımlayın" />
        </View>
        <CategoryForm
          mode="create"
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </Screen>
    </>
  );
}
