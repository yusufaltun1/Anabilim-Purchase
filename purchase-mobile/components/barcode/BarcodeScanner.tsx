import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const SCAN_FRAME_MAX = 280;

export function BarcodeScanner({ visible, onClose, onScan }: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const frameSize = useMemo(
    () => Math.min(windowWidth * 0.72, SCAN_FRAME_MAX),
    [windowWidth]
  );
  const sideInset = Math.max((windowWidth - frameSize) / 2, 0);
  const verticalInset = Math.max((windowHeight - frameSize) / 2, 0);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission, requestPermission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned && data) {
      setScanned(true);
      onScan(data);
      onClose();
    }
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  if (!visible) {
    return null;
  }

  if (!permission) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent
        presentationStyle="fullScreen"
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={[styles.modalText, { color: colors.text }]}>
              Kamera izni kontrol ediliyor...
            </ThemedText>
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent
        presentationStyle="fullScreen"
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Ionicons name="camera-outline" size={48} color={colors.primary} />
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
              Kamera İzni Gerekli
            </ThemedText>
            <ThemedText style={[styles.modalText, { color: colors.textSecondary }]}>
              Barkod taramak için kamera iznine ihtiyacımız var.
            </ThemedText>
            <TouchableOpacity
              style={[styles.permissionButton, { backgroundColor: colors.primary }]}
              onPress={requestPermission}
            >
              <ThemedText style={styles.permissionButtonText}>İzin Ver</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleClose}
            >
              <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>İptal</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          {...(Platform.OS === 'android' ? { ratio: '16:9' as const } : {})}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              'ean13',
              'ean8',
              'upc',
              'upce',
              'code128',
              'code39',
              'code93',
              'codabar',
              'itf14',
              'qr',
            ],
          }}
        />

        <View style={styles.overlay} pointerEvents="box-none">
          <View style={[styles.overlayDim, { height: verticalInset }]} />

          <View style={[styles.scanRow, { height: frameSize }]}>
            <View style={[styles.overlayDim, { width: sideInset }]} />
            <View style={[styles.scanFrame, { width: frameSize, height: frameSize }]}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={[styles.overlayDim, { width: sideInset }]} />
          </View>

          <View style={[styles.overlayDim, styles.bottomDim]}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <ThemedText style={styles.instructionText}>
              Barkodu tarama alanına yerleştirin
            </ThemedText>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayDim: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanFrame: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  bottomDim: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
