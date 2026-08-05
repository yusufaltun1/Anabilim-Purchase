import { BottomSheet, Button, Card, EmptyState, Loading, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import {
  formatWarehouseDate,
  formatWarehouseDateTime,
  getStockMovementTypeLabel,
} from '@/domain/sitemap/warehouseLabels';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  warehouseService,
  type WarehouseStock,
  type WarehouseStockMovement,
} from '@/services/api/warehouse.service';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export type WarehouseStockListProps = {
  stocks: WarehouseStock[];
  loading?: boolean;
};

export function WarehouseStockList({ stocks, loading = false }: WarehouseStockListProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();
  const [selectedStock, setSelectedStock] = useState<WarehouseStock | null>(null);
  const [movements, setMovements] = useState<WarehouseStockMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const loadMovements = useCallback(
    async (stock: WarehouseStock, pageIndex: number) => {
      if (!token) return;
      setMovementsLoading(true);
      try {
        const data = await warehouseService.getStockMovements(stock.id, token, pageIndex, pageSize);
        setMovements(data);
      } catch (err) {
        console.error(err);
        setMovements([]);
        Alert.alert(
          'Hata',
          err instanceof Error ? err.message : 'Stok hareketleri yüklenemedi'
        );
      } finally {
        setMovementsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (selectedStock) {
      void loadMovements(selectedStock, page);
    }
  }, [selectedStock, page, loadMovements]);

  const openMovements = (stock: WarehouseStock) => {
    setPage(0);
    setMovements([]);
    setSelectedStock(stock);
  };

  const closeMovements = () => {
    setSelectedStock(null);
    setMovements([]);
    setPage(0);
  };

  if (loading) {
    return <Loading label="Stoklar yükleniyor…" />;
  }

  if (stocks.length === 0) {
    return (
      <EmptyState
        title="Stok yok"
        description="Bu depoda henüz stok kaydı bulunmuyor"
        icon="layers-outline"
      />
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      {stocks.map((stock) => {
        const unit = stock.product?.unit ? ` ${stock.product.unit}` : '';
        return (
          <Card key={stock.id}>
            <View style={{ gap: spacing.xs }}>
              <Text variant="bodyStrong" numberOfLines={2}>
                {stock.product?.name ?? `Ürün #${stock.productId ?? stock.id}`}
              </Text>
              {stock.product?.code ? (
                <Text variant="caption" color={colors.primary}>
                  {stock.product.code}
                </Text>
              ) : null}
              <Text variant="caption">
                Mevcut: {stock.currentStock}
                {unit}
                {stock.minStock != null || stock.maxStock != null
                  ? ` · Min/Max: ${stock.minStock ?? '—'} / ${stock.maxStock ?? '—'}`
                  : ''}
              </Text>
              {stock.lastMovementDate ? (
                <Text variant="caption" color={colors.textSecondary}>
                  Son hareket: {formatWarehouseDate(stock.lastMovementDate)}
                </Text>
              ) : null}
              <View style={{ marginTop: spacing.sm, alignItems: 'flex-start' }}>
                <Button
                  title="Hareketler"
                  variant="outline"
                  size="small"
                  onPress={() => openMovements(stock)}
                />
              </View>
            </View>
          </Card>
        );
      })}

      <BottomSheet
        visible={!!selectedStock}
        onClose={closeMovements}
        title={
          selectedStock
            ? `Hareketler — ${selectedStock.product?.name ?? 'Stok'}`
            : 'Stok hareketleri'
        }
        footer={
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button
              title="Önceki"
              variant="outline"
              size="small"
              disabled={page === 0 || movementsLoading}
              onPress={() => setPage((p) => Math.max(0, p - 1))}
              style={{ flex: 1 }}
            />
            <Button
              title="Sonraki"
              variant="outline"
              size="small"
              disabled={movements.length < pageSize || movementsLoading}
              onPress={() => setPage((p) => p + 1)}
              style={{ flex: 1 }}
            />
            <Button title="Kapat" size="small" onPress={closeMovements} style={{ flex: 1 }} />
          </View>
        }
        contentStyle={{ maxHeight: '70%' }}
      >
        {movementsLoading ? (
          <Loading label="Hareketler yükleniyor…" />
        ) : movements.length === 0 ? (
          <Text variant="caption" color={colors.textSecondary}>
            Hareket kaydı bulunmuyor
          </Text>
        ) : (
          <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: spacing.sm }}>
              {movements.map((m) => {
                const sign = m.movementType === 'OUT' ? '-' : m.movementType === 'IN' ? '+' : '';
                const unit = selectedStock?.product?.unit ? ` ${selectedStock.product.unit}` : '';
                return (
                  <Card key={m.id} padding={12}>
                    <View style={{ gap: spacing.xxs }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text variant="bodyStrong">{getStockMovementTypeLabel(m.movementType)}</Text>
                        <Text
                          variant="bodyStrong"
                          color={
                            m.movementType === 'IN'
                              ? colors.success
                              : m.movementType === 'OUT'
                                ? colors.error
                                : colors.text
                          }
                        >
                          {sign}
                          {m.quantity}
                          {unit}
                        </Text>
                      </View>
                      {m.referenceType ? (
                        <Text variant="caption" color={colors.textSecondary}>
                          {m.referenceType}
                          {m.referenceId != null ? ` #${m.referenceId}` : ''}
                        </Text>
                      ) : null}
                      {m.notes ? (
                        <Text variant="caption" color={colors.textSecondary}>
                          {m.notes}
                        </Text>
                      ) : null}
                      <Text variant="caption" color={colors.textMuted}>
                        {formatWarehouseDateTime(m.createdAt)}
                      </Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          </ScrollView>
        )}
      </BottomSheet>
    </View>
  );
}
