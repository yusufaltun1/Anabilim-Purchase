import { Button, DateTimeField, NumberInput, Select, TextArea, Text } from '@/components/ui';
import { AppModal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { warehouseService, type Warehouse } from '@/services/api/warehouse.service';
import type { SupplierQuote } from '@/services/types/purchase.types';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

function toLocalDateTime(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

export type ConvertToOrderModalProps = {
  visible: boolean;
  quote: SupplierQuote | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    supplierQuoteId: number;
    quantity: number;
    deliveryWarehouseId: number;
    expectedDeliveryDate: string;
    notes: string;
  }) => Promise<void> | void;
};

export function ConvertToOrderModal({
  visible,
  quote,
  loading = false,
  onClose,
  onSubmit,
}: ConvertToOrderModalProps) {
  const { token } = useAuth();
  const { spacing } = useAppTheme();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const maxQty = quote?.quantity ?? 1;

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
    if (!quote || !visible) return;
    setQuantity(quote.quantity ?? 1);
    setWarehouseId(null);
    setExpectedDeliveryDate(null);
    setNotes('');
  }, [quote, visible]);

  const warehouseOptions = useMemo(
    () => warehouses.map((w) => ({ label: w.name, value: w.id })),
    [warehouses]
  );

  const handleSubmit = async () => {
    if (!quote) return;
    if (quantity == null || quantity < 1) {
      Alert.alert('Hata', 'Geçerli bir miktar giriniz');
      return;
    }
    if (quantity > maxQty) {
      Alert.alert('Hata', `Miktar en fazla ${maxQty} olabilir`);
      return;
    }
    if (!warehouseId) {
      Alert.alert('Hata', 'Teslim deposu seçiniz');
      return;
    }
    if (!expectedDeliveryDate) {
      Alert.alert('Hata', 'Beklenen teslim tarihi seçiniz');
      return;
    }
    await onSubmit({
      supplierQuoteId: quote.id,
      quantity,
      deliveryWarehouseId: warehouseId,
      expectedDeliveryDate: toLocalDateTime(expectedDeliveryDate),
      notes,
    });
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Siparişe dönüştür">
      <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 480 }}>
        <Text variant="caption" style={{ marginBottom: spacing.md }}>
          {quote?.supplier?.name ?? 'Tedarikçi'}
          {quote?.quoteNumber ? ` · ${quote.quoteNumber}` : ''}
        </Text>
        <NumberInput
          label="Sipariş miktarı"
          required
          value={quantity}
          onChangeValue={setQuantity}
          min={1}
          max={maxQty}
          helper={`Maksimum: ${maxQty}`}
        />
        <Select
          label="Teslim deposu"
          required
          options={warehouseOptions}
          value={warehouseId}
          onChange={setWarehouseId}
          placeholder={loadingWarehouses ? 'Depolar yükleniyor…' : 'Depo seçiniz'}
          emptyText="Aktif depo bulunamadı"
        />
        <DateTimeField
          label="Beklenen teslim tarihi"
          required
          mode="datetime"
          value={expectedDeliveryDate}
          onChange={setExpectedDeliveryDate}
        />
        <TextArea label="Notlar" value={notes} onChangeText={setNotes} numberOfLines={3} />
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Button title="İptal" variant="secondary" onPress={onClose} fullWidth disabled={loading} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Dönüştür" onPress={() => void handleSubmit()} loading={loading} fullWidth />
        </View>
      </View>
    </AppModal>
  );
}
