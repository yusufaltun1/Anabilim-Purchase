import { useAppTheme } from '@/hooks/useAppTheme';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';

export type PickedImage = {
  uri: string;
  width?: number;
  height?: number;
  mimeType?: string | null;
  fileName?: string | null;
};

export type ImagePickerFieldProps = {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  value: PickedImage | null;
  onChange: (image: PickedImage | null) => void;
  /** camera | library | both */
  source?: 'camera' | 'library' | 'both';
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function ImagePickerField({
  label,
  helper,
  error,
  required,
  value,
  onChange,
  source = 'both',
  disabled = false,
  containerStyle,
}: ImagePickerFieldProps) {
  const { colors, spacing, radius, opacity } = useAppTheme();

  const fromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Galeri erişimi için izin vermeniz gerekir.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    onChange({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
      fileName: asset.fileName,
    });
  };

  const fromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Kamera erişimi için izin vermeniz gerekir.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    onChange({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
      fileName: asset.fileName,
    });
  };

  const pick = () => {
    if (source === 'camera') {
      void fromCamera();
      return;
    }
    if (source === 'library') {
      void fromLibrary();
      return;
    }
    Alert.alert('Görsel seç', undefined, [
      { text: 'Kamera', onPress: () => void fromCamera() },
      { text: 'Galeri', onPress: () => void fromLibrary() },
      { text: 'İptal', style: 'cancel' },
    ]);
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
        accessibilityLabel={label ?? 'Görsel seç'}
        style={({ pressed }) => ({
          borderWidth: 1,
          borderStyle: 'dashed',
          borderRadius: radius.lg,
          borderColor: error ? colors.error : colors.border,
          backgroundColor: disabled ? colors.backgroundMuted : colors.backgroundSecondary,
          overflow: 'hidden',
          opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
          minHeight: 120,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        {value ? (
          <View style={{ width: '100%' }}>
            <Image source={{ uri: value.uri }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
            <Pressable
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation?.();
                onChange(null);
              }}
              accessibilityLabel="Görseli kaldır"
              style={{
                position: 'absolute',
                top: spacing.sm,
                right: spacing.sm,
                backgroundColor: colors.overlay,
                borderRadius: radius.full,
                padding: spacing.xs,
              }}
            >
              <Ionicons name="close" size={18} color={colors.textInverse} />
            </Pressable>
          </View>
        ) : (
          <View style={{ alignItems: 'center', padding: spacing.lg, gap: spacing.sm }}>
            <Ionicons name="camera-outline" size={28} color={colors.primary} />
            <Text variant="bodyStrong" color={colors.primary}>
              Fotoğraf ekle
            </Text>
            <Text variant="caption">Kamera veya galeri</Text>
          </View>
        )}
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
