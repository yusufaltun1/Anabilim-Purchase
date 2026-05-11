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
  FlatList,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
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
import { ParentApproverCandidate, PurchaseRequest, PurchaseRequestApproval, PurchaseRequestAttachment, SendDownCandidate, SupplierQuote } from '@/services/types/purchase.types';

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
  const [returnToUserId, setReturnToUserId] = useState<number | ''>('');
  const [refreshing, setRefreshing] = useState(false);
  const [nextApproverCandidatesList, setNextApproverCandidatesList] = useState<ParentApproverCandidate[]>([]);
  const [nextApproverUserId, setNextApproverUserId] = useState<number | ''>('');
  const [sendToUserId, setSendToUserId] = useState<number | ''>('');
  const [pickModal, setPickModal] = useState<'nextApprover' | 'sendDown' | 'returnTo' | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [returnToOptions, setReturnToOptions] = useState<{ id: number; label: string }[]>([]);
  const [returnToExpanded, setReturnToExpanded] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

      const fetchRequest = async () => {
    if (!id || !token) return;
        setLoading(true);
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

  const selectableNext = nextApproverCandidatesList.filter((c) => c.userId != null);

  const openRejectModal = () => {
    const list = request?.sendDownCandidates?.length
      ? request.sendDownCandidates.map((c) => ({
          id: Number(c.userId),
          label: c.label ? `${c.userName} (${c.label})` : c.userName,
        }))
      : [];
    setReturnToOptions(list);
    setReturnToExpanded(false);
    setModalVisible(true);
  };

  const returnToFullList = [{ id: 0, label: 'Tamamen reddet (talep kapanır)' }, ...returnToOptions];

  const handleApprove = async (completeChain = false) => {
    if (selectableNext.length > 1 && (nextApproverUserId === '' || nextApproverUserId == null)) {
      Alert.alert('Uyarı', 'Birden fazla üst grubunuz var. Lütfen onayı hangi üst gruba ileteceğinizi seçin.');
      return;
    }
    const hasSendDown = Boolean(
      request?.hasNoNextApprover && request.sendDownCandidates && request.sendDownCandidates.length > 0
    );
    if (hasSendDown && !completeChain && (sendToUserId === '' || sendToUserId == null)) {
      Alert.alert('Uyarı', 'İletmek için listeden bir kişi seçin veya Tamamen onayla ile süreci sonlandırın.');
      return;
    }
    setIsSubmitting(true);
    try {
      let sendToUserIdPayload: number | null | undefined = undefined;
      if (request?.hasNoNextApprover) {
        if (hasSendDown) {
          sendToUserIdPayload = completeChain ? null : Number(sendToUserId);
        } else {
          sendToUserIdPayload = null;
        }
      }
      const payload: { comment?: string; nextApproverUserId?: number; sendToUserId?: number | null } = {
        comment: approvalComment.trim() || undefined,
        nextApproverUserId: selectableNext.length >= 1 ? (nextApproverUserId === '' ? selectableNext[0].userId! : nextApproverUserId) : undefined,
        sendToUserId: sendToUserIdPayload,
      };
      await purchaseService.approveRequest(Number(id), token!, payload);
      Alert.alert('Başarılı', 'Talep onaylandı.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to approve request:', error);
      Alert.alert('Hata', (error as Error).message || 'Talep onaylanırken bir sorun oluştu.');
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
      await purchaseService.rejectRequest(Number(id), token!, {
        comment: rejectionReason,
        rejectionReason: rejectionReason,
        returnToUserId: returnToUserId === '' ? null : returnToUserId,
      });
      setModalVisible(false);
      setReturnToUserId('');
      Alert.alert('Başarılı', returnToUserId ? 'Talep seçtiğiniz kişiye geri gönderildi.' : 'Talep reddedildi.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to reject request:', error);
      Alert.alert('Hata', (error as Error).message || 'Talep reddedilirken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
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
  const canApproveOrReject = request.status === 'IN_APPROVAL' || request.status === 'PENDING' || request.status === 'IN_PROGRESS';
  const hasSendDownUi = Boolean(
    request.hasNoNextApprover && request.sendDownCandidates && request.sendDownCandidates.length > 0
  );

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
                  {item.supplierQuotes && item.supplierQuotes.length > 0 && (
                    <View style={[styles.quotesSection, { borderTopColor: colors.border }]}>
                      <ThemedText style={[styles.quotesSectionTitle, { color: colors.text }]}>Teklifler</ThemedText>
                      {item.supplierQuotes.map((quote: SupplierQuote) => {
                        const isSelected = quote.isSelected || (item.selectedSupplierId != null && quote.supplier?.id === item.selectedSupplierId);
                        return (
                          <View key={quote.id} style={[styles.quoteCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <View style={styles.quoteHeader}>
                              <ThemedText style={[styles.quoteSupplierName, { color: colors.text }]} numberOfLines={1}>
                                {quote.supplier?.name ?? '—'}
                              </ThemedText>
                              {isSelected && (
                                <View style={[styles.quoteSelectedBadge, { backgroundColor: '#10B981' }]}>
                                  <ThemedText style={styles.quoteSelectedText}>Seçilen</ThemedText>
                                </View>
                              )}
                            </View>
                            {quote.quoteNumber && (
                              <ThemedText style={[styles.quoteDetail, { color: colors.textSecondary }]}>
                                Teklif no: {quote.quoteNumber}
                              </ThemedText>
                            )}
                            {(quote.unitPrice != null || quote.totalPrice != null) && (
                              <ThemedText style={[styles.quoteDetail, { color: colors.textSecondary }]}>
                                {quote.unitPrice != null && `Birim: ${quote.unitPrice} ${quote.currency ?? 'TRY'}  `}
                                {quote.totalPrice != null && `Toplam: ${quote.totalPrice} ${quote.currency ?? 'TRY'}`}
                              </ThemedText>
                            )}
                            {quote.deliveryDate && (
                              <ThemedText style={[styles.quoteDetail, { color: colors.textSecondary }]}>
                                Teslimat: {formatDate(quote.deliveryDate)}
                              </ThemedText>
                            )}
                            {quote.notes && quote.notes.trim() !== '' && (
                              <ThemedText style={[styles.quoteNotes, { color: colors.textSecondary }]} numberOfLines={2}>
                                {quote.notes}
                              </ThemedText>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
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
            {request.approvals && request.approvals.length > 0 ? (
              <View style={styles.timelineContainer}>
                {([...request.approvals] as typeof request.approvals)
                  .sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0))
                  .map((approval, index, arr) => {
                    const isApproved = approval.status === 'APPROVED';
                    const isRejected = approval.status === 'REJECTED';
                    const isPending = approval.status === 'PENDING';
                    const statusColor = isApproved ? '#10B981' : isRejected ? '#EF4444' : '#F59E0B';
                    const approverName = approval.approver
                      ? [approval.approver.firstName, approval.approver.lastName].filter(Boolean).join(' ') || approval.approver.email || '—'
                      : '—';
                    return (
                      <View key={approval.id} style={styles.timelineRow}>
                        <View style={styles.timelineLeft}>
                          <View style={[styles.timelineDot, { backgroundColor: statusColor }]}>
                            {isPending ? (
                              <ThemedText style={styles.timelineDotNumber}>{approval.stepOrder}</ThemedText>
                            ) : (
                              <Ionicons name={isApproved ? 'checkmark' : 'close'} size={14} color="#FFFFFF" />
                            )}
                          </View>
                          {index < arr.length - 1 && (
                            <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                          )}
                        </View>
                        <View style={[styles.timelineContent, { backgroundColor: colors.backgroundSecondary || '#f8f9fa' }]}>
                          <ThemedText style={[styles.timelineApprover, { color: colors.text }]}>{approverName}</ThemedText>
                          <ThemedText style={[styles.timelineRole, { color: colors.textSecondary }]}>
                            {approval.roleName || 'Onaycı'}
                          </ThemedText>
                          <View style={[styles.timelineStatusBadge, { backgroundColor: statusColor + '22' }]}>
                            <ThemedText style={[styles.timelineStatusText, { color: statusColor }]}>
                              {isApproved ? 'Onaylandı' : isRejected ? 'Reddedildi' : 'Beklemede'}
                            </ThemedText>
                          </View>
                          {approval.actionTakenAt && (
                            <View style={styles.timelineDateRow}>
                              <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                              <ThemedText style={[styles.timelineDateText, { color: colors.textSecondary }]}>
                                {formatDate(approval.actionTakenAt)}
                              </ThemedText>
                            </View>
                          )}
                          {approval.comment && approval.comment.trim() !== '' && (
                            <ThemedText style={[styles.timelineComment, { color: colors.textSecondary }]}>
                              {approval.comment}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                    );
                  })}
              </View>
            ) : (
              <ThemedText style={[styles.timelineEmpty, { color: colors.textSecondary }]}>
                Henüz onay adımı bulunmuyor.
              </ThemedText>
            )}
          </Card>
        </View>

        {/* Onay: Üst grup / Alt kırılım seçimi */}
        {canApproveOrReject && nextApproverCandidatesList.length > 0 && (
          <Card style={[styles.infoCard, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="arrow-up-circle" size={18} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Onayı hangi üst gruba ileteceksiniz?</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.pickerTouch, { borderColor: colors.border }]}
              onPress={() => setPickModal('nextApprover')}
              disabled={selectableNext.length <= 1}
            >
              <ThemedText style={{ color: colors.text }}>
                {selectableNext.length <= 1 && nextApproverCandidatesList.length > 0
                  ? (nextApproverCandidatesList.find((c) => c.userId != null)
                      ? `${nextApproverCandidatesList.find((c) => c.userId != null)!.userName} (${nextApproverCandidatesList.find((c) => c.userId != null)!.groupName})`
                      : 'Tek üst grup')
                  : nextApproverUserId
                    ? nextApproverCandidatesList.find((c) => c.userId === nextApproverUserId)
                      ? `${nextApproverCandidatesList.find((c) => c.userId === nextApproverUserId)!.userName} (${nextApproverCandidatesList.find((c) => c.userId === nextApproverUserId)!.groupName})`
                      : 'Seçin'
                    : '— Seçin —'}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {selectableNext.length <= 1 && (
              <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>Tek üst grubunuz var; onay bu kişiye iletilecek.</ThemedText>
            )}
          </Card>
        )}

        {canApproveOrReject && request.hasNoNextApprover && request.sendDownCandidates && request.sendDownCandidates.length > 0 && (
          <Card style={[styles.infoCard, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="arrow-down-circle" size={18} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Üst onaycı bulunmuyor</ThemedText>
            </View>
            <ThemedText style={[styles.hint, { color: colors.textSecondary, marginBottom: 8 }]}>
              İletmek için kişi seçin. Zinciri sonlandırmak için alttaki Tamamen onayla düğmesini kullanın.
            </ThemedText>
            <TouchableOpacity
              style={[styles.pickerTouch, { borderColor: colors.border }]}
              onPress={() => setPickModal('sendDown')}
            >
              <ThemedText style={{ color: colors.text }}>
                {sendToUserId === ''
                  ? '— İletilecek kişiyi seçin —'
                  : request.sendDownCandidates?.find((c) => c.userId === sendToUserId)
                    ? `${request.sendDownCandidates.find((c) => c.userId === sendToUserId)!.userName} (${request.sendDownCandidates.find((c) => c.userId === sendToUserId)!.label})`
                    : '— İletilecek kişiyi seçin —'}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        )}

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
          <View style={[styles.infoCard, { backgroundColor: colors.background, marginHorizontal: 16, marginBottom: 16 }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
              <ThemedText style={[styles.sectionTitle, { marginLeft: 8 }]}>Onay yorumu (isteğe bağlı)</ThemedText>
            </View>
            <TextInput
              style={[styles.commentInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="Onaylarken eklemek istediğiniz not..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
              value={approvalComment}
              onChangeText={setApprovalComment}
            />
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {canApproveOrReject && (
        <View style={[styles.buttonContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.rejectButton, { backgroundColor: '#EF4444' }]}
            onPress={openRejectModal}
            disabled={isSubmitting}
          >
            <Ionicons name="close-circle" size={20} color="#FFFFFF" />
            <ThemedText style={styles.buttonText}>Reddet</ThemedText>
          </TouchableOpacity>
          {hasSendDownUi ? (
            <View style={{ flex: 2, gap: 8 }}>
              <TouchableOpacity
                style={[
                  styles.approveButton,
                  { backgroundColor: colors.primary, paddingVertical: 12 },
                  (selectableNext.length > 1 && (nextApproverUserId === '' || nextApproverUserId == null)) ||
                  sendToUserId === '' ||
                  sendToUserId == null
                    ? styles.buttonDisabled
                    : undefined,
                ]}
                onPress={() => handleApprove(false)}
                disabled={
                  isSubmitting ||
                  (selectableNext.length > 1 && (nextApproverUserId === '' || nextApproverUserId == null)) ||
                  sendToUserId === '' ||
                  sendToUserId == null
                }
              >
                <Ionicons name="arrow-redo" size={18} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>Kişiye ilet</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.approveButton,
                  {
                    backgroundColor: colors.background,
                    borderWidth: 2,
                    borderColor: colors.primary,
                    paddingVertical: 12,
                  },
                  selectableNext.length > 1 && (nextApproverUserId === '' || nextApproverUserId == null)
                    ? styles.buttonDisabled
                    : undefined,
                ]}
                onPress={() => handleApprove(true)}
                disabled={
                  isSubmitting || (selectableNext.length > 1 && (nextApproverUserId === '' || nextApproverUserId == null))
                }
              >
                <Ionicons name="checkmark-done" size={18} color={colors.primary} />
                <ThemedText style={[styles.buttonText, { color: colors.primary }]}>Tamamen onayla</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.approveButton,
                { backgroundColor: colors.primary },
                selectableNext.length > 1 && (nextApproverUserId === '' || nextApproverUserId == null)
                  ? styles.buttonDisabled
                  : undefined,
              ]}
              onPress={() => handleApprove(false)}
              disabled={
                isSubmitting || (selectableNext.length > 1 && (nextApproverUserId === '' || nextApproverUserId == null))
              }
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Onayla</ThemedText>
            </TouchableOpacity>
          )}
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
            <ThemedText style={[styles.modalLabel, { color: colors.text }]}>Geri gönderilecek kişi</ThemedText>
            <TouchableOpacity
              style={[styles.pickerTouch, { borderColor: colors.border, marginBottom: returnToExpanded ? 0 : 12 }]}
              onPress={() => setReturnToExpanded((v) => !v)}
              activeOpacity={0.7}
            >
              <ThemedText style={{ color: colors.text }} numberOfLines={1}>
                {returnToUserId === '' ? 'Tamamen reddet (talep kapanır)' : returnToOptions.find((c) => c.id === returnToUserId)?.label ?? 'Seçin'}
              </ThemedText>
              <Ionicons name={returnToExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {returnToExpanded && (
              <View style={[styles.returnToList, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <ScrollView style={styles.returnToScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {returnToFullList.map((item) => (
                    <TouchableOpacity
                      key={item.id === 0 ? 'reject' : `r-${item.id}`}
                      style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                      onPress={() => {
                        setReturnToUserId(item.id === 0 ? '' : item.id);
                        setReturnToExpanded(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={styles.pickerItemText}>{item.label}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
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

      {/* Picker modal (üst grup / alt kırılım / geri gönder) */}
      <Modal visible={!!pickModal} transparent animationType="slide">
        <TouchableOpacity style={styles.pickerModalOverlay} activeOpacity={1} onPress={() => setPickModal(null)}>
          <View style={[styles.pickerModalContent, { backgroundColor: colors.background }]}>
            {pickModal === 'nextApprover' && (
              <FlatList
                data={nextApproverCandidatesList}
                keyExtractor={(item) => (item.userId != null ? `u-${item.userId}` : `g-${item.groupName}`)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, item.userId == null && styles.pickerItemDisabled]}
                    onPress={() => { if (item.userId != null) { setNextApproverUserId(item.userId); setPickModal(null); } }}
                    disabled={item.userId == null}
                  >
                    <ThemedText style={[styles.pickerItemText, item.userId == null && { color: colors.textSecondary }]}>
                      {item.userId != null ? `${item.userName} (${item.groupName})` : item.userName}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              />
            )}
            {pickModal === 'sendDown' && request?.sendDownCandidates && (
              <FlatList
                data={request.sendDownCandidates}
                keyExtractor={(item) => `s-${item.userId}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => { setSendToUserId(item.userId); setPickModal(null); }}
                  >
                    <ThemedText style={styles.pickerItemText}>
                      {`${item.userName} (${item.label})`}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              />
            )}
            {pickModal === 'returnTo' && (
              <FlatList
                data={[{ id: 0, label: 'Tamamen reddet (talep kapanır)' }, ...returnToOptions]}
                keyExtractor={(item) => item.id === 0 ? 'reject' : `r-${item.id}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => { setReturnToUserId(item.id === 0 ? '' : item.id); setPickModal(null); }}
                  >
                    <ThemedText style={styles.pickerItemText}>{item.label}</ThemedText>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={[styles.pickerCancel, { borderColor: colors.border }]} onPress={() => setPickModal(null)}>
              <ThemedText style={[styles.pickerCancelText, { color: colors.text }]}>İptal</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  quotesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  quotesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  quoteCard: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  quoteSupplierName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  quoteSelectedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  quoteSelectedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  quoteDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  quoteNotes: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
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
  commentInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 72,
    textAlignVertical: 'top',
    marginTop: 8,
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
  pickerTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 44,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  pickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerModalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '50%',
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  returnToList: {
    maxHeight: 220,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  returnToScroll: {
    maxHeight: 220,
  },
  approvalProcessTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  approvalProcessSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  timelineEmpty: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  timelineContainer: {
    marginLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLeft: {
    width: 28,
    alignItems: 'center',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineDotNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 12,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  timelineApprover: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineRole: {
    fontSize: 12,
    marginBottom: 6,
  },
  timelineStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  timelineStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  timelineDateText: {
    fontSize: 11,
  },
  timelineComment: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    fontStyle: 'italic',
  },
  pickerItemDisabled: {
    opacity: 0.6,
  },
  pickerItemText: {
    fontSize: 16,
  },
  pickerCancel: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  pickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
