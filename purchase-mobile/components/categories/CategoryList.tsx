import { Checkbox, EmptyState, Input, Loading, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { categoryService } from '@/services/api/category.service';
import type { Category } from '@/services/types/category.types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { CategoryListItem } from './CategoryListItem';

export type CategoryListProps = {
  onPress?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onCreate?: () => void;
  canManage?: boolean;
  refreshKey?: number;
};

export function CategoryList({
  onPress,
  onEdit,
  onCreate,
  canManage = false,
  refreshKey = 0,
}: CategoryListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setCategories([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (searchQuery.trim()) {
        const data = await categoryService.searchCategories(searchQuery.trim(), token);
        setCategories(data);
      } else if (showActiveOnly) {
        setCategories(await categoryService.getActiveCategories(token));
      } else {
        setCategories(await categoryService.getAllCategories(token));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
      setError('Kategoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [token, showActiveOnly, searchQuery]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q || searchQuery.trim()) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || (c.code ?? '').toLowerCase().includes(q)
    );
  }, [categories, searchTerm, searchQuery]);

  const handleSearchSubmit = () => {
    setSearchQuery(searchTerm);
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Kategoriyi sil',
      `"${category.name}" silinecek. Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              if (!token) return;
              try {
                await categoryService.deleteCategory(category.id, token);
                setCategories((prev) => prev.filter((c) => c.id !== category.id));
              } catch (err: unknown) {
                const message =
                  err instanceof Error ? err.message : 'Kategori silinirken bir hata oluştu';
                Alert.alert('Hata', message);
              }
            })();
          },
        },
      ]
    );
  };

  const header = (
    <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
      <Input
        placeholder="Kategori ara…"
        value={searchTerm}
        onChangeText={(text) => {
          setSearchTerm(text);
          if (!text.trim()) setSearchQuery('');
        }}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />
      <Checkbox
        label="Sadece aktif"
        checked={showActiveOnly}
        onChange={(checked) => {
          setShowActiveOnly(checked);
          setSearchQuery('');
        }}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {header}
        <Loading fullScreen label="Kategoriler yükleniyor…" />
      </View>
    );
  }

  if (!loading && filtered.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {header}
        <EmptyState
          title={error ? 'Yükleme başarısız' : 'Kategori yok'}
          description={error ?? 'Henüz kategori kaydı bulunmuyor'}
          icon={error ? 'cloud-offline-outline' : 'folder-outline'}
          actionTitle={error ? 'Tekrar dene' : onCreate ? 'Yeni kategori' : undefined}
          onAction={error ? () => void loadData() : onCreate}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => `category-${item.id}`}
      renderItem={({ item }) => (
        <CategoryListItem
          category={item}
          onPress={onPress ? () => onPress(item) : undefined}
          onEdit={canManage && onEdit ? () => onEdit(item) : undefined}
          onDelete={canManage ? () => handleDelete(item) : undefined}
        />
      )}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
      }}
      ListHeaderComponent={<View style={{ marginBottom: spacing.sm }}>{header}</View>}
      ListFooterComponent={
        filtered.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {filtered.length} kategori
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
