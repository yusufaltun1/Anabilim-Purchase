import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { purchaseService } from '@/services/api/purchase.service';
import { PurchaseRequest } from '@/services/types/purchase.types';

type StatusStyle = {
  text: string;
  color: string;
};

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const fetchRequestDetail = async () => {
    if (!id || !token) return;
    try {
      const data = await purchaseService.getRequestById(Number(id), token);
      setRequest(data);
    } catch (error) {
      console.error('Failed to fetch request detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      setLoading(true);
      fetchRequestDetail();
    }
  }, [id, token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequestDetail();
    setRefreshing(false);
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
      case 'COMPLETED':
        return { text: 'Tamamlandı', color: '#3B82F6' };
      case 'CANCELLED':
        return { text: 'İptal Edildi', color: '#6B7280' };
      case 'IN_PROGRESS':
        return { text: 'İşlemde', color: '#06B6D4' };
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
      case 'COMPLETED':
        return 'checkmark-done-circle';
      case 'CANCELLED':
        return 'ban';
      case 'IN_PROGRESS':
        return 'sync';
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
  const isRejected = request.status === 'REJECTED';
  const { user } = useAuth();
  const isRequester = user?.email === request.requester.email;

  const handleApprove = async () => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await purchaseService.approveRequest(Number(id), token);
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
    if (!token) return;
    if (!rejectionReason.trim()) {
      Alert.alert('Hata', 'Lütfen reddetme nedenini giriniz.');
      return;
    }
    setIsSubmitting(true);
    try {
      await purchaseService.rejectRequest(Number(id), rejectionReason, token);
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

  return (
    <>
      <Stack.Screen options={{ title: request.title || 'Talep Detayı' }} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header Card */}
        <View style={[styles.headerSection, { backgroundColor: colors.primary + '15' }]}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="document-text" size={32} color={colors.primary} />
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
                  {request.requester.firstName && request.requester.lastName
                    ? `${request.requester.firstName} ${request.requester.lastName}`
                    : request.requester.fullName}
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

          {/* Rejection Reason Card */}
          {isRejected && request.rejectionReason && (
            <Card style={[styles.infoCard, { backgroundColor: '#FEE2E2' }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="close-circle" size={18} color="#DC2626" />
                <ThemedText style={[styles.sectionTitle, { marginLeft: 8, color: '#DC2626' }]}>
                  Red Nedeni
                </ThemedText>
              </View>
              <ThemedText style={[styles.description, { color: '#991B1B' }]}>
                {request.rejectionReason}
              </ThemedText>
            </Card>
          )}

          {/* Approval History Card */}
          {request.approvals && request.approvals.length > 0 && (
            <Card style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={18} color={colors.primary} />
                <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>
                  Onay Geçmişi ({request.approvals.length})
                </ThemedText>
              </View>
              {request.approvals.map((approval, index) => {
                const approvalStatusColor =
                  approval.status === 'APPROVED'
                    ? '#10B981'
                    : approval.status === 'REJECTED'
                      ? '#EF4444'
                      : '#F59E0B';
                return (
                  <View key={approval.id} style={styles.approvalItem}>
                    <View style={styles.approvalHeader}>
                      <View style={[styles.approvalIconContainer, { backgroundColor: approvalStatusColor + '20' }]}>
                        <Ionicons
                          name={
                            approval.status === 'APPROVED'
                              ? 'checkmark-circle'
                              : approval.status === 'REJECTED'
                                ? 'close-circle'
                                : 'time-outline'
                          }
                          size={16}
                          color={approvalStatusColor}
                        />
                      </View>
                      <View style={styles.approvalInfo}>
                        <ThemedText style={styles.approvalStep}>
                          Adım {approval.stepOrder} - {approval.roleName}
                        </ThemedText>
                        {approval.approver && (
                          <ThemedText style={[styles.approvalApprover, { color: colors.textSecondary }]}>
                            {approval.approver.firstName} {approval.approver.lastName}
                          </ThemedText>
                        )}
                      </View>
                      <View style={[styles.approvalStatusBadge, { backgroundColor: approvalStatusColor + '20' }]}>
                        <ThemedText style={[styles.approvalStatusText, { color: approvalStatusColor }]}>
                          {approval.status === 'APPROVED'
                            ? 'Onaylandı'
                            : approval.status === 'REJECTED'
                              ? 'Reddedildi'
                              : 'Bekliyor'}
                        </ThemedText>
                      </View>
                    </View>
                    {approval.comment && (
                      <View style={styles.approvalComment}>
                        <ThemedText style={[styles.approvalCommentText, { color: colors.textSecondary }]}>
                          {approval.comment}
                        </ThemedText>
                      </View>
                    )}
                    {approval.actionTakenAt && (
                      <View style={styles.approvalDate}>
                        <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                        <ThemedText style={[styles.approvalDateText, { color: colors.textSecondary }]}>
                          {formatDate(approval.actionTakenAt)}
                        </ThemedText>
                      </View>
                    )}
                    {index < request.approvals.length - 1 && (
                      <View style={[styles.approvalDivider, { borderTopColor: colors.border }]} />
                    )}
                  </View>
                );
              })}
            </Card>
          )}
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

      {/* Action Buttons for Rejected Requests */}
      {isRejected && isRequester && (
        <View style={[styles.buttonContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: '#3B82F6', borderColor: '#3B82F6' }]}
            onPress={() => router.push(`/edit-request/${id}`)}
            disabled={isSubmitting}
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <ThemedText style={styles.buttonText} numberOfLines={1}>Güncelle</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resubmitButton, { backgroundColor: colors.primary }]}
            onPress={async () => {
              if (!token) return;
              setIsSubmitting(true);
              try {
                await purchaseService.resubmitRequest(Number(id), token);
                Alert.alert('Başarılı', 'Talep tekrar onay sürecine gönderildi.', [
                  { text: 'Tamam', onPress: () => router.back() },
                ]);
              } catch (error: any) {
                console.error('Failed to resubmit request:', error);
                Alert.alert('Hata', error.message || 'Talep tekrar gönderilirken bir sorun oluştu.');
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <ThemedText style={styles.buttonText} numberOfLines={1}>Tekrar Gönder</ThemedText>
              </>
            )}
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
    </>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: 100,
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
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    minWidth: 0,
  },
  resubmitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
    minWidth: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  approvalItem: {
    marginBottom: 16,
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  approvalInfo: {
    flex: 1,
  },
  approvalStep: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  approvalApprover: {
    fontSize: 12,
  },
  approvalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  approvalStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  approvalComment: {
    marginTop: 8,
    paddingLeft: 44,
  },
  approvalCommentText: {
    fontSize: 13,
    lineHeight: 18,
  },
  approvalDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingLeft: 44,
  },
  approvalDateText: {
    fontSize: 11,
  },
  approvalDivider: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 16,
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
