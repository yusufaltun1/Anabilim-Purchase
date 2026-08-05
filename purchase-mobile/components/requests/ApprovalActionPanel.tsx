import { Button, Card, Text, TextArea } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ParentApproverCandidate, SendDownCandidate } from '@/services/types/purchase.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

export type ApprovalActionPanelProps = {
  nextApproverCandidates: ParentApproverCandidate[];
  nextApproverUserId: number | '';
  onOpenNextApproverPicker: () => void;
  hasSendDownUi: boolean;
  sendDownCandidates: SendDownCandidate[];
  sendToUserId: number | '';
  onOpenSendDownPicker: () => void;
  approvalComment: string;
  onChangeComment: (value: string) => void;
  isSerkanBeyApprover?: boolean;
  isSubmitting?: boolean;
  onApprove: (completeChain?: boolean) => void;
  onReject: () => void;
  /** Sticky footer; selectors+comment scroll içinde kalır */
  showFooter?: boolean;
  showSelectors?: boolean;
};

function nextApproverLabel(
  candidates: ParentApproverCandidate[],
  selectedId: number | '',
  selectableCount: number
): string {
  if (selectableCount <= 1) {
    const one = candidates.find((c) => c.userId != null);
    return one ? `${one.userName} (${one.groupName})` : 'Tek üst grup';
  }
  if (selectedId === '' || selectedId == null) return '— Seçin —';
  const found = candidates.find((c) => c.userId === selectedId);
  return found ? `${found.userName} (${found.groupName})` : 'Seçin';
}

function sendDownLabel(candidates: SendDownCandidate[], selectedId: number | ''): string {
  if (selectedId === '' || selectedId == null) return '— İletilecek kişiyi seçin —';
  const found = candidates.find((c) => c.userId === selectedId);
  return found ? `${found.userName} (${found.label})` : '— İletilecek kişiyi seçin —';
}

export function ApprovalActionPanel({
  nextApproverCandidates,
  nextApproverUserId,
  onOpenNextApproverPicker,
  hasSendDownUi,
  sendDownCandidates,
  sendToUserId,
  onOpenSendDownPicker,
  approvalComment,
  onChangeComment,
  isSerkanBeyApprover = false,
  isSubmitting = false,
  onApprove,
  onReject,
  showFooter = true,
  showSelectors = true,
}: ApprovalActionPanelProps) {
  const { colors, spacing, radius } = useAppTheme();
  const selectableNext = nextApproverCandidates.filter((c) => c.userId != null);
  const nextRequiredMissing =
    selectableNext.length > 1 && (nextApproverUserId === '' || nextApproverUserId == null);
  const sendDownMissing = sendToUserId === '' || sendToUserId == null;

  return (
    <View>
      {showSelectors ? (
        <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
          {nextApproverCandidates.length > 0 ? (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                <Ionicons name="arrow-up-circle" size={18} color={colors.primary} />
                <Text variant="bodyStrong">Onayı hangi üst gruba ileteceksiniz?</Text>
              </View>
              <Pressable
                disabled={selectableNext.length <= 1}
                onPress={onOpenNextApproverPicker}
                style={{
                  minHeight: 48,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  paddingHorizontal: spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: selectableNext.length <= 1 ? 0.7 : 1,
                }}
              >
                <Text variant="body" style={{ flex: 1, marginRight: spacing.sm }} numberOfLines={2}>
                  {nextApproverLabel(nextApproverCandidates, nextApproverUserId, selectableNext.length)}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.icon} />
              </Pressable>
              {selectableNext.length <= 1 ? (
                <Text variant="helper" style={{ marginTop: spacing.xs }}>
                  Tek üst grubunuz var; onay bu kişiye iletilecek.
                </Text>
              ) : null}
            </Card>
          ) : null}

          {hasSendDownUi ? (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                <Ionicons name="arrow-down-circle" size={18} color={colors.primary} />
                <Text variant="bodyStrong">Üst onaycı bulunmuyor</Text>
              </View>
              <Text variant="helper" style={{ marginBottom: spacing.sm }}>
                {isSerkanBeyApprover
                  ? 'Kişi seçmeden onaylarsanız talep satın alma departmanına iletilir. İsterseniz listeden başka bir kişi de seçebilirsiniz.'
                  : 'İletmek için kişi seçin. Zinciri sonlandırmak için Tamamen onayla düğmesini kullanın.'}
              </Text>
              <Pressable
                onPress={onOpenSendDownPicker}
                style={{
                  minHeight: 48,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  paddingHorizontal: spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text variant="body" style={{ flex: 1, marginRight: spacing.sm }} numberOfLines={2}>
                  {sendDownLabel(sendDownCandidates, sendToUserId)}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.icon} />
              </Pressable>
            </Card>
          ) : null}

          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
              <Text variant="bodyStrong">Onay yorumu (isteğe bağlı)</Text>
            </View>
            <TextArea
              placeholder="Onaylarken eklemek istediğiniz not..."
              value={approvalComment}
              onChangeText={onChangeComment}
              numberOfLines={2}
            />
          </Card>
        </View>
      ) : null}

      {showFooter ? (
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <View style={{ flex: 1 }}>
            <Button
              title="Reddet"
              variant="destructive"
              onPress={onReject}
              disabled={isSubmitting}
              fullWidth
            />
          </View>

          {hasSendDownUi ? (
            <View style={{ flex: 2, gap: spacing.sm }}>
              {isSerkanBeyApprover ? (
                <>
                  <Button
                    title="Satın almaya ilet"
                    onPress={() => onApprove(false)}
                    disabled={isSubmitting || nextRequiredMissing}
                    loading={isSubmitting}
                    fullWidth
                  />
                  <Button
                    title="Seçilen kişiye ilet"
                    variant="outline"
                    onPress={() => onApprove(false)}
                    disabled={isSubmitting || nextRequiredMissing || sendDownMissing}
                    fullWidth
                  />
                </>
              ) : (
                <>
                  <Button
                    title="Kişiye ilet"
                    onPress={() => onApprove(false)}
                    disabled={isSubmitting || nextRequiredMissing || sendDownMissing}
                    loading={isSubmitting}
                    fullWidth
                  />
                  <Button
                    title="Tamamen onayla"
                    variant="outline"
                    onPress={() => onApprove(true)}
                    disabled={isSubmitting || nextRequiredMissing}
                    fullWidth
                  />
                </>
              )}
            </View>
          ) : (
            <View style={{ flex: 2 }}>
              <Button
                title="Onayla"
                onPress={() => onApprove(false)}
                disabled={isSubmitting || nextRequiredMissing}
                loading={isSubmitting}
                fullWidth
              />
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}
