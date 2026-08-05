import { Card, Section, Text } from '@/components/ui';
import {
  formatOrderDate,
  formatOrderMoney,
  getOrderProductCode,
  getOrderProductName,
  getOrderSupplierName,
} from '@/domain/orders/orderStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { PurchaseOrder } from '@/services/api/purchase-order.service';
import React from 'react';
import { View } from 'react-native';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text variant="caption">{label}</Text>
      <Text variant="body">{value || '—'}</Text>
    </View>
  );
}

export type OrderInfoSectionsProps = {
  order: PurchaseOrder;
};

export function OrderInfoSections({ order }: OrderInfoSectionsProps) {
  const { spacing } = useAppTheme();
  const currency = order.supplierQuote?.currency || 'TRY';
  const product = order.supplierQuote?.product;
  const supplier = order.supplierQuote?.supplier;
  const warehouse = order.deliveryWarehouse;

  return (
    <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
      <Section title="Ürün">
        <Card>
          <InfoRow label="Ad" value={getOrderProductName(order)} />
          <InfoRow label="Kod" value={getOrderProductCode(order)} />
          {product?.productType ? (
            <InfoRow label="Tür" value={product.productType} />
          ) : null}
          {product?.category?.name ? (
            <InfoRow label="Kategori" value={product.category.name} />
          ) : null}
          {product?.description ? (
            <InfoRow label="Açıklama" value={product.description} />
          ) : null}
        </Card>
      </Section>

      <Section title="Tedarikçi">
        <Card>
          <InfoRow label="Firma" value={getOrderSupplierName(order)} />
          {supplier?.taxNumber ? <InfoRow label="Vergi no" value={supplier.taxNumber} /> : null}
          {supplier?.contactPerson ? (
            <InfoRow label="Yetkili" value={supplier.contactPerson} />
          ) : null}
          {supplier?.contactPhone ? <InfoRow label="Telefon" value={supplier.contactPhone} /> : null}
          {supplier?.contactEmail ? <InfoRow label="E-posta" value={supplier.contactEmail} /> : null}
        </Card>
      </Section>

      <Section title="Fiyatlandırma">
        <Card>
          <InfoRow label="Miktar" value={String(order.quantity ?? '—')} />
          <InfoRow label="Birim fiyat" value={formatOrderMoney(order.unitPrice, currency)} />
          <InfoRow label="Toplam" value={formatOrderMoney(order.totalPrice, currency)} />
          <InfoRow label="Para birimi" value={currency} />
        </Card>
      </Section>

      <Section title="Depo">
        <Card>
          <InfoRow label="Depo" value={warehouse?.name || '—'} />
          {warehouse?.code ? <InfoRow label="Kod" value={warehouse.code} /> : null}
          {warehouse?.address ? <InfoRow label="Adres" value={warehouse.address} /> : null}
          {warehouse?.managerName ? (
            <InfoRow label="Sorumlu" value={warehouse.managerName} />
          ) : null}
        </Card>
      </Section>

      <Section title="Tarihler">
        <Card>
          <InfoRow label="Beklenen teslimat" value={formatOrderDate(order.expectedDeliveryDate)} />
          <InfoRow label="Gerçekleşen teslimat" value={formatOrderDate(order.actualDeliveryDate)} />
          <InfoRow label="Oluşturulma" value={formatOrderDate(order.createdAt)} />
          <InfoRow label="Güncelleme" value={formatOrderDate(order.updatedAt)} />
        </Card>
      </Section>

      {order.notes ? (
        <Section title="Notlar">
          <Card>
            <Text variant="body">{order.notes}</Text>
          </Card>
        </Section>
      ) : null}
    </View>
  );
}
