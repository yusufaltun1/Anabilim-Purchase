import { Card, Text } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ProductStockDetail } from '@/services/types/product.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

function formatDate(dateString?: string) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString?: string) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function movementLabel(type: string) {
  switch (type) {
    case 'IN':
      return 'Giriş';
    case 'OUT':
      return 'Çıkış';
    case 'ADJUSTMENT':
      return 'Düzeltme';
    case 'TRANSFER':
      return 'Transfer';
    default:
      return type;
  }
}

export type StockDetailSectionsProps = {
  detail: ProductStockDetail;
};

export function StockDetailSections({ detail }: StockDetailSectionsProps) {
  const { colors, spacing } = useAppTheme();
  const hasLowStock = detail.warehouseStocks.some((ws) => ws.isLowStock);

  return (
    <View style={{ gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing['3xl'] }}>
      <Card>
        <View style={{ gap: spacing.sm }}>
          <Text variant="h3">{detail.product.name}</Text>
          {detail.product.code ? (
            <Text variant="caption" color={colors.primary}>
              {detail.product.code}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm }}>
            <View>
              <Text variant="caption" color={colors.textSecondary}>
                Toplam stok
              </Text>
              <Text variant="bodyStrong">{detail.totalStock}</Text>
            </View>
            <View>
              <Text variant="caption" color={colors.textSecondary}>
                Depo
              </Text>
              <Text variant="bodyStrong">{detail.warehouseStocks.length}</Text>
            </View>
            <View>
              <Text variant="caption" color={colors.textSecondary}>
                Durum
              </Text>
              <Text variant="bodyStrong" color={hasLowStock ? colors.warning : colors.success}>
                {hasLowStock ? 'Düşük' : 'Normal'}
              </Text>
            </View>
          </View>
          {detail.product.category ? (
            <Text variant="caption" color={colors.textSecondary}>
              Kategori: {detail.product.category}
            </Text>
          ) : null}
          {detail.product.unit ? (
            <Text variant="caption" color={colors.textSecondary}>
              Birim: {detail.product.unit}
            </Text>
          ) : null}
          {detail.product.description ? (
            <Text variant="body" color={colors.textSecondary}>
              {detail.product.description}
            </Text>
          ) : null}
        </View>
      </Card>

      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Ionicons name="storefront" size={18} color={colors.primary} />
          <Text variant="bodyStrong">Depo bazlı stok</Text>
        </View>
        {detail.warehouseStocks.length === 0 ? (
          <Card>
            <Text variant="caption" color={colors.textSecondary}>
              Depo bilgisi bulunmuyor
            </Text>
          </Card>
        ) : (
          detail.warehouseStocks.map((stock) => (
            <Card key={stock.stockId}>
              <View style={{ gap: spacing.xs }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text variant="bodyStrong">{stock.warehouse.name}</Text>
                  {stock.isLowStock ? (
                    <Text variant="caption" color={colors.error}>
                      Düşük
                    </Text>
                  ) : null}
                </View>
                {stock.warehouse.code ? (
                  <Text variant="caption" color={colors.textSecondary}>
                    {stock.warehouse.code}
                  </Text>
                ) : null}
                <Text variant="caption">
                  Mevcut: {stock.currentStock}
                  {stock.minStock != null || stock.maxStock != null
                    ? ` · Min/Max: ${stock.minStock ?? '—'} / ${stock.maxStock ?? '—'}`
                    : ''}
                </Text>
                {stock.lastMovementDate ? (
                  <Text variant="caption" color={colors.textSecondary}>
                    Son hareket: {formatDate(stock.lastMovementDate)}
                  </Text>
                ) : null}
              </View>
            </Card>
          ))
        )}
      </View>

      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Ionicons name="swap-vertical" size={18} color={colors.primary} />
          <Text variant="bodyStrong">Son stok hareketleri</Text>
        </View>
        {detail.recentMovements.length === 0 ? (
          <Card>
            <Text variant="caption" color={colors.textSecondary}>
              Hareket kaydı bulunmuyor
            </Text>
          </Card>
        ) : (
          detail.recentMovements.map((m) => (
            <Card key={m.id}>
              <View style={{ gap: spacing.xs }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text variant="bodyStrong">{movementLabel(m.movementType)}</Text>
                  <Text variant="bodyStrong">{m.quantity}</Text>
                </View>
                {m.warehouseStock?.warehouse?.name ? (
                  <Text variant="caption" color={colors.textSecondary}>
                    {m.warehouseStock.warehouse.name}
                  </Text>
                ) : null}
                {m.notes ? (
                  <Text variant="caption" color={colors.textSecondary}>
                    {m.notes}
                  </Text>
                ) : null}
                <Text variant="caption" color={colors.textMuted}>
                  {formatDateTime(m.createdAt)}
                </Text>
              </View>
            </Card>
          ))
        )}
      </View>
    </View>
  );
}
