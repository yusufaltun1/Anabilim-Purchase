import { AccessDenied } from '@/components/auth/AccessDenied';
import { OrderList, StockEntrySheet } from '@/components/orders';
import { Screen, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import type { PurchaseOrder } from '@/services/api/purchase-order.service';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

export default function PurchaseOrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { canOrderCreate, canInventoryManage } = useCapabilities();
  const [stockOrder, setStockOrder] = useState<PurchaseOrder | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const canStock = canOrderCreate || canInventoryManage;

  if (!isAuthenticated) {
    return (
      <>
        <Stack.Screen options={{ title: 'Siparişler', headerShown: false }} />
        <AccessDenied description="Siparişleri görüntülemek için giriş yapmalısınız." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Siparişler', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Siparişler" subtitle="Satın alma siparişleri" />
        </View>
        <OrderList
          onNav={(id) => router.push(`/purchase-order-detail/${id}`)}
          enableStockEntry={canStock}
          onStockEntry={canStock ? (order) => setStockOrder(order) : undefined}
          refreshKey={refreshKey}
        />
      </Screen>
      <StockEntrySheet
        visible={!!stockOrder}
        order={stockOrder}
        onClose={() => setStockOrder(null)}
        onSuccess={() => {
          setStockOrder(null);
          setRefreshKey((k) => k + 1);
        }}
      />
    </>
  );
}
