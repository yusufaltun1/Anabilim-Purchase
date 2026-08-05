import {
  Button,
  Card,
  Checkbox,
  IconButton,
  Input,
  NumberInput,
  Select,
  Text,
  TextArea,
  UserSearchSelect,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeProductType } from '@/domain/stockroom/productLabels';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  transferService,
  type CreateTransferItemPayload,
  type CreateTransferPayload,
} from '@/services/api/transfer.service';
import { userService, type ActiveUser } from '@/services/api/user.service';
import {
  warehouseService,
  type Warehouse,
  type WarehouseStock,
} from '@/services/api/warehouse.service';
import { productService } from '@/services/api/product.service';
import type { Product } from '@/services/types/product.types';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, View } from 'react-native';

type FormItem = CreateTransferItemPayload & { key: string };

export type TransferCreateFormProps = {
  onSuccess: (transferId?: number) => void;
  onCancel: () => void;
};

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function requiresSerial(product?: Product | WarehouseStock['product']): boolean {
  const type = normalizeProductType(
    product && 'productType' in product ? product.productType : undefined
  );
  return type === 'FIXED_ASSET' || type === 'SEMI_FIXED_ASSET';
}

function newItem(): FormItem {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: 0,
    requestedQuantity: 1,
    serialNumbers: '',
    conditionNotes: '',
    notes: '',
    transferImagesBase64: [],
  };
}

