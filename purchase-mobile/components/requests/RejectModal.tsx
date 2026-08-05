import { Button, Text, TextArea } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ReturnToCandidate } from '@/domain/requests/approvalRules';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { CandidatePickerModal, type CandidatePickerOption } from './CandidatePickerModal';

export type RejectModalProps = {
  visible: boolean;
  loading?: boolean;
  rejectionReason: string;
  onChangeReason: (value: string) => void;
  returnToUserId: number | null;
  onChangeReturnTo: (userId: number | null) => void;
  returnToCandidates: ReturnToCandidate[];
  /** SERKAN_BEY: return-to gizlenir, CTA değişir */
  isSerkanBeyApprover?: boolean;
  onSubmit: () => void;
  onClose: () => void;
};

export function RejectModal({
  visible,
  loading = false,
  rejectionReason,
  onChangeReason,
  returnToUserId,
  onChangeReturnTo,
  returnToCandidates,
  isSerkanBeyApprover = false,
  onSubmit,
  onClose,
}: RejectModalProps) {
  const { colors, spacing, radius } = useAppTheme();
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    if (returnToUserId == null) return 'Tamamen reddet (talep kapanır)';
    const found = returnToCandidates.find((c) => c.userId === returnToUserId);
    return found ? `${found.userName} (${found.label})` : 'Seçin';
  }, [returnToUserId, returnToCandidates]);

  const pickerOptions: CandidatePickerOption[] = useMemo(
    () => [
      {
        key: 'reject-full',
        label: 'Tamamen reddet (talep kapanır)',
        onSelect: () => onChangeReturnTo(null),
      },
      ...returnToCandidates.map((c) => ({
        key: `r-${c.userId}`,
        label: `${c.userName} (${c.label})`,
        onSelect: () => onChangeReturnTo(c.userId),
      })),
    ],
    [returnToCandidates, onChangeReturnTo]
  );

  const submitTitle = isSerkanBeyApprover ? 'Reddet ve satın almaya ilet' : 'Gönder';

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: colors.overlay,
          }}
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.backgroundElevated,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              padding: spacing.lg,
              gap: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="close-circle" size={24} color={colors.error} />
              <Text variant="h3">Reddetme nedeni</Text>
            </View>

            <TextArea
              label="Gerekçe"
              required
              placeholder="Neden reddediyorsunuz?"
              value={rejectionReason}
              onChangeText={onChangeReason}
              numberOfLines={4}
            />

            {!isSerkanBeyApprover ? (
              <View>
                <Text variant="label" style={{ marginBottom: spacing.sm }}>
                  Geri gönderilecek kişi
                </Text>
                <Pressable
                  onPress={() => setPickerOpen(true)}
                  style={{
                    minHeight: 48,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    paddingHorizontal: spacing.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: colors.background,
                  }}
                >
                  <Text variant="body" numberOfLines={1} style={{ flex: 1, marginRight: spacing.sm }}>
                    {selectedLabel}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.icon} />
                </Pressable>
                <Text variant="helper" style={{ marginTop: spacing.xs }}>
                  Boş bırakırsanız talep tamamen reddedilir.
                </Text>
              </View>
            ) : (
              <Text variant="helper">
                Red sonrası talep satın alma sürecine iletilir; geri gönderme seçimi kullanılmaz.
              </Text>
            )}

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button title="İptal" variant="secondary" onPress={onClose} fullWidth disabled={loading} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={submitTitle}
                  variant="destructive"
                  onPress={onSubmit}
                  loading={loading}
                  fullWidth
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <CandidatePickerModal
        visible={pickerOpen}
        title="Geri gönderilecek kişi"
        options={pickerOptions}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}
