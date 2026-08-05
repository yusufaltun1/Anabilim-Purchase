import {
  Button,
  ImagePickerField,
  Input,
  NumberInput,
  Select,
  Text,
  TextArea,
  type PickedImage,
} from '@/components/ui';
import { AppModal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  purchaseOrderService,
  type PurchaseOrder,
} from '@/services/api/purchase-order.service';
import { warehouseService, type Warehouse } from '@/services/api/warehouse.service';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

const ASSET_TYPES = new Set(['FIXED_ASSET', 'SEMI_FIXED_ASSET']);

async function imageToDataUrl(image: PickedImage | null): Promise<string | undefined> {
  if (!image?.uri) return undefined;
  try {
    const base64 = await FileSystem.readAsStringAsync(image.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mime = image.mimeType || 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  } catch {
    return undefined;
  }
}

export type StockEntrySheetProps = {
  visible: boolean;
  order: PurchaseOrder | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function StockEntrySheet({ visible, order, onClose, onSuccess }: StockEntrySheetProps) {
  const { token } = useAuth();
  const { spacing } = useAppTheme();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [receivedQty, setReceivedQty] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [images, setImages] = useState<(PickedImage | null)[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const product = order?.supplierQuote?.product;
  const productType = product?.productType || 'CONSUMABLE';
  const isAsset = ASSET_TYPES.has(productType);
  const orderedQty = order?.quantity ?? 1;

  useEffect(() => {
    if (!visible || !token) return;
    setLoadingWarehouses(true);
    warehouseService
      .getActiveWarehouses(token)
      .then(setWarehouses)
      .catch(() => setWarehouses([]))
      .finally(() => setLoadingWarehouses(false));
  }, [visible, token]);

  useEffect(() => {
    if (!order || !visible) return;
    const qty = order.quantity ?? 1;
    setWarehouseId(order.deliveryWarehouse?.id ?? null);
    setReceivedQty(qty);
    setNotes('');
    setSerialNumbers(Array(qty).fill(''));
    setImages(Array(qty).fill(null));
  }, [order, visible]);

  useEffect(() => {
    if (!isAsset || receivedQty == null) return;
    const qty = Math.max(0, receivedQty);
    setSerialNumbers((prev) => {
      if (prev.length === qty) return prev;
      if (prev.length < qty) return [...prev, ...Array(qty - prev.length).fill('')];
      return prev.slice(0, qty);
    });
    setImages((prev) => {
      if (prev.length === qty) return prev;
      if (prev.length < qty) return [...prev, ...Array(qty - prev.length).fill(null)];
      return prev.slice(0, qty);
    });
  }, [receivedQty, isAsset]);

  const warehouseOptions = useMemo(
    () => warehouses.map((w) => ({ label: w.code ? `${w.name} (${w.code})` : w.name, value: w.id })),
    [warehouses]
  );

  const handleSubmit = async () => {
    if (!order || !token || !product?.id) {
      Alert.alert('Hata', 'Sipariş veya ürün bilgisi eksik');
      return;
    }
    if (!warehouseId) {
      Alert.alert('Hata', 'Lütfen bir depo seçin');
      return;
    }
    if (receivedQty == null || receivedQty <= 0) {
      Alert.alert('Hata', 'Geçerli bir teslim miktarı girin');
      return;
    }
    if (receivedQty > orderedQty) {
      Alert.alert('Hata', `Miktar en fazla ${orderedQty} olabilir`);
      return;
    }
    if (isAsset) {
      const empty = serialNumbers.slice(0, receivedQty).some((s) => !s.trim());
      if (empty) {
        Alert.alert('Hata', 'Tüm seri numaralarını girin');
        return;
      }
    }

    try {
      setSubmitting(true);
      const orderCode = order.orderCode || `#${order.id}`;
      const noteSuffix = notes.trim() ? ` - ${notes.trim()}` : '';

      if (!isAsset) {
        await warehouseService.createStockMovement(
          warehouseId,
          product.id,
          {
            quantity: receivedQty,
            movementType: 'IN',
            referenceType: 'PURCHASE_ORDER',
            referenceId: order.id,
            notes: `Satın alma siparişi girişi: ${orderCode}${noteSuffix}`,
          },
          token
        );
      } else {
        for (let i = 0; i < receivedQty; i++) {
          const imageUrl = await imageToDataUrl(images[i] ?? null);
          await warehouseService.createStockItem(
            {
              productId: product.id,
              serialNumber: serialNumbers[i].trim(),
              warehouseId,
              imageUrl,
              notes: `Satın alma siparişi girişi: ${orderCode}${noteSuffix}`,
            },
            token
          );
          await warehouseService.createStockMovement(
            warehouseId,
            product.id,
            {
              quantity: 1,
              movementType: 'IN',
              referenceType: 'PURCHASE_ORDER',
              referenceId: order.id,
              notes: `Seri numaralı ürün girişi: ${serialNumbers[i].trim()} - ${orderCode}${noteSuffix}`,
            },
            token
          );
        }
      }

      if (order.status === 'SHIPPED') {
        await purchaseOrderService.updateOrderStatus(
          order.id,
          { status: 'DELIVERED', comment: 'Stok girişi tamamlandı' },
          token
        );
      }

      Alert.alert('Başarılı', 'Stok girişi tamamlandı');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Stock entry failed:', err);
      Alert.alert('Hata', err instanceof Error ? err.message : 'Stok girişi sırasında hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={order ? `Stok girişi — ${order.orderCode || order.id}` : 'Stok girişi'}
      variant="fullscreen"
    >
      <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
        {product ? (
          <View style={{ marginBottom: spacing.md, gap: spacing.xxs }}>
            <Text variant="bodyStrong">{product.name}</Text>
            {product.code ? <Text variant="caption">{product.code}</Text> : null}
            <Text variant="caption">Tür: {productType}</Text>
            <Text variant="caption">Sipariş miktarı: {orderedQty}</Text>
          </View>
        ) : null}

        <Select
          label="Teslimat deposu"
          required
          options={warehouseOptions}
          value={warehouseId}
          onChange={setWarehouseId}
          placeholder={loadingWarehouses ? 'Depolar yükleniyor…' : 'Depo seçiniz'}
          emptyText="Aktif depo bulunamadı"
        />

        <NumberInput
          label="Teslim alınan miktar"
          required
          value={receivedQty}
          onChangeValue={setReceivedQty}
          min={1}
          max={orderedQty}
          helper={`Maksimum: ${orderedQty}`}
        />

        {isAsset && receivedQty != null && receivedQty > 0
          ? Array.from({ length: receivedQty }, (_, i) => (
              <View
                key={`serial-${i}`}
                style={{
                  marginBottom: spacing.lg,
                  gap: spacing.sm,
                }}
              >
                <Text variant="label">Adet {i + 1}</Text>
                <Input
                  label="Seri numarası"
                  required
                  value={serialNumbers[i] ?? ''}
                  onChangeText={(text) => {
                    setSerialNumbers((prev) => {
                      const next = [...prev];
                      next[i] = text;
                      return next;
                    });
                  }}
                  placeholder="Seri numarasını girin"
                />
                <ImagePickerField
                  label="Resim (opsiyonel)"
                  value={images[i] ?? null}
                  onChange={(img) => {
                    setImages((prev) => {
                      const next = [...prev];
                      next[i] = img;
                      return next;
                    });
                  }}
                />
              </View>
            ))
          : null}

        <TextArea
          label="Notlar"
          value={notes}
          onChangeText={setNotes}
          numberOfLines={3}
          placeholder="Opsiyonel notlar"
        />
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Button
            title="İptal"
            variant="secondary"
            onPress={onClose}
            fullWidth
            disabled={submitting}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="Stoğa Kaydet"
            onPress={() => void handleSubmit()}
            loading={submitting}
            fullWidth
          />
        </View>
      </View>
    </AppModal>
  );
}
