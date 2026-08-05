import { Checkbox, EmptyState, Loading, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { isWarehouseActive } from '@/domain/sitemap/warehouseLabels';
import { useAppTheme } from '@/hooks/useAppTheme';
import { warehouseService, type Warehouse } from '@/services/api/warehouse.service';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { WarehouseListItem } from './WarehouseListItem';

export type WarehouseListProps = {
  onPress?: (warehouse: Warehouse) => void;
  onCreate?: () => void;
  refreshKey?: number;
  ListHeaderComponent?: React.ReactElement | null;
};

export function WarehouseList({
  onPress,
  onCreate,
  refreshKey = 0,
  ListHeaderComponent,
}: WarehouseListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setWarehouses([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await warehouseService.getWarehouses(token);
      setWarehouses(data);
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
      setWarehouses([]);
      setError('Depolar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const filtered = useMemo(() => {
    if (showInactive) return warehouses;
    return warehouses.filter((w) => isWarehouseActive(w));
  }, [warehouses, showInactive]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleStatus = (warehouse: Warehouse) => {
    const active = isWarehouseActive(warehouse);
    Alert.alert(
      active ? 'Pasife al' : 'Aktife al',
      `"${warehouse.name}" ${active ? 'pasife' : 'aktife'} alınacak.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => {
            void (async () => {
              if (!token) return;
              setTogglingId(warehouse.id);
              try {
                const updated = await warehouseService.updateWarehouseStatus(warehouse.id, token);
                setWarehouses((prev) =>
                  prev.map((w) => (w.id === warehouse.id ? updated : w))
                );
              } catch (err: unknown) {
                const message =
                  err instanceof Error ? err.message : 'Depo durumu değiştirilemedi';
                Alert.alert('Hata', message);
              } finally {
                setTogglingId(null);
              }
            })();
          },
        },
      ]
    );
  };

  const filterHeader = (
    <View style={{ marginBottom: spacing.md }}>
      {ListHeaderComponent}
      <Checkbox
        label="Pasif depoları göster"
        checked={showInactive}
        onChange={setShowInactive}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {filterHeader}
        <Loading fullScreen label="Depolar yükleniyor…" />
      </View>
    );
  }

  if (!loading && filtered.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {filterHeader}
        <EmptyState
          title={error ? 'Yükleme başarısız' : showInactive ? 'Depo yok' : 'Aktif depo yok'}
          description={
            error ??
            (showInactive
              ? 'Henüz depo kaydı bulunmuyor'
              : 'Aktif depo yok. Pasif depoları göstermek için kutuyu işaretleyin.')
          }
          icon={error ? 'cloud-offline-outline' : 'storefront-outline'}
          actionTitle={error ? 'Tekrar dene' : onCreate ? 'Yeni depo' : undefined}
          onAction={error ? () => void loadData() : onCreate}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => `warehouse-${item.id}`}
      renderItem={({ item }) => (
        <WarehouseListItem
          warehouse={item}
          onPress={onPress ? () => onPress(item) : undefined}
          onToggleStatus={() => handleToggleStatus(item)}
          statusLoading={togglingId === item.id}
        />
      )}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
      }}
      ListHeaderComponent={filterHeader}
      ListFooterComponent={
        filtered.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {filtered.length} depo
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