export function TransferCreateForm({ onSuccess, onCancel }: TransferCreateFormProps) {
  const { token } = useAuth();
  const { colors, spacing } = useAppTheme();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<WarehouseStock[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [sourceWarehouseId, setSourceWarehouseId] = useState<number | null>(null);
  const [targetWarehouseId, setTargetWarehouseId] = useState<number | null>(null);
  const [transferDate, setTransferDate] = useState(todayIsoDate());
  const [notes, setNotes] = useState('');
  const [selfManaged, setSelfManaged] = useState(false);
  const [receiverUserId, setReceiverUserId] = useState<string | null>(null);
  const [items, setItems] = useState<FormItem[]>([newItem()]);

  useEffect(() => {
    if (!token) {
      setLoadingMeta(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingMeta(true);
        const [wh, activeUsers, activeProducts] = await Promise.all([
          warehouseService.getActiveWarehouses(token),
          userService.getActiveUsers(token).catch(() => [] as ActiveUser[]),
          productService.getActiveProducts(token).catch(() => [] as Product[]),
        ]);
        if (!cancelled) {
          setWarehouses(wh);
          setUsers(activeUsers);
          setProducts(activeProducts);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) Alert.alert('Hata', 'Form verileri yüklenemedi');
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !sourceWarehouseId) {
      setStocks([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await warehouseService.getWarehouseStocks(sourceWarehouseId, token);
        if (!cancelled) setStocks(data.filter((s) => (s.currentStock ?? 0) > 0));
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setStocks([]);
          Alert.alert('Hata', 'Depo stokları yüklenemedi');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, sourceWarehouseId]);

  const warehouseOptions = useMemo(
    () => warehouses.map((w) => ({ label: w.name, value: w.id })),
    [warehouses]
  );

  const productOptions = useMemo(
    () =>
      stocks.map((s) => ({
        label: `${s.product?.name || 'Ürün'} (stok: ${s.currentStock})`,
        value: s.product?.id ?? s.productId ?? 0,
      })),
    [stocks]
  );

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        fullName: u.fullName || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
        email: u.email,
        department: u.department,
      })),
    [users]
  );

  const updateItem = (key: string, patch: Partial<FormItem>) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  };

  const pickImages = async (key: string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin gereklidir');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
      allowsMultipleSelection: true,
    });
    if (result.canceled || !result.assets.length) return;
    const base64List = result.assets
      .map((a) => (a.base64 ? a.base64 : ''))
      .filter(Boolean);
    setItems((prev) =>
      prev.map((it) =>
        it.key === key
          ? {
              ...it,
              transferImagesBase64: [...(it.transferImagesBase64 || []), ...base64List],
            }
          : it
      )
    );
  };

  const validate = (): string | null => {
    if (!sourceWarehouseId) return 'Kaynak depo seçilmeli';
    if (!targetWarehouseId) return 'Hedef depo seçilmeli';
    if (sourceWarehouseId === targetWarehouseId) return 'Kaynak ve hedef depo farklı olmalı';
    if (!transferDate.trim()) return 'Transfer tarihi seçilmeli';
    if (!selfManaged && !receiverUserId) return 'Alıcı kullanıcı seçilmeli';
    if (items.length === 0) return 'En az bir ürün eklenmelidir';
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId) return `Kalem #${i + 1}: ürün seçilmeli`;
      if (!item.requestedQuantity || item.requestedQuantity <= 0) {
        return `Kalem #${i + 1}: miktar 0'dan büyük olmalı`;
      }
      const stock = stocks.find((s) => (s.product?.id ?? s.productId) === item.productId);
      if (stock && item.requestedQuantity > stock.currentStock) {
        return `Kalem #${i + 1}: stok yetersiz (mevcut: ${stock.currentStock})`;
      }
      const product =
        products.find((p) => p.id === item.productId) ||
        stock?.product;
      if (requiresSerial(product) && !item.serialNumbers?.trim()) {
        return `Kalem #${i + 1}: seri numarası girilmelidir`;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Doğrulama', error);
      return;
    }
    if (!token) return;

    const payload: CreateTransferPayload = {
      sourceWarehouseId: sourceWarehouseId!,
      targetWarehouseId: targetWarehouseId!,
      transferDate: transferDate.trim(),
      notes: notes.trim() || undefined,
      selfManaged,
      receiverUserId: selfManaged ? null : Number(receiverUserId),
      items: items.map(({ key: _k, ...rest }) => ({
        productId: rest.productId,
        requestedQuantity: rest.requestedQuantity,
        serialNumbers: rest.serialNumbers?.trim() || undefined,
        conditionNotes: rest.conditionNotes?.trim() || undefined,
        notes: rest.notes?.trim() || undefined,
        transferImagesBase64:
          rest.transferImagesBase64 && rest.transferImagesBase64.length > 0
            ? rest.transferImagesBase64
            : undefined,
      })),
    };

    try {
      setSubmitting(true);
      const created = await transferService.createTransfer(payload, token);
      Alert.alert('Başarılı', 'Transfer oluşturuldu', [
        { text: 'Tamam', onPress: () => onSuccess(created?.id) },
      ]);
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Transfer oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMeta) {
    return (
      <View style={{ padding: spacing.lg }}>
        <Text variant="body">Form yükleniyor…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.md }}
    >
      <Card>
        <Select
          label="Kaynak depo"
          required
          options={warehouseOptions}
          value={sourceWarehouseId}
          onChange={(v) => {
            setSourceWarehouseId(v);
            setItems([newItem()]);
          }}
          searchable
        />
        <Select
          label="Hedef depo"
          required
          options={warehouseOptions.filter((o) => o.value !== sourceWarehouseId)}
          value={targetWarehouseId}
          onChange={setTargetWarehouseId}
          searchable
        />
        <Input
          label="Transfer tarihi"
          required
          placeholder="YYYY-MM-DD"
          value={transferDate}
          onChangeText={setTransferDate}
          autoCapitalize="none"
        />
        <TextArea
          label="Notlar"
          placeholder="Opsiyonel not"
          value={notes}
          onChangeText={setNotes}
        />
        <Checkbox
          label="Kendim teslim alacağım (self managed)"
          checked={selfManaged}
          onChange={setSelfManaged}
        />
        {!selfManaged ? (
          <UserSearchSelect
            label="Alıcı kullanıcı"
            required
            users={userOptions}
            value={receiverUserId}
            onChange={setReceiverUserId}
          />
        ) : null}
      </Card>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text variant="bodyStrong">Kalemler</Text>
        <Button
          title="Kalem ekle"
          size="small"
          variant="outline"
          onPress={() => setItems((prev) => [...prev, newItem()])}
          disabled={!sourceWarehouseId}
        />
      </View>

      {items.map((item, index) => {
        const stock = stocks.find((s) => (s.product?.id ?? s.productId) === item.productId);
        const product =
          products.find((p) => p.id === item.productId) || stock?.product;
        const showSerial = requiresSerial(product);
        const maxQty = stock?.currentStock ?? undefined;

        return (
          <Card key={item.key}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.sm,
              }}
            >
              <Text variant="bodyStrong">Kalem #{index + 1}</Text>
              {items.length > 1 ? (
                <IconButton
                  name="trash-outline"
                  onPress={() => setItems((prev) => prev.filter((i) => i.key !== item.key))}
                  accessibilityLabel="Kalemi sil"
                />
              ) : null}
            </View>
            <Select
              label="Ürün"
              required
              options={productOptions}
              value={item.productId || null}
              onChange={(v) =>
                updateItem(item.key, {
                  productId: v ?? 0,
                  serialNumbers: '',
                  requestedQuantity: 1,
                })
              }
              searchable
              placeholder={sourceWarehouseId ? 'Ürün seçin' : 'Önce kaynak depo seçin'}
              disabled={!sourceWarehouseId}
            />
            <NumberInput
              label={maxQty != null ? `Miktar (max ${maxQty})` : 'Miktar'}
              required
              value={item.requestedQuantity}
              onChangeValue={(v) => updateItem(item.key, { requestedQuantity: v ?? 1 })}
              min={1}
              max={maxQty}
            />
            {showSerial ? (
              <TextArea
                label="Seri numaraları"
                required
                placeholder="Her satıra bir seri no"
                value={item.serialNumbers || ''}
                onChangeText={(v) => updateItem(item.key, { serialNumbers: v })}
              />
            ) : null}
            <TextArea
              label="Kalem notu"
              placeholder="Opsiyonel"
              value={item.notes || ''}
              onChangeText={(v) => updateItem(item.key, { notes: v })}
            />
            <Button
              title="Transfer resmi ekle"
              variant="outline"
              size="small"
              onPress={() => void pickImages(item.key)}
            />
            {(item.transferImagesBase64?.length ?? 0) > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
                {item.transferImagesBase64!.map((img, imgIdx) => (
                  <View key={`${item.key}-img-${imgIdx}`} style={{ position: 'relative' }}>
                    <Image
                      source={{
                        uri: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`,
                      }}
                      style={{ width: 64, height: 64, borderRadius: 8 }}
                    />
                    <IconButton
                      name="close-circle"
                      size={22}
                      onPress={() =>
                        updateItem(item.key, {
                          transferImagesBase64: item.transferImagesBase64!.filter(
                            (_, i) => i !== imgIdx
                          ),
                        })
                      }
                      accessibilityLabel="Resmi kaldır"
                      style={{ position: 'absolute', top: -8, right: -8 }}
                    />
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        );
      })}

      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        <Button title="Transfer oluştur" onPress={() => void handleSubmit()} loading={submitting} />
        <Button title="İptal" variant="ghost" onPress={onCancel} disabled={submitting} />
      </View>

      {!sourceWarehouseId ? (
        <Text variant="caption" color={colors.textMuted} center>
          Ürün seçmek için önce kaynak depo seçin.
        </Text>
      ) : null}
    </ScrollView>
  );
}
