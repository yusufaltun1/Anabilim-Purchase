import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { transferService, AssetTransfer, AssetTransferItem } from '@/services/api/transfer.service';

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

export default function TransferDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const [transfer, setTransfer] = useState<AssetTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showReceiveImageModal, setShowReceiveImageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AssetTransferItem | null>(null);
  const [receiveImages, setReceiveImages] = useState<string[]>([]);

  useEffect(() => {
    if (id && token) {
      loadTransfer();
    }
  }, [id, token]);

  const loadTransfer = async () => {
    if (!id || !token) return;

    try {
      setLoading(true);
      const data = await transferService.getTransferById(Number(id), token);
      setTransfer(data);
    } catch (error: any) {
      console.error('Transfer detayı yüklenirken hata:', error);
      Alert.alert('Hata', error.message || 'Transfer detayı yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransfer();
  };

  const handleAddReceiveImage = async (item: AssetTransferItem) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
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
        const newImages = result.assets.map((asset) => {
          if (asset.base64) {
            return `data:image/jpeg;base64,${asset.base64}`;
          }
          return '';
        }).filter(Boolean);
        
        setReceiveImages([...receiveImages, ...newImages]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu');
    }
  };

  const handleRemoveReceiveImage = (index: number) => {
    setReceiveImages(receiveImages.filter((_, i) => i !== index));
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
      await loadTransfer(); // Transferi yeniden yükle
      Alert.alert('Başarılı', 'Resimler başarıyla kaydedildi.');
    } catch (error: any) {
      console.error('Resimler kaydedilirken hata:', error);
      Alert.alert('Hata', error.message || 'Resimler kaydedilirken bir sorun oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTransfer = async () => {
    if (!user || !token || !transfer) return;

    // Önce tüm item'lar için resim yükleme kontrolü yap
    const itemsWithoutReceiveImages = transfer.items?.filter(
      (item) => !item.receiveImagesBase64 || item.receiveImagesBase64.length === 0
    );

    if (itemsWithoutReceiveImages && itemsWithoutReceiveImages.length > 0) {
      Alert.alert(
        'Resim Gerekli',
        'Tüm kalemler için teslim alma resimleri yüklenmelidir. Resim yüklemek ister misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Resim Yükle',
            onPress: () => {
              // İlk resimsiz item'ı seç
              setSelectedItem(itemsWithoutReceiveImages[0]);
              setReceiveImages([]);
              setShowReceiveImageModal(true);
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Transferi Tamamla',
      'Transferi teslim aldığınızı onaylıyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: async () => {
            try {
              setSubmitting(true);
              await transferService.completeTransfer(transfer.id, user.id, token);
              Alert.alert('Başarılı', 'Transfer başarıyla tamamlandı.', [
                { text: 'Tamam', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              console.error('Transfer tamamlanırken hata:', error);
              Alert.alert('Hata', error.message || 'Transfer tamamlanırken bir sorun oluştu.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  // Teslim alma butonu sadece receivedBy olan kullanıcı için görünür
  // ve transfer durumu IN_TRANSIT, DELIVERED veya PREPARING olmalı
  const canComplete = transfer && user && (
    transfer.status === 'IN_TRANSIT' ||
    transfer.status === 'PREPARING' ||
    transfer.status === 'APPROVED' ||
    transfer.status === 'PENDING'
  ) && (
    transfer.receivedBy?.id === user.id
  );

  if (loading && !refreshing) {
    return (
      <ThemedView style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Transfer Detayı' }} />
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Yükleniyor...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!transfer) {
    return (
      <ThemedView style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Transfer Detayı' }} />
        <ThemedText style={[styles.errorText, { color: colors.text }]}>
          Transfer bulunamadı
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Transfer Detayı' }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Transfer Code */}
        <Card style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="barcode-outline" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Transfer Kodu</ThemedText>
          </View>
          <ThemedText style={[styles.transferCode, { color: colors.text }]}>
            {transfer.transferCode}
          </ThemedText>
        </Card>

        {/* Status */}
        <Card style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Durum</ThemedText>
          </View>
          <ThemedText style={[styles.statusText, { color: colors.text }]}>
            {transfer.statusDisplayName || transfer.status}
          </ThemedText>
        </Card>

        {/* Warehouses */}
        <Card style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Depolar</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Kaynak:</ThemedText>
            <ThemedText style={[styles.value, { color: colors.text }]}>
              {transfer.sourceWarehouse?.name || '-'}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Hedef:</ThemedText>
            <ThemedText style={[styles.value, { color: colors.text }]}>
              {transfer.targetWarehouse?.name || transfer.targetSchool?.name || '-'}
            </ThemedText>
          </View>
        </Card>

        {/* Dates */}
        <Card style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Tarihler</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Transfer Tarihi:</ThemedText>
            <ThemedText style={[styles.value, { color: colors.text }]}>
              {formatDate(transfer.transferDate)}
            </ThemedText>
          </View>
          {transfer.actualTransferDate && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Gerçekleşen Tarih:</ThemedText>
              <ThemedText style={[styles.value, { color: colors.text }]}>
                {formatDate(transfer.actualTransferDate)}
              </ThemedText>
            </View>
          )}
        </Card>

        {/* Users */}
        <Card style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Kullanıcılar</ThemedText>
          </View>
          {transfer.requestedBy && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>İsteyen:</ThemedText>
              <ThemedText style={[styles.value, { color: colors.text }]}>
                {transfer.requestedBy.fullName}
              </ThemedText>
            </View>
          )}
          {transfer.deliveredBy && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Gönderen:</ThemedText>
              <ThemedText style={[styles.value, { color: colors.text }]}>
                {transfer.deliveredBy.fullName}
              </ThemedText>
            </View>
          )}
          {transfer.receivedBy && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Alan:</ThemedText>
              <ThemedText style={[styles.value, { color: colors.text }]}>
                {transfer.receivedBy.fullName}
              </ThemedText>
            </View>
          )}
        </Card>

        {/* Items */}
        {transfer.items && transfer.items.length > 0 && (
          <Card style={[styles.card, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cube-outline" size={20} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Kalemler</ThemedText>
            </View>
            {transfer.items.map((item, index) => (
              <View key={item.id || index} style={styles.itemContainer}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <ThemedText style={[styles.itemName, { color: colors.text }]}>
                      {item.product?.name || 'Ürün'}
                    </ThemedText>
                    <ThemedText style={[styles.itemCode, { color: colors.textSecondary }]}>
                      {item.product?.code || '-'}
                    </ThemedText>
                  </View>
                  <View style={styles.itemQuantity}>
                    <ThemedText style={[styles.quantityText, { color: colors.text }]}>
                      {item.transferredQuantity || item.requestedQuantity} / {item.requestedQuantity}
                    </ThemedText>
                  </View>
                </View>

                {/* Transfer Resimleri */}
                {item.transferImagesBase64 && item.transferImagesBase64.length > 0 && (
                  <View style={styles.imageSection}>
                    <ThemedText style={[styles.imageSectionTitle, { color: colors.textSecondary }]}>
                      Transfer Resimleri
                    </ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                      {item.transferImagesBase64.map((image, imgIndex) => (
                        <TouchableOpacity
                          key={imgIndex}
                          onPress={() => setSelectedImage(image)}
                          style={styles.imageThumbnail}
                        >
                          <Image source={{ uri: image }} style={styles.thumbnailImage} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Teslim Alma Resimleri */}
                <View style={styles.imageSection}>
                  <View style={styles.imageSectionHeader}>
                    <ThemedText style={[styles.imageSectionTitle, { color: colors.textSecondary }]}>
                      Teslim Alma Resimleri
                    </ThemedText>
                    {canComplete && (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedItem(item);
                          setReceiveImages(item.receiveImagesBase64 || []);
                          setShowReceiveImageModal(true);
                        }}
                        style={[styles.addImageButton, { backgroundColor: colors.primary + '20' }]}
                      >
                        <Ionicons name="add-circle" size={20} color={colors.primary} />
                        <ThemedText style={[styles.addImageText, { color: colors.primary }]}>
                          {item.receiveImagesBase64 && item.receiveImagesBase64.length > 0 ? 'Düzenle' : 'Ekle'}
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                  {item.receiveImagesBase64 && item.receiveImagesBase64.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                      {item.receiveImagesBase64.map((image, imgIndex) => (
                        <TouchableOpacity
                          key={imgIndex}
                          onPress={() => setSelectedImage(image)}
                          style={styles.imageThumbnail}
                        >
                          <Image source={{ uri: image }} style={styles.thumbnailImage} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={[styles.noImagesContainer, { backgroundColor: colors.backgroundSecondary }]}>
                      <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                      <ThemedText style={[styles.noImagesText, { color: colors.textSecondary }]}>
                        Henüz resim yüklenmedi
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Notes */}
        {transfer.notes && (
          <Card style={[styles.card, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Notlar</ThemedText>
            </View>
            <ThemedText style={[styles.notesText, { color: colors.text }]}>
              {transfer.notes}
            </ThemedText>
          </Card>
        )}
      </ScrollView>

      {/* Complete Button */}
      {canComplete && (
        <View style={[styles.buttonContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: colors.primary }]}
            onPress={handleCompleteTransfer}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>Teslim Alındı</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Resim Görüntüleme Modal */}
      {selectedImage && (
        <Modal
          visible={!!selectedImage}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.imageModalOverlay}>
            <TouchableOpacity
              style={styles.imageModalCloseButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
          </View>
        </Modal>
      )}

      {/* Teslim Alma Resim Yükleme Modal */}
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
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                Teslim Alma Resimleri
              </ThemedText>
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

            {selectedItem && (
              <View style={styles.modalItemInfo}>
                <ThemedText style={[styles.modalItemName, { color: colors.text }]}>
                  {selectedItem.product?.name || 'Ürün'}
                </ThemedText>
                <ThemedText style={[styles.modalItemCode, { color: colors.textSecondary }]}>
                  {selectedItem.product?.code || '-'}
                </ThemedText>
              </View>
            )}

            <ScrollView style={styles.modalScrollView}>
              {receiveImages.length > 0 ? (
                <View style={styles.imagesGrid}>
                  {receiveImages.map((image, index) => (
                    <View key={index} style={styles.modalImageContainer}>
                      <Image source={{ uri: image }} style={styles.modalImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveReceiveImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.noImagesContainer, { backgroundColor: colors.backgroundSecondary }]}>
                  <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
                  <ThemedText style={[styles.noImagesText, { color: colors.textSecondary }]}>
                    Henüz resim eklenmedi
                  </ThemedText>
                </View>
              )}

              <TouchableOpacity
                style={[styles.addImageButtonLarge, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
                onPress={() => selectedItem && handleAddReceiveImage(selectedItem)}
              >
                <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
                <ThemedText style={[styles.addImageTextLarge, { color: colors.primary }]}>
                  Resim Ekle
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => {
                  setShowReceiveImageModal(false);
                  setSelectedItem(null);
                  setReceiveImages([]);
                }}
              >
                <ThemedText style={[styles.modalButtonText, { color: colors.text }]}>İptal</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveReceiveImages}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.modalButtonTextWhite}>Kaydet</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  transferCode: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  itemContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageSection: {
    marginTop: 12,
  },
  imageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  imageScrollView: {
    marginTop: 8,
  },
  imageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  noImagesContainer: {
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  noImagesText: {
    fontSize: 12,
    marginTop: 8,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: '90%',
    height: '80%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalItemInfo: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalItemCode: {
    fontSize: 14,
  },
  modalScrollView: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  modalImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addImageButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  addImageTextLarge: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextWhite: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCode: {
    fontSize: 12,
  },
  itemQuantity: {
    marginLeft: 16,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
