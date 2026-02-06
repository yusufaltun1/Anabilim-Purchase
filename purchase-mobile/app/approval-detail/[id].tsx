import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { purchaseService } from '@/services/api/purchase.service';
import { PurchaseRequest } from '@/services/types/purchase.types';

type StatusStyle = {
  text: string;
  color: string;
};

export default function ApprovalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

      const fetchRequest = async () => {
    if (!id || !token) return;
        setLoading(true);
        try {
          const data = await purchaseService.getRequestById(Number(id), token);
          setRequest(data);
        } catch (error) {
          console.error('Failed to fetch request details:', error);
          Alert.alert('Hata', 'Talep detayları alınamadı.');
        } finally {
          setLoading(false);
        }
      };

  useEffect(() => {
    if (id && token) {
      fetchRequest();
    }
  }, [id, token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequest();
    setRefreshing(false);
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await purchaseService.approveRequest(Number(id), token!);
      Alert.alert('Başarılı', 'Talep onaylandı.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to approve request:', error);
      Alert.alert('Hata', 'Talep onaylanırken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Hata', 'Lütfen reddetme nedenini giriniz.');
      return;
    }
    setIsSubmitting(true);
    try {
      await purchaseService.rejectRequest(Number(id), rejectionReason, token!);
      setModalVisible(false);
      Alert.alert('Başarılı', 'Talep reddedildi.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to reject request:', error);
      Alert.alert('Hata', 'Talep reddedilirken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusTranslationAndColor = (status: string): StatusStyle => {
    switch (status) {
      case 'IN_APPROVAL':
        return { text: 'Onayda', color: '#F59E0B' };
      case 'APPROVED':
        return { text: 'Onaylandı', color: '#10B981' };
      case 'REJECTED':
        return { text: 'Reddedildi', color: '#EF4444' };
      case 'PENDING':
        return { text: 'Beklemede', color: '#6B7280' };
      default:
        return { text: status, color: '#000000' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_APPROVAL':
        return 'time-outline';
      case 'APPROVED':
        return 'checkmark-circle';
      case 'REJECTED':
        return 'close-circle';
      case 'PENDING':
        return 'hourglass-outline';
      default:
        return 'document-text';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Yükleniyor...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!request) {
    return (
      <ThemedView style={styles.centerContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
        </View>
        <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>Talep bulunamadı</ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Bu talep mevcut değil veya erişim yetkiniz yok
        </ThemedText>
      </ThemedView>
    );
  }

  const statusStyle = getStatusTranslationAndColor(request.status);
  const canApproveOrReject = request.status === 'IN_APPROVAL' || request.status === 'PENDING';

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: request.title || 'Onay Detayı' }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header Card */}
        <View style={[styles.headerSection, { backgroundColor: colors.primary + '15' }]}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.headerTitle}>{request.title}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.color + '20' }]}>
                <Ionicons name={getStatusIcon(request.status) as any} size={14} color={statusStyle.color} />
                <ThemedText style={[styles.statusText, { color: statusStyle.color }]}>
                  {statusStyle.text}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Description Card */}
          {request.description && (
            <Card style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Açıklama</ThemedText>
              </View>
              <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
                {request.description}
              </ThemedText>
            </Card>
          )}

          {/* Request Info Card */}
          <Card style={[styles.infoCard, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Talep Bilgileri</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="person" size={16} color={colors.textSecondary} />
                <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Talep Eden
                </ThemedText>
                <ThemedText style={styles.infoValue}>
                  {request.requester.firstName} {request.requester.lastName}
                </ThemedText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Oluşturulma</ThemedText>
                <ThemedText style={styles.infoValue}>{formatDate(request.createdAt)}</ThemedText>
              </View>
            </View>
          </Card>

          {/* Products Card */}
          <Card style={[styles.infoCard, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cube" size={18} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>
                Ürünler ({request.items.length})
              </ThemedText>
        </View>

            {request.items.map((item) => (
              <Card key={item.id} style={[styles.productCard, { backgroundColor: colors.backgroundSecondary }]}>
                {item.imageBase64 && (
                  <Image source={{ uri: item.imageBase64 }} style={styles.productImage} />
                )}
                <View style={styles.productInfo}>
                  <ThemedText style={styles.productName}>{item.productName}</ThemedText>
                  <View style={styles.productDetails}>
                    <View style={styles.productDetailRow}>
                      <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
                      <ThemedText style={[styles.productDetailText, { color: colors.textSecondary }]}>
                        Miktar: {item.quantity}
                      </ThemedText>
                    </View>
                    {item.notes && (
                      <View style={styles.productDetailRow}>
                        <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
                        <ThemedText style={[styles.productDetailText, { color: colors.textSecondary }]}>
                          {item.notes}
                        </ThemedText>
                      </View>
                    )}
                  </View>
          </View>
              </Card>
        ))}
          </Card>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {canApproveOrReject && (
        <View style={[styles.buttonContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.rejectButton, { backgroundColor: '#EF4444' }]}
            onPress={() => setModalVisible(true)}
            disabled={isSubmitting}
          >
            <Ionicons name="close-circle" size={20} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>Reddet</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.approveButton, { backgroundColor: colors.primary }]}
            onPress={handleApprove}
            disabled={isSubmitting}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>Onayla</ThemedText>
          </TouchableOpacity>
      </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalView, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                Reddetme Nedenini Girin
              </ThemedText>
            </View>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              multiline
              numberOfLines={4}
              onChangeText={setRejectionReason}
              value={rejectionReason}
              placeholder="Neden reddediyorsunuz?"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={[styles.modalButtonText, { color: colors.text }]}>İptal</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, { backgroundColor: '#EF4444' }]}
                onPress={handleReject}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.modalButtonTextWhite}>Gönder</ThemedText>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSection: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoItem: {
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  productCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  productDetails: {
    gap: 6,
  },
  productDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productDetailText: {
    fontSize: 13,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  approveButton: {
    flex: 1,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 14,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 12,
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
});
