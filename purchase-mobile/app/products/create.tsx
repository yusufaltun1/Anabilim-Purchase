import { AccessDenied } from '@/components/auth/AccessDenied';
import { ProductForm } from '@/components/products';
import { Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { productService } from '@/services/api/product.service';
import {
  emptyProductForm,
  formToCreateRequest,
  productToForm,
  type ProductFormValues,
} from '@/services/types/product.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

export default function ProductCreateScreen() {
  const router = useRouter();
  const { cloneFrom } = useLocalSearchParams<{ cloneFrom?: string }>();
  const { token } = useAuth();
  const { canInventoryManage } = useCapabilities();
  const [loading, setLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(Boolean(cloneFrom));
  const [initialValues, setInitialValues] = useState<Partial<ProductFormValues> | undefined>();

  useEffect(() => {
    if (!token || !cloneFrom || !canInventoryManage) {
      setBootstrapLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setBootstrapLoading(true);
        const product = await productService.getProductById(Number(cloneFrom), token);
        if (cancelled) return;
        const form = productToForm(product);
        setInitialValues({
          ...form,
          name: `${form.name} (Kopya)`.trim(),
          code: '',
          serialNumber: '',
        });
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          Alert.alert('Hata', 'Kopyalanacak ürün yüklenemedi');
          setInitialValues(emptyProductForm());
        }
      } finally {
        if (!cancelled) setBootstrapLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, cloneFrom, canInventoryManage]);

  if (!canInventoryManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Yeni Ürün', headerShown: false }} />
        <AccessDenied description="Yeni ürün oluşturma yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async (values: ProductFormValues) => {
    if (!token) return;
    setLoading(true);
    try {
      await productService.createProduct(formToCreateRequest(values), token);
      router.replace('/products');
    } catch (err: unknown) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Ürün oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Yeni Ürün', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Yeni ürün"
            subtitle={cloneFrom ? 'Üründen kopyala' : 'Ürün bilgilerini girin'}
          />
        </View>
        {bootstrapLoading ? (
          <Loading fullScreen label="Ürün yükleniyor…" />
        ) : (
          <ProductForm
            mode="create"
            initialValues={initialValues}
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        )}
      </Screen>
    </>
  );
}
