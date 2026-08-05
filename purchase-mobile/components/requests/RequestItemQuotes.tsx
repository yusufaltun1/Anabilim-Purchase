import { useAuth } from '@/contexts/AuthContext';
import { useCapabilities } from '@/hooks/useCapabilities';
import { useAppTheme } from '@/hooks/useAppTheme';
import { purchaseOrderService } from '@/services/api/purchase-order.service';
import {
  supplierQuoteService,
  type UpdateSupplierQuoteRequest,
} from '@/services/api/supplier-quote.service';
import type { SupplierQuote } from '@/services/types/purchase.types';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { ConvertToOrderModal } from './ConvertToOrderModal';
import { CounterOfferModal } from './CounterOfferModal';
import { QuoteEditModal } from './QuoteEditModal';
import { SupplierQuoteCards } from './SupplierQuoteCards';

export type RequestItemQuotesProps = {
  quotes?: SupplierQuote[];
  selectedSupplierId?: number | null;
  onChanged?: () => void;
};

export function RequestItemQuotes({
  quotes,
  selectedSupplierId,
  onChanged,
}: RequestItemQuotesProps) {
  const { token } = useAuth();
  const { canQuoteCollect, canEnterCounterOffer, canOrderCreate } = useCapabilities();
  const { colors, spacing } = useAppTheme();

  const [editQuote, setEditQuote] = useState<SupplierQuote | null>(null);
  const [preferCounter, setPreferCounter] = useState(false);
  const [counterQuote, setCounterQuote] = useState<SupplierQuote | null>(null);
  const [orderQuote, setOrderQuote] = useState<SupplierQuote | null>(null);
  const [loading, setLoading] = useState(false);

  const showActions = canQuoteCollect || canEnterCounterOffer || canOrderCreate;
  if (!quotes?.length && !showActions) return null;
  if (!quotes?.length) return null;

  const handleEditSubmit = async (payload: UpdateSupplierQuoteRequest) => {
    if (!editQuote?.quoteUid) {
      Alert.alert('Hata', 'Teklif UID bulunamadı');
      return;
    }
    setLoading(true);
    try {
      const res = await supplierQuoteService.updateQuote(editQuote.quoteUid, payload, token ?? undefined);
      if (!res.success) throw new Error(res.message);
      setEditQuote(null);
      setPreferCounter(false);
      Alert.alert('Başarılı', res.message || 'Teklif güncellendi');
      onChanged?.();
    } catch (e) {
      Alert.alert('Hata', (e as Error).message || 'Teklif güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCounterSubmit = async (payload: { quantity: number; unitPrice: number }) => {
    if (!counterQuote?.quoteUid) {
      Alert.alert('Hata', 'Teklif UID bulunamadı');
      return;
    }
    setLoading(true);
    try {
      const res = await supplierQuoteService.setCounterOffer(
        counterQuote.quoteUid,
        payload,
        token ?? undefined
      );
      if (!res.success) throw new Error(res.message);
      setCounterQuote(null);
      Alert.alert('Başarılı', res.message || 'Karşı teklif kaydedildi');
      onChanged?.();
    } catch (e) {
      Alert.alert('Hata', (e as Error).message || 'Karşı teklif kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (payload: {
    supplierQuoteId: number;
    quantity: number;
    deliveryWarehouseId: number;
    expectedDeliveryDate: string;
    notes: string;
  }) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await purchaseOrderService.createOrder(payload, token);
      if (!res.success) throw new Error(res.message);
      setOrderQuote(null);
      Alert.alert('Başarılı', res.message || 'Sipariş oluşturuldu');
      onChanged?.();
    } catch (e) {
      Alert.alert('Hata', (e as Error).message || 'Sipariş oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <SupplierQuoteCards
        quotes={quotes}
        selectedSupplierId={selectedSupplierId}
        showActions={showActions}
        canQuoteCollect={canQuoteCollect}
        canEnterCounterOffer={canEnterCounterOffer}
        canOrderCreate={canOrderCreate}
        onEditQuote={(q) => {
          setPreferCounter(false);
          setEditQuote(q);
        }}
        onEnterCounterOffer={setCounterQuote}
        onApplyCounterToQuote={(q) => {
          setPreferCounter(true);
          setEditQuote(q);
        }}
        onConvertToOrder={setOrderQuote}
      />

      <QuoteEditModal
        visible={!!editQuote}
        quote={editQuote}
        preferCounterValues={preferCounter}
        loading={loading}
        onClose={() => {
          setEditQuote(null);
          setPreferCounter(false);
        }}
        onSubmit={handleEditSubmit}
      />
      <CounterOfferModal
        visible={!!counterQuote}
        quote={counterQuote}
        loading={loading}
        onClose={() => setCounterQuote(null)}
        onSubmit={handleCounterSubmit}
      />
      <ConvertToOrderModal
        visible={!!orderQuote}
        quote={orderQuote}
        loading={loading}
        onClose={() => setOrderQuote(null)}
        onSubmit={handleOrderSubmit}
      />
    </View>
  );
}

/** Geriye dönük alias */
export function SupplierQuoteSection(props: RequestItemQuotesProps) {
  return <RequestItemQuotes {...props} />;
}
