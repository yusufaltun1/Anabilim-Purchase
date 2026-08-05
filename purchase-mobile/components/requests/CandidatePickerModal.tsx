import { Text } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  View,
  type ListRenderItem,
} from 'react-native';

export type CandidatePickerOption = {
  key: string;
  label: string;
  disabled?: boolean;
  onSelect: () => void;
};

export type CandidatePickerModalProps = {
  visible: boolean;
  title?: string;
  options: CandidatePickerOption[];
  onClose: () => void;
};

export function CandidatePickerModal({
  visible,
  title,
  options,
  onClose,
}: CandidatePickerModalProps) {
  const { colors, spacing, radius } = useAppTheme();

  const renderItem: ListRenderItem<CandidatePickerOption> = ({ item }) => (
    <Pressable
      disabled={item.disabled}
      onPress={() => {
        if (item.disabled) return;
        item.onSelect();
        onClose();
      }}
      style={({ pressed }) => ({
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        opacity: item.disabled ? 0.45 : pressed ? 0.7 : 1,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
      })}
    >
      <Text
        variant="body"
        color={item.disabled ? colors.textMuted : colors.text}
        numberOfLines={2}
      >
        {item.label}
      </Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            maxHeight: '60%',
            backgroundColor: colors.backgroundElevated,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            paddingBottom: spacing.lg,
          }}
        >
          {title ? (
            <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
              <Text variant="h3">{title}</Text>
            </View>
          ) : null}
          <FlatList
            data={options}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
          />
          <Pressable
            onPress={onClose}
            style={{
              marginHorizontal: spacing.lg,
              marginTop: spacing.sm,
              paddingVertical: spacing.md,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
            }}
          >
            <Text variant="bodyStrong">İptal</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
