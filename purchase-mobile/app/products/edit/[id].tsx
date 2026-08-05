import { AccessDenied } from '@/components/auth/AccessDenied';
import { ProductForm } from '@/components/products';
import { Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { productService } from '@/services/api/product.service';
import {
  formToUpdateRequest,
  productToForm,
  type Product,
  type ProductFormValues,
} from '@/services/types/product.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

export default function ProductEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { canInventoryManage } = useCapabilities();
  const [product, setProduct] = useState<Product | null>(null);
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
        const data = await productService.getProductById(Number(id), token);
        if (!cancelled) setProduct(data);
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          Alert.alert('Hata', err instanceof Error ? err.message : 'Ürün yüklenemedi', [
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
        <Stack.Screen options={{ title: 'Ürün Düzenle', headerShown: false }} />
        <AccessDenied description="Ürün düzenleme yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: ProductFormValues) => {
    if (!token || !product) return;
    setSaving(true);
    try {
      await productService.updateProduct(product.id, formToUpdateRequest(values), token);
      router.replace('/products');
    } catch (err: unknown) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Ürün güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Ürün Düzenle', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Ürün düzenle"
            subtitle={product?.name ?? 'Ürün bilgilerini güncelleyin'}
          />
        </View>
        {loading || !product ? (
          <Loading fullScreen label="Ürün yükleniyor…" />
        ) : (
          <ProductForm
            mode="edit"
            initialValues={productToForm(product)}
            loading={saving}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </Screen>
    </>
  );
}
