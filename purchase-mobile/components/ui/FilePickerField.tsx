import { useAppTheme } from '@/hooks/useAppTheme';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';

export type PickedFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
};

export type FilePickerFieldProps = {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  value: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  /** MIME type listesi, örn. ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] */
  types?: string[];
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function FilePickerField({
  label,
  helper,
  error,
  required,
  value,
  onChange,
  types,
  disabled = false,
  containerStyle,
}: FilePickerFieldProps) {
  const { colors, spacing, radius, minTouchTarget, opacity } = useAppTheme();

  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: types ?? '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    onChange({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      size: asset.size,
    });
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
        onPress={pick}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Dosya seç'}
        style={({ pressed }) => ({
          minHeight: minTouchTarget,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderRadius: radius.md,
          borderColor: error ? colors.error : colors.border,
          backgroundColor: disabled ? colors.backgroundMuted : colors.backgroundSecondary,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
        })}
      >
        <Ionicons name="document-attach-outline" size={22} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong" color={colors.primary}>
            {value ? 'Dosyayı değiştir' : 'Dosya seç'}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {value?.name ?? 'PDF, XLSX veya belge'}
          </Text>
        </View>
        {value ? (
          <Pressable
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation?.();
              onChange(null);
            }}
            accessibilityLabel="Dosyayı kaldır"
          >
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
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
    </View>
  );
}
