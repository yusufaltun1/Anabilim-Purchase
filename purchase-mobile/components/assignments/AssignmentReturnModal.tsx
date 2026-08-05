import {
  BottomSheet,
  Button,
  FilePickerField,
  ImagePickerField,
  Select,
  Text,
  TextArea,
  useToast,
  type PickedFile,
  type PickedImage,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { assignmentService } from '@/services/api/assignment.service';
import { warehouseService, type Warehouse } from '@/services/api/warehouse.service';
import type { Assignment } from '@/services/types/product.types';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

export type AssignmentReturnModalProps = {
  visible: boolean;
  assignment: Assignment | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    warehouseId: number;
    notes?: string;
    photoUri: string;
    photoName?: string;
    photoMimeType?: string;
    documentUri?: string;
    documentName?: string;
    documentMimeType?: string;
  }) => void | Promise<void>;
};

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function AssignmentReturnModal({
  visible,
  assignment,
  submitting = false,
  onClose,
  onSubmit,
}: AssignmentReturnModalProps) {
  const { token } = useAuth();
  const { spacing } = useAppTheme();
  const { showToast } = useToast();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [document, setDocument] = useState<PickedFile | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formDownloading, setFormDownloading] = useState(false);

  useEffect(() => {
    if (!visible || !token) return;
    setPhoto(null);
    setDocument(null);
    setNotes('');
    setWarehouseId(null);
    setError(null);
    setWarehousesLoading(true);
    warehouseService
      .getActiveWarehouses(token)
      .then((list) => {
        setWarehouses(list);
        if (list.length === 1) setWarehouseId(String(list[0].id));
      })
      .catch(() => {
        setWarehouses([]);
        setError('Depolar yüklenemedi');
      })
      .finally(() => setWarehousesLoading(false));
  }, [visible, assignment?.id, token]);

  const warehouseOptions = useMemo(
    () =>
      warehouses.map((w) => ({
        label: w.code ? `${w.name} (${w.code})` : w.name,
        value: String(w.id),
      })),
    [warehouses]
  );

  const assigneeLabel =
    assignment?.assignedUserName ||
    assignment?.assignedLocationName ||
    assignment?.locationName ||
    '—';

  const handleDownloadReturnForm = async () => {
    if (!assignment || !token) return;
    try {
      setFormDownloading(true);
      setError(null);
      await assignmentService.downloadReturnAssignmentForm(assignment.id, token);
      showToast({ message: 'İade formu indirildi', tone: 'success' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İade formu indirilemedi');
    } finally {
      setFormDownloading(false);
    }
  };

  const handleSubmit = async () => {
    if (!warehouseId) {
      setError('İade için hedef depo seçilmelidir.');
      return;
    }
    if (!photo?.uri) {
      setError('İade için ürün fotoğrafı zorunludur.');
      return;
    }
    if (!document?.uri) {
      setError('İade için imzalı iade formu (.xlsx) yüklemeniz gerekir.');
      return;
    }
    await onSubmit({
      warehouseId: Number(warehouseId),
      notes: notes.trim() || undefined,
      photoUri: photo.uri,
      photoName: photo.fileName || undefined,
      photoMimeType: photo.mimeType || undefined,
      documentUri: document.uri,
      documentName: document.name,
      documentMimeType: document.mimeType || XLSX_MIME,
    });
  };

  return (
    <BottomSheet
      visible={visible && !!assignment}
      onClose={() => {
        if (!submitting) onClose();
      }}
      title="Zimmet iadesi"
      footer={
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Button
              title="Vazgeç"
              variant="secondary"
              onPress={onClose}
              disabled={submitting}
              fullWidth
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title={submitting ? 'İade ediliyor…' : 'İade et'}
              onPress={() => void handleSubmit()}
              loading={submitting}
              fullWidth
            />
          </View>
        </View>
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 480 }}
      >
        <Text variant="body" style={{ marginBottom: spacing.md }}>
          {`${assigneeLabel} üzerindeki zimmet geri alınacak. Önce iade formunu indirip imzalatın, ardından ürün fotoğrafı ve imzalı formu yükleyin.`}
        </Text>

        {warehousesLoading ? (
          <ActivityIndicator style={{ marginVertical: spacing.lg }} />
        ) : (
          <Select
            label="İade deposu"
            required
            options={warehouseOptions}
            value={warehouseId}
            onChange={(v) => {
              setWarehouseId(v);
              setError(null);
            }}
            placeholder="Depo seçin"
            disabled={submitting}
            helper="Ürün stoka bu depoya giriş olarak kaydedilir."
          />
        )}

        <View style={{ marginBottom: spacing.lg, gap: spacing.sm }}>
          <Text variant="label">1. İade formu</Text>
          <Button
            title={formDownloading ? 'İndiriliyor…' : 'İade formunu indir'}
            variant="outline"
            onPress={() => void handleDownloadReturnForm()}
            disabled={submitting || formDownloading}
            loading={formDownloading}
          />
        </View>

        <ImagePickerField
          label="Ürün fotoğrafı"
          required
          value={photo}
          onChange={(img) => {
            setPhoto(img);
            setError(null);
          }}
          source="both"
          disabled={submitting}
        />

        <FilePickerField
          label="İmzalı iade formu"
          required
          value={document}
          onChange={(file) => {
            setDocument(file);
            setError(null);
          }}
          types={[
            XLSX_MIME,
            'application/vnd.ms-excel',
            'application/octet-stream',
          ]}
          helper="Sadece Excel .xlsx dosyası (max 20 MB)"
          disabled={submitting}
        />

        <TextArea
          label="İade notu"
          value={notes}
          onChangeText={setNotes}
          placeholder="Opsiyonel açıklama"
          editable={!submitting}
        />

        {error ? (
          <Text variant="error" style={{ marginTop: spacing.sm }}>
            {error}
          </Text>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}
