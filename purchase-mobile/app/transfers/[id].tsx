import { TransferStatusActions, TransferStatusBadge } from '@/components/transfers';
import {
  Button,
  Card,
  ErrorBanner,
  Loading,
  NumberInput,
  Screen,
  ScreenHeader,
  Section,
  Text,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import {
  canEditTransferQuantity,
  formatTransferDateTime,
  warehouseLabel,
} from '@/domain/custody/transferStatus';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCapabilities } from '@/hooks/useCapabilities';
import {
  transferService,
  type AssetTransfer,
  type AssetTransferItem,
} from '@/services/api/transfer.service';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TransferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();
  const { canSystemManage } = useCapabilities();
  const { colors, spacing } = useAppTheme();

  const transferId = Number(id);
  const [transfer, setTransfer] = useState<AssetTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showReceiveImageModal, setShowReceiveImageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AssetTransferItem | null>(null);
  const [receiveImages, setReceiveImages] = useState<string[]>([]);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState(0);

  const loadTransfer = useCallback(async () => {
    if (!token || !transferId || Number.isNaN(transferId)) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await transferService.getTransferById(transferId, token);
      setTransfer(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Transfer yüklenemedi');
      setTransfer(null);
    } finally {
      setLoading(false);
    }
  }, [token, transferId]);

  useEffect(() => {
    setLoading(true);
    void loadTransfer();
  }, [loadTransfer]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransfer();
    setRefreshing(false);
  };

  const canComplete =
    !!transfer &&
    !!user &&
    transfer.receivedBy?.id === user.id &&
    ['IN_TRANSIT', 'PREPARING', 'APPROVED', 'PENDING', 'DELIVERED'].includes(transfer.status) &&
    transfer.status !== 'COMPLETED' &&
    transfer.status !== 'CANCELLED' &&
    transfer.status !== 'REJECTED';

  const canManage = canSystemManage;
  const canEditQty = canManage && canEditTransferQuantity(transfer?.status);

  const handleAddReceiveImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('İzin Gerekli', 'Galeri erişimi için izin gereklidir');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
        allowsMultipleSelection: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const newImages = result.assets
          .map((asset) => (asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : ''))
          .filter(Boolean);
        setReceiveImages((prev) => [...prev, ...newImages]);
      }
    } catch {
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu');
    }
  };

  const handleSaveReceiveImages = async () => {
    if (!selectedItem || !token || !transfer) return;
    try {
      setSubmitting(true);
      await transferService.updateTransferItemImages(
        transfer.id,
        selectedItem.id,
        receiveImages,
        token
      );
      setShowReceiveImageModal(false);
      setReceiveImages([]);
      setSelectedItem(null);
      await loadTransfer();
      Alert.alert('Başarılı', 'Resimler kaydedildi.');
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Resimler kaydedilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTransfer = async () => {
    if (!user || !token || !transfer) return;

    const itemsWithoutReceiveImages = transfer.items?.filter(
      (item) => !item.receiveImagesBase64 || item.receiveImagesBase64.length === 0
    );

    if (itemsWithoutReceiveImages && itemsWithoutReceiveImages.length > 0) {
      Alert.alert(
        'Resim Gerekli',
        'Tüm kalemler için teslim alma resimleri yüklenmelidir.',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Resim Yükle',
            onPress: () => {
              setSelectedItem(itemsWithoutReceiveImages[0]);
              setReceiveImages([]);
              setShowReceiveImageModal(true);
            },
          },
        ]
      );
      return;
    }

    Alert.alert('Transferi Tamamla', 'Transferi teslim aldığınızı onaylıyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Onayla',
        onPress: () => {
          void (async () => {
            try {
              setSubmitting(true);
              await transferService.completeTransfer(transfer.id, user.id, token);
              Alert.alert('Başarılı', 'Transfer tamamlandı.', [
                { text: 'Tamam', onPress: () => router.back() },
              ]);
            } catch (err) {
              Alert.alert(
                'Hata',
                err instanceof Error ? err.message : 'Transfer tamamlanamadı'
              );
            } finally {
              setSubmitting(false);
            }
          })();
        },
      },
    ]);
  };

  const handleTransition = (nextStatus: string, label: string) => {
    if (!token || !transfer) return;
    Alert.alert('Durum güncelle', `Transferi "${label}" olarak işaretlemek istiyor musunuz?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Onayla',
        onPress: () => {
          void (async () => {
            try {
              setStatusLoading(true);
              await transferService.updateStatus(transfer.id, nextStatus, token, label);
              await loadTransfer();
            } catch (err) {
              Alert.alert(
                'Hata',
                err instanceof Error ? err.message : 'Durum güncellenemedi'
              );
            } finally {
              setStatusLoading(false);
            }
          })();
        },
      },
    ]);
  };

  const handleSaveQuantity = async (item: AssetTransferItem) => {
    if (!token || !transfer) return;
    try {
      setSubmitting(true);
      await transferService.updateTransferItem(
        transfer.id,
        item.id,
        { transferredQuantity: editQty },
        token
      );
      setEditingItemId(null);
      await loadTransfer();
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Miktar güncellenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <>
        <Stack.Screen options={{ title: 'Transfer Detayı', headerShown: false }} />
        <Loading fullScreen label="Transfer yükleniyor…" />
      </>
    );
  }

  if (!transfer) {
    return (
      <>
        <Stack.Screen options={{ title: 'Transfer Detayı', headerShown: false }} />
        <Screen padded edges={['top', 'left', 'right']}>
          <ScreenHeader title="Transfer Detayı" />
          <ErrorBanner
            message={error || 'Transfer bulunamadı'}
            onRetry={() => {
              setLoading(true);
              void loadTransfer();
            }}
          />
        </Screen>
      </>
    );
  }

  const source = warehouseLabel(transfer.sourceWarehouse, transfer.sourceWarehouseId);
  const target = warehouseLabel(
    transfer.targetWarehouse ??
      (transfer.targetSchool
        ? { id: transfer.targetSchool.id, name: transfer.targetSchool.name }
        : null),
    transfer.targetWarehouseId
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Transfer Detayı', headerShown: false }} />
      <Screen padded={false} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: canComplete ? 100 : spacing['3xl'],
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
        >
          <ScreenHeader
            title={transfer.transferCode || `Transfer #${transfer.id}`}
            subtitle="Transfer detayı"
          />

          {error ? <ErrorBanner message={error} onRetry={() => void loadTransfer()} /> : null}

          <Card style={{ marginBottom: spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.sm,
              }}
            >
              <Text variant="caption">Durum</Text>
              <TransferStatusBadge
                status={transfer.status}
                displayName={transfer.statusDisplayName}
              />
            </View>
            <Text variant="caption" style={{ marginBottom: spacing.xs }}>
              Kaynak → Hedef
            </Text>
            <Text variant="bodyStrong">
              {source} → {target}
            </Text>
            <Text variant="caption" style={{ marginTop: spacing.md }}>
              Transfer tarihi: {formatTransferDateTime(transfer.transferDate)}
            </Text>
            {transfer.notes ? (
              <Text variant="body" style={{ marginTop: spacing.sm }}>
                {transfer.notes}
              </Text>
            ) : null}
          </Card>

          <Section title="Kullanıcılar">
            <Card>
              {transfer.requestedBy ? (
                <Text variant="body">İsteyen: {transfer.requestedBy.fullName}</Text>
              ) : null}
              {transfer.deliveredBy ? (
                <Text variant="body">Gönderen: {transfer.deliveredBy.fullName}</Text>
              ) : null}
              {transfer.receivedBy ? (
                <Text variant="body">Alan: {transfer.receivedBy.fullName}</Text>
              ) : null}
              {!transfer.requestedBy && !transfer.deliveredBy && !transfer.receivedBy ? (
                <Text variant="caption">Kullanıcı bilgisi yok</Text>
              ) : null}
            </Card>
          </Section>

          {canManage ? (
            <TransferStatusActions
              status={transfer.status}
              loading={statusLoading}
              onTransition={handleTransition}
            />
          ) : null}

          {transfer.items && transfer.items.length > 0 ? (
            <Section title="Kalemler">
              {transfer.items.map((item) => {
                const productName =
                  item.product?.name ||
                  (item.productId ? `Ürün #${item.productId}` : 'Ürün');
                const productCode = item.product?.code;
                return (
                  <Card key={item.id} style={{ marginBottom: spacing.md }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        gap: spacing.sm,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyStrong">{productName}</Text>
                        {productCode ? (
                          <Text variant="caption">{productCode}</Text>
                        ) : null}
                      </View>
                      <Text variant="bodyStrong">
                        {item.transferredQuantity ?? 0} / {item.requestedQuantity}
                      </Text>
                    </View>

                    {canEditQty ? (
                      <View style={{ marginTop: spacing.sm }}>
                        {editingItemId === item.id ? (
                          <View style={{ gap: spacing.sm }}>
            <NumberInput
              label="Transfer edilen miktar"
              value={editQty}
              onChangeValue={(v) => setEditQty(v ?? 0)}
              min={0}
              max={item.requestedQuantity}
            />
                            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                              <Button
                                title="Kaydet"
                                size="small"
                                loading={submitting}
                                onPress={() => void handleSaveQuantity(item)}
                              />
                              <Button
                                title="İptal"
                                size="small"
                                variant="ghost"
                                onPress={() => setEditingItemId(null)}
                              />
                            </View>
                          </View>
                        ) : (
                          <Button
                            title="Miktarı düzenle"
                            size="small"
                            variant="outline"
                            onPress={() => {
                              setEditingItemId(item.id);
                              setEditQty(
                                item.transferredQuantity ?? item.requestedQuantity
                              );
                            }}
                          />
                        )}
                      </View>
                    ) : null}

                    {item.transferImagesBase64 && item.transferImagesBase64.length > 0 ? (
                      <View style={{ marginTop: spacing.md }}>
                        <Text variant="caption" style={{ marginBottom: spacing.xs }}>
                          Transfer resimleri
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {item.transferImagesBase64.map((image, imgIndex) => (
                            <TouchableOpacity
                              key={imgIndex}
                              onPress={() => setSelectedImage(image)}
                              style={{ marginRight: 8 }}
                            >
                              <Image
                                source={{ uri: image }}
                                style={{ width: 72, height: 72, borderRadius: 8 }}
                              />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    ) : null}

                    <View style={{ marginTop: spacing.md }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: spacing.xs,
                        }}
                      >
                        <Text variant="caption">Teslim alma resimleri</Text>
                        {canComplete ? (
                          <Button
                            title={
                              item.receiveImagesBase64?.length ? 'Düzenle' : 'Ekle'
                            }
                            size="small"
                            variant="outline"
                            onPress={() => {
                              setSelectedItem(item);
                              setReceiveImages(item.receiveImagesBase64 || []);
                              setShowReceiveImageModal(true);
                            }}
                          />
                        ) : null}
                      </View>
                      {item.receiveImagesBase64 && item.receiveImagesBase64.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {item.receiveImagesBase64.map((image, imgIndex) => (
                            <TouchableOpacity
                              key={imgIndex}
                              onPress={() => setSelectedImage(image)}
                              style={{ marginRight: 8 }}
                            >
                              <Image
                                source={{ uri: image }}
                                style={{ width: 72, height: 72, borderRadius: 8 }}
                              />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      ) : (
                        <Text variant="caption" color={colors.textMuted}>
                          Henüz resim yok
                        </Text>
                      )}
                    </View>
                  </Card>
                );
              })}
            </Section>
          ) : null}
        </ScrollView>

        {canComplete ? (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: spacing.lg,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <Button
              title="Teslim Alındı"
              onPress={() => void handleCompleteTransfer()}
              loading={submitting}
              leftIcon={<Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
            />
          </View>
        ) : null}

        {selectedImage ? (
          <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedImage(null)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.9)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                style={{ position: 'absolute', top: 48, right: 20, zIndex: 10, padding: 8 }}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Image
                source={{ uri: selectedImage }}
                style={{ width: '90%', height: '80%' }}
                resizeMode="contain"
              />
            </View>
          </Modal>
        ) : null}

        <Modal
          visible={showReceiveImageModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowReceiveImageModal(false);
            setSelectedItem(null);
            setReceiveImages([]);
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'flex-end',
            }}
          >
            <View
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 20,
                paddingBottom: 40,
                maxHeight: '90%',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  marginBottom: 12,
                }}
              >
                <Text variant="bodyStrong">Teslim Alma Resimleri</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowReceiveImageModal(false);
                    setSelectedItem(null);
                    setReceiveImages([]);
                  }}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              {selectedItem ? (
                <Text variant="body" style={{ paddingHorizontal: 20, marginBottom: 8 }}>
                  {selectedItem.product?.name || 'Ürün'}
                </Text>
              ) : null}
              <ScrollView style={{ paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {receiveImages.map((image, index) => (
                    <View key={index} style={{ position: 'relative' }}>
                      <Image
                        source={{ uri: image }}
                        style={{ width: 96, height: 96, borderRadius: 8 }}
                      />
                      <TouchableOpacity
                        style={{ position: 'absolute', top: -6, right: -6 }}
                        onPress={() =>
                          setReceiveImages((prev) => prev.filter((_, i) => i !== index))
                        }
                      >
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <Button
                  title="Resim Ekle"
                  variant="outline"
                  onPress={() => void handleAddReceiveImage()}
                  style={{ marginTop: 16 }}
                />
              </ScrollView>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  paddingHorizontal: 20,
                  paddingTop: 16,
                }}
              >
                <Button
                  title="İptal"
                  variant="outline"
                  style={{ flex: 1 }}
                  onPress={() => {
                    setShowReceiveImageModal(false);
                    setSelectedItem(null);
                    setReceiveImages([]);
                  }}
                />
                <Button
                  title="Kaydet"
                  style={{ flex: 1 }}
                  loading={submitting}
                  onPress={() => void handleSaveReceiveImages()}
                />
              </View>
            </View>
          </View>
        </Modal>
      </Screen>
    </>
  );
}
