import { useAuth } from '@/contexts/AuthContext';
import {
  getReturnToCandidates,
  isSerkanBeyApprover,
  type ReturnToCandidate,
} from '@/domain/requests/approvalRules';
import { purchaseService } from '@/services/api/purchase.service';
import type { ParentApproverCandidate, PurchaseRequest } from '@/services/types/purchase.types';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

type UseRequestApprovalArgs = {
  requestId: number;
  request: PurchaseRequest | null;
  nextApproverCandidates: ParentApproverCandidate[];
  nextApproverUserId: number | '';
  sendToUserId: number | '';
  onSuccess?: () => void;
};

export function useRequestApproval({
  requestId,
  request,
  nextApproverCandidates,
  nextApproverUserId,
  sendToUserId,
  onSuccess,
}: UseRequestApprovalArgs) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [returnToUserId, setReturnToUserId] = useState<number | null>(null);
  const [approvalComment, setApprovalComment] = useState('');

  const serkanBey = isSerkanBeyApprover(user);
  const selectableNext = useMemo(
    () => nextApproverCandidates.filter((c) => c.userId != null),
    [nextApproverCandidates]
  );
  const hasSendDownUi = Boolean(
    request?.hasNoNextApprover && request.sendDownCandidates && request.sendDownCandidates.length > 0
  );
  const returnToCandidates: ReturnToCandidate[] = useMemo(
    () => (request ? getReturnToCandidates(request) : []),
    [request]
  );

  const finishSuccess = useCallback(
    (message: string) => {
      Alert.alert('Başarılı', message, [
        {
          text: 'Tamam',
          onPress: () => {
            onSuccess?.();
            if (router.canGoBack()) router.back();
          },
        },
      ]);
    },
    [onSuccess, router]
  );

  const openRejectModal = useCallback(() => {
    setRejectionReason('');
    setReturnToUserId(null);
    setRejectVisible(true);
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectVisible(false);
  }, []);

  const handleApprove = useCallback(
    async (completeChain = false) => {
      if (!token || !request) return;
      if (selectableNext.length > 1 && (nextApproverUserId === '' || nextApproverUserId == null)) {
        Alert.alert(
          'Uyarı',
          'Birden fazla üst grubunuz var. Lütfen onayı hangi üst gruba ileteceğinizi seçin.'
        );
        return;
      }
      if (hasSendDownUi && !completeChain && (sendToUserId === '' || sendToUserId == null) && !serkanBey) {
        Alert.alert(
          'Uyarı',
          'İletmek için listeden bir kişi seçin veya Tamamen onayla ile süreci sonlandırın.'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        let sendToUserIdPayload: number | null | undefined = undefined;
        if (request.hasNoNextApprover) {
          if (hasSendDownUi) {
            const noPersonSelected = sendToUserId === '' || sendToUserId == null;
            if (completeChain || (serkanBey && noPersonSelected)) {
              sendToUserIdPayload = null;
            } else {
              sendToUserIdPayload = Number(sendToUserId);
            }
          } else {
            sendToUserIdPayload = null;
          }
        }

        await purchaseService.approveRequest(requestId, token, {
          comment: approvalComment.trim() || undefined,
          nextApproverUserId:
            selectableNext.length >= 1
              ? nextApproverUserId === ''
                ? selectableNext[0].userId!
                : nextApproverUserId
              : undefined,
          sendToUserId: sendToUserIdPayload,
        });

        finishSuccess(
          serkanBey && request.hasNoNextApprover && sendToUserIdPayload == null
            ? 'Talep onaylandı ve satın alma departmanına iletildi.'
            : 'Talep onaylandı.'
        );
      } catch (error) {
        console.error('Failed to approve request:', error);
        Alert.alert('Hata', (error as Error).message || 'Talep onaylanırken bir sorun oluştu.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      token,
      request,
      selectableNext,
      nextApproverUserId,
      hasSendDownUi,
      sendToUserId,
      serkanBey,
      approvalComment,
      requestId,
      finishSuccess,
    ]
  );

  const handleReject = useCallback(async () => {
    if (!token) return;
    if (!rejectionReason.trim()) {
      Alert.alert('Hata', 'Lütfen reddetme nedenini giriniz.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payloadReturnTo = serkanBey ? null : returnToUserId;
      await purchaseService.rejectRequest(requestId, token, {
        comment: rejectionReason,
        rejectionReason,
        returnToUserId: payloadReturnTo,
      });
      setRejectVisible(false);
      finishSuccess(
        payloadReturnTo
          ? 'Talep seçtiğiniz kişiye geri gönderildi.'
          : serkanBey
            ? 'Talep reddedildi ve satın alma sürecine iletildi.'
            : 'Talep reddedildi.'
      );
    } catch (error) {
      console.error('Failed to reject request:', error);
      Alert.alert('Hata', (error as Error).message || 'Talep reddedilirken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  }, [token, rejectionReason, serkanBey, returnToUserId, requestId, finishSuccess]);

  return {
    isSubmitting,
    approvalComment,
    setApprovalComment,
    rejectVisible,
    rejectionReason,
    setRejectionReason,
    returnToUserId,
    setReturnToUserId,
    returnToCandidates,
    isSerkanBeyApprover: serkanBey,
    hasSendDownUi,
    openRejectModal,
    closeRejectModal,
    handleApprove,
    handleReject,
  };
}
