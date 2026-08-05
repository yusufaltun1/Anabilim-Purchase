import { AccessDenied } from '@/components/auth/AccessDenied';
import { WarehouseStatusBadge, WarehouseStockList } from '@/components/warehouses';
import {
  Card,
  ErrorBanner,
  Loading,
  Screen,
  ScreenHeader,
  Section,
  Text,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { isWarehouseActive } from '@/domain/sitemap/warehouseLabels';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCapabilities } from '@/hooks/useCapabilities';
import {
  warehouseService,
  type Warehouse,
  type WarehouseStock,
} from '@/services/api/warehouse.service';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

export default function WarehouseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { canSystemManage, canQuoteCollect, canInventoryView } = useCapabilities();
  const canAccess = canSystemManage || canQuoteCollect || canInventoryView;
  const { colors, spacing } = useAppTheme();

  const warehouseId = Number(id);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [stocks, setStocks] = useState<WarehouseStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token || !warehouseId || Number.isNaN(warehouseId)) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const wh = await warehouseService.getWarehouseById(warehouseId, token);
      setWarehouse(wh);
      setStocksLoading(true);
      try {
        const stockList = await warehouseService.getWarehouseStocks(warehouseId, token);
        setStocks(stockList);
      } catch (stockErr) {
        console.error(stockErr);
        setStocks([]);
      } finally {
        setStocksLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Depo yüklenemedi');
      setWarehouse(null);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [token, warehouseId]);

  useEffect(() => {
    setLoading(true);
    void loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!canAccess) {
    return (
      <>
        <Stack.Screen options={{ title: 'Depo Detayı', headerShown: false }} />
        <AccessDenied description="Depo detayını görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: warehouse?.name ?? 'Depo Detayı', headerShown: false }}
      />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader
            title={warehouse?.name ?? 'Depo detayı'}
            subtitle={warehouse?.code}
          />
        </View>

        {loading && !warehouse ? (
          <Loading fullScreen label="Depo yükleniyor…" />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: spacing.lg,
              paddingTop: spacing.sm,
              paddingBottom: spacing['3xl'],
              gap: spacing.lg,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          >
            {error ? <ErrorBanner message={error} /> : null}

            {!warehouse && !error ? (
              <Card>
                <Text variant="bodyStrong" center>
                  Depo bulunamadı
                </Text>
              </Card>
            ) : null}

            {warehouse ? (
              <Card>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: spacing.md,
                  }}
                >
                  <Text variant="h3" style={{ flex: 1 }}>
                    Depo bilgileri
                  </Text>
                  <WarehouseStatusBadge isActive={isWarehouseActive(warehouse)} />
                </View>

                <View style={{ gap: spacing.md }}>
                  <InfoRow label="Kod" value={warehouse.code} />
                  <InfoRow label="Adres" value={warehouse.address} />
                  <InfoRow label="Depo sorumlusu" value={warehouse.managerName} />
                  <InfoRow label="Telefon" value={warehouse.phone} />
                  <InfoRow label="E-posta" value={warehouse.email} />
                </View>
              </Card>
            ) : null}

            {warehouse ? (
              <Section title="Stok bilgileri">
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    marginBottom: spacing.sm,
                    marginTop: -spacing.sm,
                  }}
                >
                  <Ionicons name="layers-outline" size={18} color={colors.primary} />
                  <Text variant="caption" color={colors.textSecondary}>
                    Depodaki ürün stokları
                  </Text>
                </View>
                <WarehouseStockList stocks={stocks} loading={stocksLoading} />
              </Section>
            ) : null}
          </ScrollView>
        )}
      </Screen>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  const { colors, spacing } = useAppTheme();
  return (
    <View style={{ gap: spacing.xxs }}>
      <Text variant="caption" color={colors.textSecondary}>
        {label}
      </Text>
      <Text variant="body">{value?.trim() ? value : '—'}</Text>
    </View>
  );
}
