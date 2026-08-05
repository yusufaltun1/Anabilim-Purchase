import { Button, DateTimeField, Input, NumberInput, Select, TextArea, Text } from '@/components/ui';
import { AppModal } from '@/components/ui/Modal';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { UpdateSupplierQuoteRequest } from '@/services/api/supplier-quote.service';
import type { SupplierQuote } from '@/services/types/purchase.types';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

function toDateOnlyIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}T00:00:00`;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type QuoteEditModalProps = {
  visible: boolean;
  quote: SupplierQuote | null;
  preferCounterValues?: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateSupplierQuoteRequest) => Promise<void> | void;
};

const CURRENCY_OPTIONS = [
  { label: 'TRY', value: 'TRY' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

export function QuoteEditModal({
  visible,
  quote,
  preferCounterValues = false,
  loading = false,
  onClose,
  onSubmit,
}: QuoteEditModalProps) {
  const { spacing } = useAppTheme();
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('TRY');
  const [supplierReference, setSupplierReference] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [validityDate, setValidityDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!quote || !visible) return;
    const useCounter =
      preferCounterValues &&
      (quote.counterOfferUnitPrice != null || quote.counterOfferQuantity != null);
    setUnitPrice(
      useCounter ? quote.counterOfferUnitPrice ?? quote.unitPrice ?? null : quote.unitPrice ?? null
    );
    setQuantity(
      useCounter ? quote.counterOfferQuantity ?? quote.quantity ?? null : quote.quantity ?? null
    );
    setCurrency(quote.currency || 'TRY');
    setSupplierReference(quote.supplierReference || '');
    setDeliveryDate(parseDate(quote.deliveryDate));
    setValidityDate(parseDate(quote.validityDate));
    setNotes(quote.notes || '');
  }, [quote, visible, preferCounterValues]);

  const handleSubmit = async () => {
    if (unitPrice == null || unitPrice < 0) {
      Alert.alert('Hata', 'Birim fiyat giriniz');
      return;
    }
    if (quantity == null || quantity < 1) {
      Alert.alert('Hata', 'Geçerli bir miktar giriniz');
      return;
    }
    if (!deliveryDate || !validityDate) {
      Alert.alert('Hata', 'Teslim ve geçerlilik tarihleri zorunludur');
      return;
    }
    await onSubmit({
      unitPrice,
      quantity,
      currency,
      supplierReference,
      deliveryDate: toDateOnlyIso(deliveryDate),
      validityDate: toDateOnlyIso(validityDate),
      notes,
    });
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={quote?.status === 'PENDING' ? 'Teklif Gir' : 'Teklif Güncelle'}
    >
      <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 480 }}>
        <Text variant="caption" style={{ marginBottom: spacing.md }}>
          {quote?.supplier?.name ?? 'Tedarikçi'}
          {preferCounterValues ? ' · Karşı teklif değerleriyle' : ''}
        </Text>
        <NumberInput label="Birim fiyat" required value={unitPrice} onChangeValue={setUnitPrice} decimal min={0} />
        <NumberInput label="Miktar" required value={quantity} onChangeValue={setQuantity} min={1} />
        <Select
          label="Para birimi"
          required
          options={CURRENCY_OPTIONS}
          value={currency}
          onChange={(v) => setCurrency(v || 'TRY')}
          searchable={false}
        />
        <Input
          label="Tedarikçi referansı"
          value={supplierReference}
          onChangeText={setSupplierReference}
        />
        <DateTimeField label="Teslim tarihi" required mode="date" value={deliveryDate} onChange={setDeliveryDate} />
        <DateTimeField
          label="Geçerlilik tarihi"
          required
          mode="date"
          value={validityDate}
          onChange={setValidityDate}
        />
        <TextArea label="Notlar" value={notes} onChangeText={setNotes} numberOfLines={3} />
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Button title="İptal" variant="secondary" onPress={onClose} fullWidth disabled={loading} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Kaydet" onPress={() => void handleSubmit()} loading={loading} fullWidth />
        </View>
      </View>
    </AppModal>
  );
}
