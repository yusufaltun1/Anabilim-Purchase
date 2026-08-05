import { Button, NumberInput, Text } from '@/components/ui';
import { AppModal } from '@/components/ui/Modal';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { SupplierQuote } from '@/services/types/purchase.types';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

export type CounterOfferModalProps = {
  visible: boolean;
  quote: SupplierQuote | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { quantity: number; unitPrice: number }) => Promise<void> | void;
};

export function CounterOfferModal({
  visible,
  quote,
  loading = false,
  onClose,
  onSubmit,
}: CounterOfferModalProps) {
  const { spacing } = useAppTheme();
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);

  useEffect(() => {
    if (!quote || !visible) return;
    setUnitPrice(quote.unitPrice ?? null);
    setQuantity(quote.quantity ?? null);
  }, [quote, visible]);

  const handleSubmit = async () => {
    if (unitPrice == null || unitPrice < 0) {
      Alert.alert('Hata', 'Birim fiyat giriniz');
      return;
    }
    if (quantity == null || quantity < 1) {
      Alert.alert('Hata', 'Geçerli bir miktar giriniz');
      return;
    }
    await onSubmit({ unitPrice, quantity });
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Karşı teklif">
      <Text variant="caption" style={{ marginBottom: spacing.md }}>
        {quote?.supplier?.name ?? 'Tedarikçi'} · Ana teklifi değiştirmez
      </Text>
      <NumberInput label="Birim fiyat" required value={unitPrice} onChangeValue={setUnitPrice} decimal min={0} />
      <NumberInput label="Miktar" required value={quantity} onChangeValue={setQuantity} min={1} />
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
