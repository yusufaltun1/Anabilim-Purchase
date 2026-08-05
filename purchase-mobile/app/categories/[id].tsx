import { AccessDenied } from '@/components/auth/AccessDenied';
import { CategoryStatusBadge } from '@/components/categories';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  Loading,
  Screen,
  ScreenHeader,
  Section,
  Text,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCategoryProductTypeLabel,
  isFixedAssetCategoryType,
} from '@/domain/stockroom/categoryLabels';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCapabilities } from '@/hooks/useCapabilities';
import { categoryService } from '@/services/api/category.service';
import {
  getUnitOfMeasureLabel,
  type CategoryDetail,
  type CategoryStockItem,
  type CategoryWarehouseStock,
} from '@/services/types/category.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const { canInventoryView, canInventoryManage } = useCapabilities();
  const [detail, setDetail] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await categoryService.getCategoryDetail(Number(id), token);
      setDetail(data);
    } catch (err: unknown) {
      setDetail(null);
      setError(err instanceof Error ? err.message : 'Kategori detayı yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    setLoading(true);
    void loadDetail();
  }, [loadDetail]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDetail();
    setRefreshing(false);
  };

  if (!canInventoryView) {
    return (
      <>
        <Stack.Screen options={{ title: 'Kategori Detayı', headerShown: false }} />
        <AccessDenied description="Kategori detayını görüntüleme yetkiniz bulunmuyor." />
      </>
    );
  }

  if (loading && !detail) {
    return (
      <>
        <Stack.Screen options={{ title: 'Kategori Detayı', headerShown: false }} />
        <Screen padded={false} edges={['top', 'left', 'right']}>
          <Loading fullScreen label="Kategori yükleniyor…" />
        </Screen>
      </>
    );
  }

  if (!detail) {
    return (
      <>
        <Stack.Screen options={{ title: 'Kategori Detayı', headerShown: false }} />
        <Screen edges={['top', 'left', 'right']}>
          <EmptyState
            title="Kategori bulunamadı"
            description={error ?? 'Bu kategori yüklenemedi'}
            icon="folder-outline"
            actionTitle="Geri dön"
            onAction={() => router.replace('/categories')}
          />
        </Screen>
      </>
    );
  }

  const lowStock =
    detail.minStockNotifyAt != null &&
    (detail.availableQuantity ?? 0) <= detail.minStockNotifyAt;
  const showWarehouse = !isFixedAssetCategoryType(detail.productType);
  const stockItems = detail.stockItems ?? [];
  const warehouses = detail.warehouseBreakdown ?? [];

  return (
    <>
      <Stack.Screen options={{ title: detail.name, headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: spacing['3xl'],
            gap: spacing.md,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            title={detail.name}
            subtitle={[detail.code, getCategoryProductTypeLabel(detail.productType)]
              .filter(Boolean)
              .join(' · ')}
          />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' }}>
            <CategoryStatusBadge isActive={detail.isActive} />
            {detail.requestable ? <Chip label="Talep edilebilir" selected disabled /> : null}
          </View>

          {detail.requestable ? (
            <Text variant="caption" color={colors.textMuted}>
              bilgiislem@anabilim.k12.tr
            </Text>
          ) : null}

          {lowStock ? (
            <Card>
              <Text variant="bodyStrong" color={colors.error}>
                Düşük stok
              </Text>
              <Text variant="caption" style={{ marginTop: spacing.xs }}>
                Kalan {detail.availableQuantity ?? 0}, bildirim eşiği {detail.minStockNotifyAt}
              </Text>
            </Card>
          ) : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <KpiCard label="Ürün" value={detail.activeProductCount ?? stockItems.length} />
            <KpiCard label="Toplam" value={detail.totalQuantity ?? 0} />
            <KpiCard label="Atanan" value={detail.assignedQuantity ?? 0} />
            <KpiCard
              label="Kalan"
              value={detail.availableQuantity ?? 0}
              valueColor={lowStock ? colors.error : undefined}
            />
          </View>

          <Section title="Stok varsayılanları">
            <Card>
              <InfoRow label="Ölçü birimi" value={getUnitOfMeasureLabel(detail.unitOfMeasure)} />
              <InfoRow label="Min. miktar" value={String(detail.minQuantity ?? 1)} />
              <InfoRow label="Max. miktar" value={String(detail.maxQuantity ?? 100)} />
              <InfoRow label="Para birimi" value={detail.currency ?? 'TRY'} />
            </Card>
          </Section>

          {detail.description ? (
            <Section title="Açıklama">
              <Card>
                <Text variant="body">{detail.description}</Text>
              </Card>
            </Section>
          ) : null}

          <Section title="Ürünler / stok kalemleri">
            {stockItems.length === 0 ? (
              <Card>
                <Text variant="caption" color={colors.textMuted}>
                  Bu kategoride stok kalemi bulunmuyor. Ürün listesi için web panelini kullanabilirsiniz.
                </Text>
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {stockItems.map((item) => (
                  <StockItemCard key={item.id} item={item} />
                ))}
              </View>
            )}
          </Section>

          {showWarehouse ? (
            <Section title="Depo özeti">
              {warehouses.length === 0 ? (
                <Card>
                  <Text variant="caption" color={colors.textMuted}>
                    Depo stok bilgisi yok.
                  </Text>
                </Card>
              ) : (
                <View style={{ gap: spacing.sm }}>
                  {warehouses.map((row) => (
                    <WarehouseCard key={row.warehouseId} row={row} />
                  ))}
                </View>
              )}
            </Section>
          ) : null}

          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
            {canInventoryManage ? (
              <>
                <Button
                  title="Düzenle"
                  variant="outline"
                  style={{ flex: 1 }}
                  onPress={() => router.push(`/categories/edit/${detail.id}`)}
                />
                <Button
                  title="Yeni ürün"
                  style={{ flex: 1 }}
                  onPress={() => router.push('/create-product')}
                />
              </>
            ) : (
              <Button
                title="Düzenle"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => router.push(`/categories/edit/${detail.id}`)}
              />
            )}
          </View>
        </ScrollView>
      </Screen>
    </>
  );
}

function KpiCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: number;
  valueColor?: string;
}) {
  const { spacing } = useAppTheme();
  return (
    <Card style={{ width: '48%', flexGrow: 1, minWidth: 140 }}>
      <Text variant="caption">{label}</Text>
      <Text variant="h3" color={valueColor} style={{ marginTop: spacing.xs }}>
        {value}
      </Text>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { spacing, colors } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
        paddingVertical: spacing.xs,
      }}
    >
      <Text variant="caption" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

function StockItemCard({ item }: { item: CategoryStockItem }) {
  const { spacing, colors } = useAppTheme();
  return (
    <Card>
      <Text variant="bodyStrong" numberOfLines={2}>
        {item.productName ?? `Ürün #${item.productId}`}
      </Text>
      <Text variant="caption" color={colors.textMuted} style={{ marginTop: spacing.xxs }}>
        {[item.productCode, item.serialNumber, item.status, item.warehouseName]
          .filter(Boolean)
          .join(' · ') || '—'}
      </Text>
    </Card>
  );
}

function WarehouseCard({ row }: { row: CategoryWarehouseStock }) {
  const { spacing } = useAppTheme();
  return (
    <Card>
      <Text variant="bodyStrong">{row.warehouseName}</Text>
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.lg,
          marginTop: spacing.sm,
        }}
      >
        <Metric label="Toplam" value={row.totalQuantity} />
        <Metric label="Atanan" value={row.assignedQuantity} />
        <Metric label="Kalan" value={row.availableQuantity} />
      </View>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View>
      <Text variant="caption">{label}</Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}
