import { useAppTheme } from '@/hooks/useAppTheme';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Button } from './Button';
import { Text } from './Text';

export type DateTimeFieldProps = {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  value: Date | null;
  onChange: (value: Date | null) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  clearable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

function formatValue(value: Date, mode: 'date' | 'time' | 'datetime') {
  if (mode === 'time') {
    return value.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }
  if (mode === 'datetime') {
    return value.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return value.toLocaleDateString('tr-TR');
}

export function DateTimeField({
  label,
  helper,
  error,
  required,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  clearable = true,
  disabled = false,
  placeholder = 'Tarih seçiniz',
  containerStyle,
}: DateTimeFieldProps) {
  const { colors, spacing, radius, minTouchTarget, opacity } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date());

  const pickerMode = mode === 'datetime' ? 'datetime' : mode;

  const openPicker = () => {
    setDraft(value ?? new Date());
    setOpen(true);
  };

  const onAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    setOpen(false);
    if (event.type === 'set' && selected) {
      onChange(selected);
    }
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
        onPress={openPicker}
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
        <Ionicons name="calendar-outline" size={18} color={colors.icon} style={{ marginRight: spacing.sm }} />
        <Text variant="body" color={value ? colors.text : colors.textMuted} style={{ flex: 1 }} numberOfLines={1}>
          {value ? formatValue(value, mode) : placeholder}
        </Text>
        {clearable && value && !disabled ? (
          <Pressable
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation?.();
              onChange(null);
            }}
            accessibilityLabel="Tarihi temizle"
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
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

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={draft}
          mode={pickerMode === 'datetime' ? 'date' : pickerMode}
          display="default"
          onChange={onAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)} />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.backgroundElevated,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                padding: spacing.lg,
              },
            ]}
          >
            <DateTimePicker
              value={draft}
              mode={pickerMode}
              display="spinner"
              onChange={(_, selected) => {
                if (selected) setDraft(selected);
              }}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              style={{ alignSelf: 'stretch' }}
            />
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Button title="İptal" variant="secondary" onPress={() => setOpen(false)} fullWidth />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Tamam"
                  onPress={() => {
                    onChange(draft);
                    setOpen(false);
                  }}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
