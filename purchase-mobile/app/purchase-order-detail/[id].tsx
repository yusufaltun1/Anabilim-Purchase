import {
  OrderHeaderCard,
  OrderInfoSections,
  OrderStatusActions,
  StockEntrySheet,
} from '@/components/orders';
import { ErrorBanner, Loading, Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  purchaseOrderService,
  type PurchaseOrder,
} from '@/services/api/purchase-order.service';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';

export default function PurchaseOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { canOrderCreate, canInventoryManage } = useCapabilities();
  const { colors, spacing } = useAppTheme();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [stockVisible, setStockVisible] = useState(false);

  const canStock = canOrderCreate || canInventoryManage;
  const orderId = Number(id);

  const loadOrder = useCallback(async () => {
    if (!token || !orderId || Number.isNaN(orderId)) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await purchaseOrderService.getOrderById(orderId, token);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err instanceof Error ? err.message : 'Sipariş yüklenemedi');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [token, orderId]);

  useEffect(() => {
    setLoading(true);
    void loadOrder();
  }, [loadOrder]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrder();
    setRefreshing(false);
  };

  const handleTransition = (nextStatus: string, label: string) => {
    if (!token || !order) return;
    Alert.alert('Durum güncelle', `Siparişi "${label}" olarak işaretlemek istiyor musunuz?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Onayla',
        onPress: () => {
          void (async () => {
            try {
              setStatusLoading(true);
              await purchaseOrderService.updateOrderStatus(
                order.id,
                { status: nextStatus, comment: label },
                token
              );
              await loadOrder();
            } catch (err) {
              Alert.alert(
                'Hata',
                err instanceof Error ? err.message : 'Durum güncellenemedi'
              );
            } finally {
              setStatusLoading(false);
            }
          })();
        },
      },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <>
        <Stack.Screen options={{ title: 'Sipariş Detayı', headerShown: false }} />
        <Loading fullScreen label="Sipariş yükleniyor…" />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Sipariş Detayı', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <ScreenHeader
            title="Sipariş detayı"
            subtitle={order?.orderCode || (orderId ? `#${orderId}` : undefined)}
          />
          {error ? <ErrorBanner message={error} onRetry={() => void loadOrder()} /> : null}
          {order ? (
            <View>
              <OrderHeaderCard order={order} />
              <OrderInfoSections order={order} />
              <OrderStatusActions
                status={order.status}
                loading={statusLoading}
                onTransition={handleTransition}
                showStockEntry={canStock}
                onStockEntry={canStock ? () => setStockVisible(true) : undefined}
              />
            </View>
          ) : !error ? (
            <ErrorBanner message="Sipariş bulunamadı" />
          ) : null}
        </ScrollView>
      </Screen>
      <StockEntrySheet
        visible={stockVisible}
        order={order}
        onClose={() => setStockVisible(false)}
        onSuccess={() => {
          setStockVisible(false);
          void loadOrder();
        }}
      />
    </>
  );
}
