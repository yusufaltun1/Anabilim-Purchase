import { EmptyState, Input, Loading, Select, Text } from '@/components/ui';
import {
  emptyProductListFilters,
  filterProducts,
  type ProductListFilters,
} from '@/domain/stockroom/productFilters';
import { PRODUCT_TYPE_OPTIONS } from '@/domain/stockroom/productLabels';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCapabilities } from '@/hooks/useCapabilities';
import { categoryService } from '@/services/api/category.service';
import { productService } from '@/services/api/product.service';
import type { Product } from '@/services/types/product.types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { ProductListItem } from './ProductListItem';

export type ProductListProps = {
  onPress?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onClone?: (product: Product) => void;
  onCreate?: () => void;
  refreshKey?: number;
};

export function ProductList({
  onPress,
  onEdit,
  onClone,
  onCreate,
  refreshKey = 0,
}: ProductListProps) {
  const { token } = useAuth();
  const { canInventoryManage } = useCapabilities();
  const { colors, spacing } = useAppTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductListFilters>(emptyProductListFilters);
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: number }[]>([]);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setProducts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [list, cats] = await Promise.all([
        productService.getAllProducts(token),
        categoryService.getActiveCategories(token).catch(() => []),
      ]);
      setProducts(list);
      setCategoryOptions(cats.map((c) => ({ label: c.name, value: c.id })));
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
      setError('Ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const filtered = useMemo(() => filterProducts(products, filters), [products, filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = (product: Product) => {
    Alert.alert('Ürünü sil', `"${product.name}" silinecek. Bu işlem geri alınamaz.`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (!token) return;
            try {
              await productService.deleteProduct(product.id, token);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch (err: unknown) {
              Alert.alert(
                'Hata',
                err instanceof Error ? err.message : 'Ürün silinirken bir hata oluştu'
              );
            }
          })();
        },
      },
    ]);
  };

  const filterHeader = (
    <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
      <Input
        placeholder="Ad veya kod ara…"
        value={filters.search}
        onChangeText={(search) => setFilters((f) => ({ ...f, search }))}
        autoCorrect={false}
      />
      <Select
        label="Kategori"
        placeholder="Tüm kategoriler"
        options={categoryOptions}
        value={filters.categoryId}
        onChange={(categoryId) => setFilters((f) => ({ ...f, categoryId }))}
        clearable
      />
      <Select
        label="Ürün tipi"
        placeholder="Tüm tipler"
        options={PRODUCT_TYPE_OPTIONS}
        value={filters.productType}
        onChange={(productType) => setFilters((f) => ({ ...f, productType }))}
        clearable
      />
      <Select
        label="Durum"
        placeholder="Tümü"
        options={[
          { label: 'Aktif', value: 'active' },
          { label: 'Pasif', value: 'passive' },
        ]}
        value={
          filters.isActive === null ? null : filters.isActive ? 'active' : 'passive'
        }
        onChange={(v) =>
          setFilters((f) => ({
            ...f,
            isActive: v === null ? null : v === 'active',
          }))
        }
        clearable
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {filterHeader}
        <Loading fullScreen label="Ürünler yükleniyor…" />
      </View>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {filterHeader}
        <EmptyState
          title={error ? 'Yükleme başarısız' : 'Ürün yok'}
          description={error ?? 'Henüz ürün kaydı bulunmuyor'}
          icon={error ? 'cloud-offline-outline' : 'cube-outline'}
          actionTitle={error ? 'Tekrar dene' : onCreate && canInventoryManage ? 'Yeni ürün' : undefined}
          onAction={error ? () => void loadData() : onCreate}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => `product-${item.id}`}
      renderItem={({ item }) => (
        <ProductListItem
          product={item}
          canManage={canInventoryManage}
          onPress={onPress ? () => onPress(item) : undefined}
          onEdit={onEdit && canInventoryManage ? () => onEdit(item) : undefined}
          onClone={onClone && canInventoryManage ? () => onClone(item) : undefined}
          onDelete={canInventoryManage ? () => handleDelete(item) : undefined}
        />
      )}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
      }}
      ListHeaderComponent={filterHeader}
      ListEmptyComponent={
        <EmptyState
          title="Sonuç yok"
          description="Filtrelere uyan ürün bulunamadı"
          icon="search-outline"
        />
      }
      ListFooterComponent={
        filtered.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {filtered.length} / {products.length} ürün
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
