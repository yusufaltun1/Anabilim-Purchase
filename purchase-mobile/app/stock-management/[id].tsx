import { AccessDenied } from '@/components/auth/AccessDenied';
import { StockDetailSections } from '@/components/stock';
import { Button, Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCapabilities } from '@/hooks/useCapabilities';
import { productService } from '@/services/api/product.service';
import type { ProductStockDetail } from '@/services/types/product.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';

export default function StockDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const { canInventoryView, canInventoryManage } = useCapabilities();
  const { colors, spacing } = useAppTheme();
  const [detail, setDetail] = useState<ProductStockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await productService.getProductStockDetail(Number(id), token);
      setDetail(data);
    } catch (err) {
      console.error(err);
      setDetail(null);
      Alert.alert('Hata', 'Stok detayı yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canInventoryView) {
    return (
      <>
        <Stack.Screen options={{ title: 'Stok Detayı', headerShown: false }} />
        <AccessDenied description="Stok detayını görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: detail?.product.name ?? 'Stok Detayı', headerShown: false }}
      />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title={detail?.product.name ?? 'Stok detayı'}
            subtitle={detail?.product.code}
          />
        </View>
        {loading && !detail ? (
          <Loading fullScreen label="Stok yükleniyor…" />
        ) : !detail ? (
          <View style={{ padding: spacing.lg }}>
            <Button title="Geri" onPress={() => router.back()} variant="outline" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  setRefreshing(true);
                  await load();
                  setRefreshing(false);
                }}
                tintColor={colors.primary}
              />
            }
          >
            <StockDetailSections detail={detail} />
            <View
              style={{
                paddingHorizontal: spacing.lg,
                paddingBottom: spacing['3xl'],
                gap: spacing.sm,
              }}
            >
              <Button
                title="Ürün detayına git"
                variant="outline"
                onPress={() => router.push(`/product-detail/${id}`)}
              />
              {canInventoryManage ? (
                <Button
                  title="Ürünü düzenle"
                  onPress={() => router.push(`/products/edit/${id}`)}
                />
              ) : null}
            </View>
          </ScrollView>
        )}
      </Screen>
    </>
  );
}
