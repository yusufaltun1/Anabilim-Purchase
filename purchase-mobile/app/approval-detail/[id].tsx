import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { purchaseService } from '@/services/api/purchase.service';
import { ParentApproverCandidate, PurchaseRequest, PurchaseRequestAttachment } from '@/services/types/purchase.types';
import { canUserApprove } from '@/domain/requests/approvalRules';
import {
  markPendingApprovalSeen,
} from '@/domain/home/dashboardPendingSeen';
import {
  ApprovalActionPanel,
  ApprovalTimeline,
  CandidatePickerModal,
  RejectModal,
  RequestHeaderCard,
  SupplierQuoteSection,
  type CandidatePickerOption,
} from '@/components/requests';
import { useCapabilities } from '@/hooks/useCapabilities';
import { useRequestApproval } from '@/hooks/useRequestApproval';

export default function ApprovalDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token, user } = useAuth();
  const { canApprove: canApproveCapability } = useCapabilities();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextApproverCandidatesList, setNextApproverCandidatesList] = useState<ParentApproverCandidate[]>([]);
  const [nextApproverUserId, setNextApproverUserId] = useState<number | ''>('');
  const [sendToUserId, setSendToUserId] = useState<number | ''>('');
  const [pickModal, setPickModal] = useState<'nextApprover' | 'sendDown' | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const {
    isSubmitting,
    approvalComment,
    setApprovalComment,
    rejectVisible,
    rejectionReason,
    setRejectionReason,
    returnToUserId,
    setReturnToUserId,
    returnToCandidates,
    isSerkanBeyApprover,
    hasSendDownUi,
    openRejectModal,
    closeRejectModal,
    handleApprove,
    handleReject,
  } = useRequestApproval({
    requestId: Number(id),
    request,
    nextApproverCandidates: nextApproverCandidatesList,
    nextApproverUserId,
    sendToUserId,
  });

  const fetchRequest = async () => {
    if (!id || !token) return;
    setLoading(true);
    try {
      const data = await purchaseService.getRequestById(Number(id), token);
      setRequest(data);

      const uid = user?.id;
      if (
        uid &&
        data.status === 'IN_APPROVAL' &&
        data.approvals?.some((a) => a.status === 'PENDING' && a.approver?.id === uid)
      ) {
        void markPendingApprovalSeen(uid, Number(id));
      }

      if ((data?.status === 'IN_APPROVAL' || data?.status === 'IN_PROGRESS') && data?.approvals?.some((a: any) => a.status === 'PENDING')) {
        if (data.nextApproverCandidates && data.nextApproverCandidates.length > 0) {
          setNextApproverCandidatesList(data.nextApproverCandidates);
          const one = data.nextApproverCandidates.filter((c: ParentApproverCandidate) => c.userId != null);
          if (one.length === 1) setNextApproverUserId(one[0].userId!);
        } else {
          purchaseService.getFirstApproverCandidates(token).then((list) => {
            setNextApproverCandidatesList(list);
            const one = list.filter((c) => c.userId != null);
            if (one.length === 1) setNextApproverUserId(one[0].userId!);
          }).catch(() => setNextApproverCandidatesList([]));
        }
      } else {
        setNextApproverCandidatesList([]);
        setNextApproverUserId('');
        setSendToUserId('');
      }
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
    } else if (id && !token) {
      setLoading(false);
    }
  }, [id, token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequest();
    setRefreshing(false);
  };

  const handleAddDocument = async () => {
    if (!token || !id) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setUploadingAttachment(true);
      await purchaseService.uploadAttachment(Number(id), token, {
        uri: file.uri,
        name: file.name || 'document',
        type: file.mimeType || 'application/octet-stream',
      });
      await fetchRequest();
      Alert.alert('Başarılı', 'Belge yüklendi.');
    } catch (err) {
      console.error('Belge yükleme hatası:', err);
      Alert.alert('Hata', (err as Error).message || 'Belge yüklenemedi.');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleDownloadAttachment = async (att: PurchaseRequestAttachment) => {
    if (!token || !id) return;
    const url = purchaseService.getAttachmentDownloadUrl(Number(id), att.id);
    const filename = att.fileName || `attachment-${att.id}`;
    const ext = filename.includes('.') ? '' : (att.contentType?.startsWith('image/') ? '.jpg' : '.pdf');
    const cacheDir = FileSystem.cacheDirectory ?? '';
    const localUri = `${cacheDir}${filename}${ext}`;
    try {
      const { uri } = await FileSystem.downloadAsync(url, localUri, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Platform.OS === 'web') {
        (window as unknown as { open: (u: string, target?: string) => void }).open(uri, '_blank');
      } else {
        const canOpen = await Linking.canOpenURL(uri);
        if (canOpen) await Linking.openURL(uri);
        else Alert.alert('Bilgi', 'Dosya indirildi. Uygun uygulama ile açabilirsiniz.');
      }
    } catch (err) {
      console.error('İndirme hatası:', err);
      Alert.alert('Hata', (err as Error).message || 'Belge indirilemedi.');
    }
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

  const canApproveOrReject =
    canApproveCapability && canUserApprove(request, user?.id ?? null);

  const approvalPanelProps = {
    nextApproverCandidates: nextApproverCandidatesList,
    nextApproverUserId,
    onOpenNextApproverPicker: () => setPickModal('nextApprover'),
    hasSendDownUi,
    sendDownCandidates: request.sendDownCandidates ?? [],
    sendToUserId,
    onOpenSendDownPicker: () => setPickModal('sendDown'),
    approvalComment,
    onChangeComment: setApprovalComment,
    isSerkanBeyApprover,
    isSubmitting,
    onApprove: handleApprove,
    onReject: openRejectModal,
  };

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
        <View style={styles.contentContainer}>
          <RequestHeaderCard request={request} />

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
                  <SupplierQuoteSection
                    quotes={item.supplierQuotes}
                    selectedSupplierId={item.selectedSupplierId}
                    onChanged={() => void fetchRequest()}
                  />
                </View>
              </Card>
            ))}
          </Card>

          {/* Onay Süreci - Timeline */}
          <Card style={[styles.infoCard, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <ThemedText style={[styles.approvalProcessTitle, { color: colors.text, marginLeft: 8 }]}>Onay Süreci</ThemedText>
            </View>
            <ThemedText style={[styles.approvalProcessSubtitle, { color: colors.textSecondary }]}>
              Talep onay zinciri, adım sırasına göre
            </ThemedText>
            <ApprovalTimeline approvals={request.approvals ?? []} />
          </Card>

          {/* Belgeler */}
          <Card style={[styles.infoCard, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="attach" size={18} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Belgeler</ThemedText>
            </View>
            <ThemedText style={[styles.attachmentHint, { color: colors.textSecondary }]}>
              PDF veya resim yükleyebilir, sonra indirebilirsiniz.
            </ThemedText>
            {request.attachments && request.attachments.length > 0 && (
              <View style={styles.attachmentList}>
                {request.attachments.map((att) => (
                  <View key={att.id} style={[styles.attachmentRow, { borderColor: colors.border }]}>
                    <Ionicons name={att.contentType?.startsWith('image/') ? 'image' : 'document'} size={20} color={colors.textSecondary} />
                    <ThemedText style={[styles.attachmentFileName, { color: colors.text }]} numberOfLines={1}>
                      {att.fileName}
                    </ThemedText>
                    <TouchableOpacity
                      style={[styles.downloadButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleDownloadAttachment(att)}
                    >
                      <Ionicons name="download-outline" size={18} color="#fff" />
                      <ThemedText style={styles.downloadButtonText}>İndir</ThemedText>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={[styles.addAttachmentButton, { borderColor: colors.border }]}
              onPress={handleAddDocument}
              disabled={uploadingAttachment}
            >
              {uploadingAttachment ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              )}
              <ThemedText style={[styles.addAttachmentText, { color: colors.primary }]}>
                {uploadingAttachment ? 'Yükleniyor...' : 'Belge ekle (PDF veya resim)'}
              </ThemedText>
            </TouchableOpacity>
          </Card>

          {canApproveOrReject && (
            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
              <ApprovalActionPanel {...approvalPanelProps} showFooter={false} />
            </View>
          )}
        </View>
      </ScrollView>

      {canApproveOrReject && (
        <View style={[styles.buttonContainer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingHorizontal: 16 }]}>
          <ApprovalActionPanel {...approvalPanelProps} showSelectors={false} showFooter />
        </View>
      )}

      <RejectModal
        visible={rejectVisible}
        loading={isSubmitting}
        rejectionReason={rejectionReason}
        onChangeReason={setRejectionReason}
        returnToUserId={returnToUserId}
        onChangeReturnTo={setReturnToUserId}
        returnToCandidates={returnToCandidates}
        isSerkanBeyApprover={isSerkanBeyApprover}
        onSubmit={handleReject}
        onClose={closeRejectModal}
      />

      <CandidatePickerModal
        visible={!!pickModal}
        title={
          pickModal === 'nextApprover'
            ? 'Üst onaycı seçin'
            : pickModal === 'sendDown'
              ? 'İletilecek kişiyi seçin'
              : undefined
        }
        onClose={() => setPickModal(null)}
        options={(() => {
          if (pickModal === 'nextApprover') {
            return nextApproverCandidatesList.map((item): CandidatePickerOption => ({
              key: item.userId != null ? `u-${item.userId}` : `g-${item.groupName}`,
              label: item.userId != null ? `${item.userName} (${item.groupName})` : item.userName,
              disabled: item.userId == null,
              onSelect: () => {
                if (item.userId != null) setNextApproverUserId(item.userId);
              },
            }));
          }
          if (pickModal === 'sendDown' && request?.sendDownCandidates) {
            return request.sendDownCandidates.map((item): CandidatePickerOption => ({
              key: `s-${item.userId}`,
              label: `${item.userName} (${item.label})`,
              onSelect: () => setSendToUserId(item.userId),
            }));
          }
          return [];
        })()}
      />
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
  attachmentHint: {
    fontSize: 12,
    marginBottom: 10,
  },
  attachmentList: {
    marginBottom: 12,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    gap: 8,
  },
  attachmentFileName: {
    flex: 1,
    fontSize: 14,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  addAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 8,
  },
  addAttachmentText: {
    fontSize: 14,
    fontWeight: '500',
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
  approvalProcessTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  approvalProcessSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
});
