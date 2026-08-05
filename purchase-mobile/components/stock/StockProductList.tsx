import { EmptyState, Loading, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { warehouseService } from '@/services/api/warehouse.service';
import type { ProductStockSummary } from '@/services/types/product.types';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { StockProductListItem } from './StockProductListItem';

const PAGE_SIZE = 20;

export type StockProductListProps = {
  onPress?: (stock: ProductStockSummary) => void;
  refreshKey?: number;
};

export function StockProductList({ onPress, refreshKey = 0 }: StockProductListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [items, setItems] = useState<ProductStockSummary[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (!token) {
        setLoading(false);
        setItems([]);
        return;
      }
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await warehouseService.getProductStocksList(pageNum, PAGE_SIZE, token);
        setItems((prev) => (append ? [...prev, ...res.content] : res.content));
        setPage(pageNum);
        setLast(Boolean(res.last ?? res.content.length < PAGE_SIZE));
      } catch (err) {
        console.error('Stock list failed:', err);
        if (!append) setItems([]);
        setError('Stok listesi yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void loadPage(0, false);
  }, [loadPage, refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPage(0, false);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (loading || loadingMore || last) return;
    void loadPage(page + 1, true);
  };

  if (loading && !refreshing && items.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        <Loading fullScreen label="Stoklar yükleniyor…" />
      </View>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        <EmptyState
          title={error ? 'Yükleme başarısız' : 'Stok yok'}
          description={error ?? 'Henüz stok kaydı bulunmuyor'}
          icon={error ? 'cloud-offline-outline' : 'layers-outline'}
          actionTitle={error ? 'Tekrar dene' : undefined}
          onAction={error ? () => void loadPage(0, false) : undefined}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => `stock-product-${item.id}`}
      renderItem={({ item }) => (
        <StockProductListItem
          stock={item}
          onPress={onPress ? () => onPress(item) : undefined}
        />
      )}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
      }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMore ? (
          <ActivityIndicator style={{ marginVertical: spacing.md }} color={colors.primary} />
        ) : items.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {items.length} ürün{last ? '' : ' · daha fazla yüklemek için kaydırın'}
          </Text>
        ) : null
      }
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    />
  );
}
