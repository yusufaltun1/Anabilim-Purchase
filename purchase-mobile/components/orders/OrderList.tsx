import { EmptyState, Loading, Select, Text } from '@/components/ui';
import { ORDER_STATUS_FILTERS } from '@/domain/orders/orderStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/contexts/AuthContext';
import {
  purchaseOrderService,
  type PurchaseOrder,
} from '@/services/api/purchase-order.service';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { OrderListItem } from './OrderListItem';

export type OrderListProps = {
  onNav?: (id: number) => void;
  enableStockEntry?: boolean;
  onStockEntry?: (order: PurchaseOrder) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  ListHeaderComponent?: React.ReactElement | null;
  /** Değişince liste yeniden yüklenir */
  refreshKey?: number;
  onOrdersChange?: (orders: PurchaseOrder[]) => void;
  /** Filtre varsayılanı */
  initialStatus?: string;
};

export function OrderList({
  onNav,
  enableStockEntry = false,
  onStockEntry,
  emptyTitle = 'Sipariş bulunamadı',
  emptyDescription = 'Henüz sipariş kaydı yok',
  ListHeaderComponent,
  refreshKey = 0,
  onOrdersChange,
  initialStatus = 'ALL',
}: OrderListProps) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await purchaseOrderService.getOrdersByStatus(statusFilter, token);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
      setError('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  useEffect(() => {
    onOrdersChange?.(orders);
  }, [orders, onOrdersChange]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterHeader = (
    <View style={{ marginBottom: spacing.md }}>
      <Select
        label="Durum filtresi"
        options={ORDER_STATUS_FILTERS.map((f) => ({ label: f.label, value: f.value }))}
        value={statusFilter}
        onChange={(v) => setStatusFilter(v ?? 'ALL')}
        searchable={false}
        clearable={false}
        containerStyle={{ marginBottom: 0 }}
      />
    </View>
  );

  const combinedHeader = (
    <View>
      {ListHeaderComponent}
      {filterHeader}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {combinedHeader}
        <Loading fullScreen label="Siparişler yükleniyor…" />
      </View>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <View style={{ flex: 1, padding: spacing.lg }}>
        {combinedHeader}
        <EmptyState
          title={error ? 'Yükleme başarısız' : emptyTitle}
          description={error ?? emptyDescription}
          icon={error ? 'cloud-offline-outline' : 'cube-outline'}
          actionTitle={error ? 'Tekrar dene' : undefined}
          onAction={error ? () => void loadData() : undefined}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => `order-${item.id}`}
      renderItem={({ item }) => (
        <OrderListItem
          order={item}
          onPress={onNav ? () => onNav(item.id) : undefined}
          showStockEntry={enableStockEntry}
          onStockEntry={onStockEntry}
        />
      )}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
      }}
      ListHeaderComponent={<View style={{ marginBottom: spacing.md }}>{combinedHeader}</View>}
      ListFooterComponent={
        orders.length > 0 ? (
          <Text variant="caption" center style={{ marginTop: spacing.sm }}>
            {orders.length} sipariş
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
