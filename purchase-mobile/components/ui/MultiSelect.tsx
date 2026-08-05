import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { type SelectOption } from './Select';
import { Text } from './Text';

export type MultiSelectProps<T extends string | number = string> = {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  searchable?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  emptyText?: string;
};

export function MultiSelect<T extends string | number = string>({
  label,
  helper,
  error,
  required,
  placeholder = 'Seçiniz',
  options,
  value,
  onChange,
  searchable = true,
  disabled = false,
  containerStyle,
  emptyText = 'Sonuç bulunamadı',
}: MultiSelectProps<T>) {
  const { colors, spacing, radius, fontSize, minTouchTarget, opacity } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<T[]>(value);

  const selectedLabels = options.filter((o) => value.includes(o.value)).map((o) => o.label);
  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= 2
        ? selectedLabels.join(', ')
        : `${selectedLabels.length} seçili`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const openModal = () => {
    setDraft(value);
    setQuery('');
    setOpen(true);
  };

  const toggle = (itemValue: T) => {
    setDraft((prev) =>
      prev.includes(itemValue) ? prev.filter((v) => v !== itemValue) : [...prev, itemValue]
    );
  };

  const confirm = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <View style={[{ marginBottom: spacing.lg }, containerStyle]}>
      {label ? (
        <Text variant="label" style={{ marginBottom: spacing.sm, color: colors.text }}>
          {label}
          {required ? <Text variant="label" color={colors.error}> *</Text> : null}
        </Text>
      ) : null}

      <Pressable
        disabled={disabled}
        onPress={openModal}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        style={({ pressed }) => [
          styles.trigger,
          {
            minHeight: minTouchTarget,
            borderRadius: radius.md,
            borderColor: error ? colors.error : colors.border,
            backgroundColor: disabled ? colors.backgroundMuted : colors.background,
            paddingHorizontal: spacing.lg,
            opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
          },
        ]}
      >
        <Text
          variant="body"
          color={selectedLabels.length ? colors.text : colors.textMuted}
          style={{ flex: 1, fontSize: fontSize.md }}
          numberOfLines={1}
        >
          {summary}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.icon} />
      </Pressable>

      {error ? (
        <Text variant="error" style={{ marginTop: spacing.xs }}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="helper" style={{ marginTop: spacing.xs }}>
          {helper}
        </Text>
      ) : null}

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingHorizontal: spacing.lg }]}>
            <Text variant="h3" style={{ flex: 1 }}>
              {label ?? placeholder}
            </Text>
            <IconButton name="close" onPress={() => setOpen(false)} accessibilityLabel="Kapat" />
          </View>

          {searchable ? (
            <View
              style={[
                styles.search,
                {
                  margin: spacing.lg,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  backgroundColor: colors.backgroundSecondary,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <Ionicons name="search" size={18} color={colors.icon} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Ara..."
                placeholderTextColor={colors.textMuted}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                  color: colors.text,
                  fontSize: fontSize.md,
                }}
              />
            </View>
          ) : null}

          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.value)}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text variant="helper" center style={{ marginTop: spacing['3xl'] }}>
                {emptyText}
              </Text>
            }
            renderItem={({ item }) => {
              const checked = draft.includes(item.value);
              return (
                <Pressable
                  disabled={item.disabled}
                  onPress={() => toggle(item.value)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md,
                      minHeight: minTouchTarget,
                      backgroundColor: pressed ? colors.backgroundMuted : 'transparent',
                      opacity: item.disabled ? opacity.disabled : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={checked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={checked ? colors.primary : colors.icon}
                  />
                  <Text variant="body" style={{ flex: 1, marginLeft: spacing.md }}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />

          <View style={{ padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
            <Button title={`Uygula (${draft.length})`} onPress={confirm} fullWidth />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  search: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
