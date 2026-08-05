import { AccessDenied } from '@/components/auth/AccessDenied';
import { AccountingSummaryCards, OrderList } from '@/components/orders';
import { Screen, ScreenHeader } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import type { PurchaseOrder } from '@/services/api/purchase-order.service';
import { Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

export default function AccountingScreen() {
  const { canAccountingView } = useCapabilities();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  const handleOrdersChange = useCallback((list: PurchaseOrder[]) => {
    setOrders(list);
  }, []);

  if (!canAccountingView) {
    return (
      <>
        <Stack.Screen options={{ title: 'Muhasebe', headerShown: false }} />
        <AccessDenied description="Muhasebe sipariş listesini görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Muhasebe', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Muhasebe" subtitle="Siparişlerin finansal özeti" />
        </View>
        <OrderList
          enableStockEntry={false}
          onOrdersChange={handleOrdersChange}
          emptyTitle="Sipariş bulunamadı"
          emptyDescription="Muhasebe için listelenecek sipariş yok"
          ListHeaderComponent={<AccountingSummaryCards orders={orders} />}
        />
      </Screen>
    </>
  );
}
