import { Badge, Card, EmptyState, Loading, Text } from '@/components/ui';
import { StockItemDetailSheet } from '@/components/assignments/StockItemDetailSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  stockItemSerialLabel,
  stockItemStatusLabel,
  type StockItem,
} from '@/services/types/assignment.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';

export type SerialStockItemSectionProps = {
  productId: number;
  stockItems: StockItem[];
  loading?: boolean;
  canManage: boolean;
  onRefresh: () => void;
};

function statusTone(item: StockItem): 'success' | 'info' | 'warning' | 'neutral' {
  if (item.allowsAssignment === true && item.status === 'IN_STOCK') return 'success';
  if (item.status === 'ASSIGNED') return 'info';
  if (item.status === 'MAINTENANCE') return 'warning';
  return 'neutral';
}

export function SerialStockItemSection({
  productId,
  stockItems,
  loading = false,
  canManage,
  onRefresh,
}: SerialStockItemSectionProps) {
  const { spacing, colors, radius } = useAppTheme();
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  const openItem = useMemo(() => {
    if (!selectedItem) return null;
    return (
      stockItems.find((item) => Number(item.id) === Number(selectedItem.id)) ?? selectedItem
    );
  }, [selectedItem, stockItems]);

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
        <Text variant="h3">Cihaz stokları</Text>
      </View>
      <Text variant="caption" style={{ marginBottom: spacing.md }}>
        Cihaz kartına dokunarak zimmet, stok hareketi ve geçmişi yönetin
      </Text>

      {loading ? (
        <Loading />
      ) : stockItems.length === 0 ? (
        <EmptyState
          title="Henüz depoda cihaz yok"
          description="Satın alma girişi veya stok hareketi ile seri numaralı cihaz ekleyebilirsiniz."
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {stockItems.map((item) => {
            const title = stockItemSerialLabel(item);
            const selected =
              openItem != null && Number(openItem.id) === Number(item.id);
            return (
              <Pressable
                key={String(item.id)}
                onPress={() => setSelectedItem(item)}
                accessibilityRole="button"
                accessibilityLabel={`${title} yönet`}
              >
                <Card
                  style={{
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? colors.primary : colors.border,
                    padding: spacing.md,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: radius.md,
                          backgroundColor: colors.backgroundMuted,
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: radius.md,
                          borderWidth: 1,
                          borderStyle: 'dashed',
                          borderColor: colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: colors.backgroundMuted,
                        }}
                      >
                        <Ionicons name="cube-outline" size={22} color={colors.textMuted} />
                      </View>
                    )}
                    <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          gap: spacing.sm,
                          alignItems: 'flex-start',
                        }}
                      >
                        <Text variant="bodyStrong" numberOfLines={2} style={{ flex: 1 }}>
                          {title}
                        </Text>
                        <Badge label={stockItemStatusLabel(item)} tone={statusTone(item)} />
                      </View>
                      <Text variant="caption" numberOfLines={1}>
                        {item.warehouseName || 'Depo dışında'}
                      </Text>
                      <Text variant="caption" numberOfLines={1}>
                        {item.assignedUserName
                          ? `Zimmet: ${item.assignedUserName}`
                          : 'Zimmet yok'}
                      </Text>
                      {item.isUnderWarranty ? (
                        <Badge label="Garantili" tone="success" />
                      ) : null}
                      <Text variant="label" color={colors.primary} style={{ marginTop: 4 }}>
                        Yönet →
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}

      <StockItemDetailSheet
        visible={openItem != null}
        stockItem={openItem}
        productId={productId}
        canManage={canManage}
        onClose={() => setSelectedItem(null)}
        onRefresh={onRefresh}
      />
    </View>
  );
}
