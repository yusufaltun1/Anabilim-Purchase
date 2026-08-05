import { AccessDenied } from '@/components/auth/AccessDenied';
import { CategoryList } from '@/components/categories';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function CategoriesScreen() {
  const router = useRouter();
  const { canInventoryView, canInventoryManage } = useCapabilities();

  if (!canInventoryView) {
    return (
      <>
        <Stack.Screen options={{ title: 'Kategoriler', headerShown: false }} />
        <AccessDenied description="Kategori listesini görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Kategoriler', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title="Kategoriler"
            subtitle="Stok odası kategori yönetimi"
            right={
              canInventoryManage ? (
                <IconButton
                  name="add"
                  onPress={() => router.push('/categories/create')}
                  accessibilityLabel="Yeni kategori"
                />
              ) : undefined
            }
          />
        </View>
        <CategoryList
          canManage={canInventoryManage}
          onCreate={canInventoryManage ? () => router.push('/categories/create') : undefined}
          onPress={(c) => router.push(`/categories/${c.id}`)}
          onEdit={
            canInventoryManage ? (c) => router.push(`/categories/edit/${c.id}`) : undefined
          }
        />
      </Screen>
    </>
  );
}
