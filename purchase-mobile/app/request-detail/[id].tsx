import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
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
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { purchaseService } from '@/services/api/purchase.service';
import { ParentApproverCandidate, PurchaseRequest, PurchaseRequestAttachment } from '@/services/types/purchase.types';
import { canDeleteRequest, canUserApprove } from '@/domain/requests/approvalRules';
import {
  ApprovalActionPanel,
  ApprovalTimeline,
  CandidatePickerModal,
  RejectModal,
  RequestHeaderCard,
  SupplierQuoteSection,
  type CandidatePickerOption,
} from '@/components/requests';
import { Button } from '@/components/ui';
import { useCapabilities } from '@/hooks/useCapabilities';
import { useRequestApproval } from '@/hooks/useRequestApproval';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextApproverCandidatesList, setNextApproverCandidatesList] = useState<ParentApproverCandidate[]>([]);
  const [nextApproverUserId, setNextApproverUserId] = useState<number | ''>('');
  const [sendToUserId, setSendToUserId] = useState<number | ''>('');
  const [pickModal, setPickModal] = useState<'nextApprover' | 'sendDown' | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const { token, user } = useAuth();
  const { canApprove: canApproveCapability, hasCapability } = useCapabilities();
  const canEditCapability = hasCapability('REQUEST_EDIT');
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];
  const [isDeleting, setIsDeleting] = useState(false);

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

  const fetchRequestDetail = async () => {
    if (!id || !token) return;
    try {
      const data = await purchaseService.getRequestById(Number(id), token);
      setRequest(data);
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
      console.error('Failed to fetch request detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      setLoading(true);
      fetchRequestDetail();
    } else if (id && !token) {
      setLoading(false);
    }
  }, [id, token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequestDetail();
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
      await fetchRequestDetail();
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
  const isRejected = request.status === 'REJECTED';
  const isRequester = user?.email === request.requester.email;
  const canDelete = canDeleteRequest(request, user?.id, canEditCapability);

  const handleDeleteRequest = () => {
    if (!token || !id) return;
    Alert.alert('Talebi sil', 'Bu talebi silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              setIsDeleting(true);
              await purchaseService.deleteRequest(Number(id), token);
              Alert.alert('Başarılı', 'Talep silindi.', [
                { text: 'Tamam', onPress: () => router.back() },
              ]);
            } catch (err) {
              console.error('Delete request failed:', err);
              Alert.alert(
                'Hata',
                err instanceof Error ? err.message : 'Talep silinirken bir hata oluştu'
              );
            } finally {
              setIsDeleting(false);
            }
          })();
        },
      },
    ]);
  };

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
    <>
      <Stack.Screen options={{ title: request.title || 'Talep Detayı' }} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.contentContainer}>
          <RequestHeaderCard request={request} />

          {canDelete ? (
            <View style={{ marginHorizontal: 16, marginBottom: 12, alignItems: 'flex-end' }}>
              <Button
                title="Sil"
                onPress={handleDeleteRequest}
                variant="destructive"
                size="small"
                loading={isDeleting}
                disabled={isDeleting}
              />
            </View>
          ) : null}

          {/* Products Card */}
          <Card style={StyleSheet.flatten([styles.infoCard, { backgroundColor: colors.background }])}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cube" size={18} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>
                Ürünler ({request.items.length})
              </ThemedText>
            </View>

            {request.items.map((item) => (
              <Card key={item.id} style={StyleSheet.flatten([styles.productCard, { backgroundColor: colors.backgroundSecondary }])}>
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
                    onChanged={() => void fetchRequestDetail()}
                  />
                </View>
              </Card>
            ))}
          </Card>

          {/* Onay Süreci */}
          <Card style={StyleSheet.flatten([styles.infoCard, { backgroundColor: colors.background }])}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Onay Süreci</ThemedText>
            </View>
            <ApprovalTimeline approvals={request.approvals ?? []} />
          </Card>

          {/* Belgeler */}
          <Card style={StyleSheet.flatten([styles.infoCard, { backgroundColor: colors.background }])}>
            <View style={styles.sectionHeader}>
              <Ionicons name="attach" size={18} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Belgeler</ThemedText>
            </View>
            <ThemedText style={[styles.attachmentHint, { color: colors.textSecondary }]}>
              PDF veya resim yükleyebilir, sonra indirebilirsiniz.
            </ThemedText>
            {(request.attachments && request.attachments.length > 0) && (
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

          {/* Rejection Reason Card */}
          {isRejected && request.rejectionReason && (
            <Card style={StyleSheet.flatten([styles.infoCard, { backgroundColor: '#FEE2E2' }])}>
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

      {/* Action Buttons for Rejected Requests */}
      {isRejected && isRequester && (
        <View style={[styles.buttonContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: '#3B82F6', borderColor: '#3B82F6' }]}
            onPress={() => router.push(`/edit-request/${id}`)}
            disabled={isResubmitting}
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <ThemedText style={styles.buttonText} numberOfLines={1}>Güncelle</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resubmitButton, { backgroundColor: colors.primary }]}
            onPress={async () => {
              if (!token) return;
              setIsResubmitting(true);
              try {
                await purchaseService.resubmitRequest(Number(id), token);
                Alert.alert('Başarılı', 'Talep tekrar onay sürecine gönderildi.', [
                  { text: 'Tamam', onPress: () => router.back() },
                ]);
              } catch (error: any) {
                console.error('Failed to resubmit request:', error);
                Alert.alert('Hata', error.message || 'Talep tekrar gönderilirken bir sorun oluştu.');
              } finally {
                setIsResubmitting(false);
              }
            }}
            disabled={isResubmitting}
          >
            {isResubmitting ? (
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
});
