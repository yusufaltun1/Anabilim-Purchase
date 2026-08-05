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
import { IconButton } from './IconButton';
import { Text } from './Text';

export type SelectOption<T extends string | number = string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

export type SelectProps<T extends string | number = string> = {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption<T>[];
  value: T | null | undefined;
  onChange: (value: T | null) => void;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  emptyText?: string;
};

export function Select<T extends string | number = string>({
  label,
  helper,
  error,
  required,
  placeholder = 'Seçiniz',
  options,
  value,
  onChange,
  searchable = true,
  clearable = true,
  disabled = false,
  containerStyle,
  emptyText = 'Sonuç bulunamadı',
}: SelectProps<T>) {
  const { colors, spacing, radius, fontSize, minTouchTarget, opacity } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
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
        onPress={() => setOpen(true)}
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
          color={selected ? colors.text : colors.textMuted}
          style={{ flex: 1, fontSize: fontSize.md }}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        {clearable && selected && !disabled ? (
          <Pressable
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation?.();
              onChange(null);
            }}
            accessibilityLabel="Seçimi temizle"
            style={{ marginRight: spacing.xs }}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
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

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingHorizontal: spacing.lg }]}>
            <Text variant="h3" style={{ flex: 1 }}>
              {label ?? placeholder}
            </Text>
            <IconButton name="close" onPress={close} accessibilityLabel="Kapat" />
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
                autoFocus
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Aramayı temizle">
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.value)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
            ListEmptyComponent={
              <Text variant="helper" center style={{ marginTop: spacing['3xl'] }}>
                {emptyText}
              </Text>
            }
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  disabled={item.disabled}
                  onPress={() => {
                    onChange(item.value);
                    close();
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md,
                      minHeight: minTouchTarget,
                      backgroundColor: isSelected
                        ? colors.primaryMuted
                        : pressed
                          ? colors.backgroundMuted
                          : 'transparent',
                      opacity: item.disabled ? opacity.disabled : 1,
                    },
                  ]}
                >
                  <Text
                    variant={isSelected ? 'bodyStrong' : 'body'}
                    color={isSelected ? colors.primary : colors.text}
                    style={{ flex: 1 }}
                  >
                    {item.label}
                  </Text>
                  {isSelected ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
                </Pressable>
              );
            }}
          />
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
  modal: {
    flex: 1,
  },
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
