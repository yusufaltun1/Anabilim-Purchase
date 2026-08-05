import { EmptyState, Loading, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { supplierService } from '@/services/api/supplier.service';
import type { Supplier } from '@/services/types/supplier.types';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { SupplierListItem } from './SupplierListItem';

export type SupplierListProps = {
  onPress?: (supplier: Supplier) => void;
  onEdit?: (supplier: Supplier) => void;
  onCreate?: () => void;
  refreshKey?: number;
  ListHeaderComponent?: React.ReactElement | null;
};

export function SupplierList({
  onPress,
  onEdit,
  onCreate,
  refreshKey = 0,
  ListHeaderComponent,
}: SupplierListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setSuppliers([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await supplierService.getAllSuppliers(token);
      setSuppliers(data);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
      setSuppliers([]);
      setError('Tedarikçiler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = (supplier: Supplier) => {
    Alert.alert(
      'Tedarikçiyi sil',
      `"${supplier.name}" silinecek. Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              if (!token) return;
              try {
                await supplierService.deleteSupplier(supplier.id, token);
                setSuppliers((prev) => prev.filter((s) => s.id !== supplier.id));
              } catch (err: unknown) {
                const message =
                  err instanceof Error ? err.message : 'Tedarikçi silinirken bir hata oluştu';
                Alert.alert('Hata', message);
              }
            })();
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {ListHeaderComponent}
        <Loading fullScreen label="Tedarikçiler yükleniyor…" />
      </View>
    );
  }

  if (!loading && suppliers.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {ListHeaderComponent}
        <EmptyState
          title={error ? 'Yükleme başarısız' : 'Tedarikçi yok'}
          description={error ?? 'Henüz tedarikçi kaydı bulunmuyor'}
          icon={error ? 'cloud-offline-outline' : 'business-outline'}
          actionTitle={error ? 'Tekrar dene' : onCreate ? 'Yeni tedarikçi' : undefined}
          onAction={error ? () => void loadData() : onCreate}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={suppliers}
      keyExtractor={(item) => `supplier-${item.id}`}
      renderItem={({ item }) => (
        <SupplierListItem
          supplier={item}
          onPress={onPress ? () => onPress(item) : onEdit ? () => onEdit(item) : undefined}
          onEdit={onEdit ? () => onEdit(item) : undefined}
          onDelete={() => handleDelete(item)}
        />
      )}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
      }}
      ListHeaderComponent={
        ListHeaderComponent ? (
          <View style={{ marginBottom: spacing.md }}>{ListHeaderComponent}</View>
        ) : null
      }
      ListFooterComponent={
        suppliers.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {suppliers.length} tedarikçi
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
