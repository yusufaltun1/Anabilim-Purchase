import { AccessDenied } from '@/components/auth/AccessDenied';
import { Button, Card, Loading, Screen, ScreenHeader, Select, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCapabilities } from '@/hooks/useCapabilities';
import { productService } from '@/services/api/product.service';
import { supplierService } from '@/services/api/supplier.service';
import type { Supplier } from '@/services/types/supplier.types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function ProductAddSupplierScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const { token } = useAuth();
  const { canInventoryManage } = useCapabilities();
  const { spacing } = useAppTheme();

  const [productName, setProductName] = useState<string>('');
  const [existingSupplierIds, setExistingSupplierIds] = useState<number[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !productId || !canInventoryManage) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [product, activeSuppliers] = await Promise.all([
          productService.getProductById(productId, token),
          supplierService.getActiveSuppliers(token),
        ]);
        if (cancelled) return;
        setProductName(product.name || `Ürün #${productId}`);
        setExistingSupplierIds((product.suppliers ?? []).map((s) => s.id));
        setSuppliers(activeSuppliers);
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          Alert.alert('Hata', err instanceof Error ? err.message : 'Veriler yüklenemedi', [
            { text: 'Tamam', onPress: () => router.back() },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, productId, canInventoryManage, router]);

  const options = useMemo(
    () =>
      suppliers
        .filter((s) => !existingSupplierIds.includes(s.id))
        .map((s) => ({
          label: s.name,
          value: s.id,
        })),
    [suppliers, existingSupplierIds]
  );

  if (!canInventoryManage) {
    return (
      <>
        <Stack.Screen options={{ title: 'Tedarikçi Ekle', headerShown: false }} />
        <AccessDenied description="Ürüne tedarikçi ekleme yetkiniz bulunmuyor." />
      </>
    );
  }

  const handleSubmit = async () => {
    if (!token || !selectedId) {
      Alert.alert('Doğrulama', 'Lütfen bir tedarikçi seçin');
      return;
    }
    setSubmitting(true);
    try {
      await productService.addSupplierToProduct(productId, selectedId, token);
      router.replace(`/product-detail/${productId}`);
    } catch (err: unknown) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Tedarikçi eklenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Tedarikçi Ekle', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <ScreenHeader title="Tedarikçi ekle" subtitle={productName || 'Ürüne tedarikçi bağla'} />
        </View>
        {loading ? (
          <Loading fullScreen label="Yükleniyor…" />
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.md }}
            keyboardShouldPersistTaps="handled"
          >
            <Card>
              <Text variant="body" style={{ marginBottom: spacing.md }}>
                Aktif tedarikçiler arasından seçim yapın. Ürüne zaten bağlı olanlar listede
                gösterilmez.
              </Text>
              <Select
                label="Tedarikçi"
                required
                placeholder={options.length ? 'Tedarikçi seçin' : 'Eklenecek tedarikçi yok'}
                options={options}
                value={selectedId}
                onChange={(v) => setSelectedId(v)}
                searchable
                clearable
                disabled={options.length === 0}
              />
            </Card>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <Button
                title="İptal"
                onPress={() => router.back()}
                variant="outline"
                style={{ flex: 1 }}
                disabled={submitting}
              />
              <Button
                title="Ekle"
                onPress={() => void handleSubmit()}
                loading={submitting}
                disabled={submitting || !selectedId}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        )}
      </Screen>
    </>
  );
}
