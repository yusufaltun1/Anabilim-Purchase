import { AccessDenied } from '@/components/auth/AccessDenied';
import { ProductList } from '@/components/products';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function ProductsScreen() {
  const router = useRouter();
  const { canInventoryView, canInventoryManage } = useCapabilities();

  if (!canInventoryView) {
    return (
      <>
        <Stack.Screen options={{ title: 'Ürünler', headerShown: false }} />
        <AccessDenied description="Ürün listesini görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Ürünler', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Ürünler"
            subtitle="Ürün kataloğu"
            right={
              canInventoryManage ? (
                <IconButton
                  name="add"
                  onPress={() => router.push('/products/create')}
                  accessibilityLabel="Yeni ürün"
                />
              ) : undefined
            }
          />
        </View>
        <ProductList
          onCreate={canInventoryManage ? () => router.push('/products/create') : undefined}
          onPress={(p) => router.push(`/product-detail/${p.id}`)}
          onEdit={
            canInventoryManage ? (p) => router.push(`/products/edit/${p.id}`) : undefined
          }
          onClone={
            canInventoryManage
              ? (p) => router.push(`/products/create?cloneFrom=${p.id}`)
              : undefined
          }
        />
      </Screen>
    </>
  );
}
