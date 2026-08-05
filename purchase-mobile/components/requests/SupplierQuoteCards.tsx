import { Badge, Button, Text } from '@/components/ui';
import {
  formatQuoteMoney,
  getQuoteStatusMeta,
  type QuoteStatusCode,
} from '@/domain/requests/quoteStatus';
import { formatRequestDate } from '@/domain/requests/requestStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { SupplierQuote } from '@/services/types/purchase.types';
import React, { useMemo } from 'react';
import { View } from 'react-native';

export type SupplierQuoteCardsProps = {
  quotes: SupplierQuote[];
  selectedSupplierId?: number | null;
  showActions?: boolean;
  canQuoteCollect?: boolean;
  canEnterCounterOffer?: boolean;
  canOrderCreate?: boolean;
  onEditQuote?: (quote: SupplierQuote) => void;
  onEnterCounterOffer?: (quote: SupplierQuote) => void;
  onApplyCounterToQuote?: (quote: SupplierQuote) => void;
  onConvertToOrder?: (quote: SupplierQuote) => void;
};

function hasCounterOffer(quote: SupplierQuote) {
  return quote.counterOfferQuantity != null || quote.counterOfferUnitPrice != null;
}

function counterOfferTotal(quote: SupplierQuote): number | null {
  if (quote.counterOfferQuantity == null || quote.counterOfferUnitPrice == null) return null;
  return quote.counterOfferQuantity * quote.counterOfferUnitPrice;
}

export function SupplierQuoteCards({
  quotes,
  selectedSupplierId,
  showActions = false,
  canQuoteCollect = false,
  canEnterCounterOffer = false,
  canOrderCreate = false,
  onEditQuote,
  onEnterCounterOffer,
  onApplyCounterToQuote,
  onConvertToOrder,
}: SupplierQuoteCardsProps) {
  const { colors, spacing, radius } = useAppTheme();

  const sorted = useMemo(() => {
    return [...(quotes ?? [])].sort((a, b) => {
      const aSel = a.isSelected || (selectedSupplierId != null && a.supplier?.id === selectedSupplierId);
      const bSel = b.isSelected || (selectedSupplierId != null && b.supplier?.id === selectedSupplierId);
      if (aSel && !bSel) return -1;
      if (!aSel && bSel) return 1;
      return (a.totalPrice ?? 0) - (b.totalPrice ?? 0);
    });
  }, [quotes, selectedSupplierId]);

  if (!sorted.length) {
    return <Text variant="helper">Henüz teklif bulunmamaktadır.</Text>;
  }

  return (
    <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
      <Text variant="bodyStrong">Teklifler</Text>
      {sorted.map((quote) => {
        const selected =
          quote.isSelected ||
          (selectedSupplierId != null && quote.supplier?.id === selectedSupplierId);
        const statusMeta = getQuoteStatusMeta(quote.status as QuoteStatusCode | undefined);
        const counter = hasCounterOffer(quote);
        const counterTotal = counterOfferTotal(quote);
        const canCounter =
          canEnterCounterOffer &&
          quote.status === 'RESPONDED' &&
          Boolean(quote.quoteUid) &&
          !counter;

        return (
          <View
            key={quote.id}
            style={{
              borderWidth: 1,
              borderColor: selected ? colors.success : colors.border,
              borderRadius: radius.lg,
              padding: spacing.md,
              backgroundColor: colors.background,
              gap: spacing.xs,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
                {quote.supplier?.name ?? '—'}
              </Text>
              {selected ? <Badge label="Seçilen" tone="success" /> : null}
              <Badge label={statusMeta.label} tone={statusMeta.tone} />
            </View>

            {quote.quoteNumber ? (
              <Text variant="caption">Teklif no: {quote.quoteNumber}</Text>
            ) : null}

            {(quote.unitPrice != null || quote.totalPrice != null) && (
              <Text variant="caption">
                {quote.unitPrice != null
                  ? `Birim: ${formatQuoteMoney(quote.unitPrice, quote.currency)}  `
                  : ''}
                {quote.quantity != null ? `Miktar: ${quote.quantity}  ` : ''}
                {quote.totalPrice != null
                  ? `Toplam: ${formatQuoteMoney(quote.totalPrice, quote.currency)}`
                  : ''}
              </Text>
            )}

            {counter ? (
              <View
                style={{
                  marginTop: spacing.xs,
                  padding: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: colors.infoMuted,
                  gap: spacing.xs,
                }}
              >
                <Text variant="caption" color={colors.info}>
                  Karşı teklif
                </Text>
                <Text variant="caption">
                  {quote.counterOfferUnitPrice != null
                    ? `Birim: ${formatQuoteMoney(quote.counterOfferUnitPrice, quote.currency)}  `
                    : ''}
                  {quote.counterOfferQuantity != null ? `Miktar: ${quote.counterOfferQuantity}  ` : ''}
                  {counterTotal != null
                    ? `Toplam: ${formatQuoteMoney(counterTotal, quote.currency)}`
                    : ''}
                </Text>
                {canQuoteCollect && onApplyCounterToQuote ? (
                  <Button
                    title="Ana teklife uygula"
                    variant="ghost"
                    size="small"
                    onPress={() => onApplyCounterToQuote(quote)}
                  />
                ) : null}
              </View>
            ) : canCounter && onEnterCounterOffer ? (
              <Button
                title="Karşı teklif gir"
                variant="outline"
                size="small"
                onPress={() => onEnterCounterOffer(quote)}
              />
            ) : null}

            {quote.deliveryDate ? (
              <Text variant="caption">Teslim: {formatRequestDate(quote.deliveryDate)}</Text>
            ) : null}

            {showActions ? (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: spacing.sm,
                  marginTop: spacing.sm,
                }}
              >
                {canQuoteCollect && onEditQuote && quote.status !== 'CONVERTED_TO_ORDER' ? (
                  <Button
                    title={quote.status === 'PENDING' ? 'Teklif Gir' : 'Güncelle'}
                    variant="outline"
                    size="small"
                    onPress={() => onEditQuote(quote)}
                  />
                ) : null}
                {canOrderCreate && onConvertToOrder && quote.status === 'RESPONDED' ? (
                  <Button
                    title="Siparişe Dönüştür"
                    size="small"
                    onPress={() => onConvertToOrder(quote)}
                  />
                ) : null}
                {quote.status === 'CONVERTED_TO_ORDER' ? (
                  <Text variant="caption" color={colors.success}>
                    Sipariş Verildi
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
