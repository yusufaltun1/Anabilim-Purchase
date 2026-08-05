import { CandidatePickerModal, type CandidatePickerOption } from '@/components/requests';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, DateTimeField, ImagePickerField, Input, NumberInput, TextArea } from '@/components/ui';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { validateRequestForm } from '@/domain/requests/requestValidation';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { purchaseService } from '@/services/api/purchase.service';
import type {
  CreatePurchaseRequestDto,
  ParentApproverCandidate,
  PurchaseRequest,
  PurchaseRequestItem,
} from '@/services/types/purchase.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

interface PurchaseRequestFormProps {
  onSuccess?: (request: PurchaseRequest) => void;
  onCancel?: () => void;
  initialData?: PurchaseRequest;
  requestId?: number;
}

type FormItem = Omit<
  PurchaseRequestItem,
  'id' | 'potentialSuppliers' | 'supplierQuotes' | 'selectedSupplierId' | 'createdAt' | 'updatedAt'
>;

function toLocalDateTime(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}:${s}`;
}

function parseOptionalDate(value?: string): Date | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function mapInitialItems(items?: PurchaseRequest['items']): FormItem[] {
  return (
    items?.map((item) => ({
      productName: item.productName || '',
      description: item.description || '',
      quantity: item.quantity || 1,
      imageUrl: item.imageBase64 || item.imageUrl || '',
      productLink: item.productLink || '',
      estimatedDeliveryDate: item.estimatedDeliveryDate || '',
      notes: item.notes || '',
    })) || []
  );
}

export const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  requestId,
}) => {
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];
  const isEditMode = !!initialData && !!requestId;

  const [formData, setFormData] = useState<CreatePurchaseRequestDto>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    items: mapInitialItems(initialData?.items),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstApproverCandidates, setFirstApproverCandidates] = useState<ParentApproverCandidate[]>([]);
  const [firstApproverUserId, setFirstApproverUserId] = useState<number | ''>('');
  const [firstApproverPickVisible, setFirstApproverPickVisible] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setFormData({
      title: initialData.title || '',
      description: initialData.description || '',
      items: mapInitialItems(initialData.items),
    });
  }, [initialData]);

  useEffect(() => {
    if (isEditMode || !token) return;
    purchaseService
      .getFirstApproverCandidates(token)
      .then((list) => {
        setFirstApproverCandidates(list);
        const selectable = list.filter((c) => c.userId != null);
        if (selectable.length === 1) setFirstApproverUserId(selectable[0].userId!);
      })
      .catch(() => setFirstApproverCandidates([]));
  }, [isEditMode, token]);

  const selectableFirstApprovers = useMemo(
    () => firstApproverCandidates.filter((c) => c.userId != null),
    [firstApproverCandidates]
  );

  const firstApproverLabel = useMemo(() => {
    if (selectableFirstApprovers.length <= 1 && selectableFirstApprovers[0]) {
      const c = selectableFirstApprovers[0];
      return `${c.userName} (${c.groupName})`;
    }
    if (firstApproverUserId === '') return '— Seçin —';
    const found = firstApproverCandidates.find((c) => c.userId === firstApproverUserId);
    return found ? `${found.userName} (${found.groupName})` : 'Seçin';
  }, [selectableFirstApprovers, firstApproverUserId, firstApproverCandidates]);

  const addNewItem = () => {
    const newItem: FormItem = {
      productName: '',
      description: '',
      quantity: 1,
      imageUrl: '',
      productLink: '',
      estimatedDeliveryDate: '',
      notes: '',
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = <K extends keyof FormItem>(index: number, field: K, value: FormItem[K]) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const validateForm = () => {
    const requireFirstApprover = !isEditMode && selectableFirstApprovers.length > 1;
    const result = validateRequestForm(
      {
        title: formData.title,
        description: formData.description,
        firstApproverUserId: firstApproverUserId === '' ? null : firstApproverUserId,
        items: formData.items.map((item) => ({
          productName: item.productName || '',
          description: item.description || '',
          quantity: item.quantity || 0,
          productLink: item.productLink,
          estimatedDeliveryDate: item.estimatedDeliveryDate || '',
          notes: item.notes,
          imageBase64: item.imageUrl || item.imageBase64,
          potentialSupplierIds: item.potentialSupplierIds ?? [],
        })),
      },
      { requireFirstApprover }
    );
    if (!result.ok) {
      Alert.alert('Hata', result.message);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !token) return;
    if (
      !isEditMode &&
      selectableFirstApprovers.length > 1 &&
      (firstApproverUserId === '' || firstApproverUserId == null)
    ) {
      Alert.alert('Uyarı', 'Lütfen talebin gideceği ilk onaycıyı seçin.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditMode && requestId) {
        const updateData = {
          title: formData.title,
          description: formData.description,
          items: formData.items.map((item) => ({
            id: null,
            productName: item.productName,
            description: item.description,
            quantity: item.quantity,
            imageBase64: item.imageUrl || item.imageBase64 || '',
            productLink: item.productLink,
            estimatedDeliveryDate: item.estimatedDeliveryDate,
            notes: item.notes,
            potentialSupplierIds: [],
            productId: null,
          })),
        };
        const updatedRequest = await purchaseService.updatePurchaseRequest(requestId, updateData, token);
        Alert.alert('Başarılı', 'Talep başarıyla güncellendi', [
          { text: 'Tamam', onPress: () => onSuccess?.(updatedRequest) },
        ]);
      } else {
        const createPayload: CreatePurchaseRequestDto = {
          title: formData.title,
          description: formData.description,
          firstApproverUserId:
            selectableFirstApprovers.length >= 1
              ? firstApproverUserId === ''
                ? selectableFirstApprovers[0].userId ?? undefined
                : firstApproverUserId
              : undefined,
          items: formData.items.map((item) => ({
            productName: item.productName,
            description: item.description,
            quantity: item.quantity,
            imageBase64: item.imageUrl || item.imageBase64 || '',
            productLink: item.productLink,
            estimatedDeliveryDate: item.estimatedDeliveryDate,
            notes: item.notes,
            potentialSupplierIds: [],
          })),
        };
        const response = await purchaseService.createPurchaseRequest(createPayload, token);
        if (response.success || response.data) {
          Alert.alert('Başarılı', response.message || 'Talep başarıyla oluşturuldu', [
            { text: 'Tamam', onPress: () => onSuccess?.(response.data) },
          ]);
        } else {
          throw new Error(response.message || 'Talep oluşturulamadı');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Hata',
        error instanceof Error
          ? error.message
          : isEditMode
            ? 'Talep güncellenirken bir hata oluştu'
            : 'Talep oluşturulurken bir hata oluştu'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstApproverOptions: CandidatePickerOption[] = firstApproverCandidates.map((item) => ({
    key: item.userId != null ? `u-${item.userId}` : `g-${item.groupName}`,
    label: item.userId != null ? `${item.userName} (${item.groupName})` : item.userName,
    disabled: item.userId == null,
    onSelect: () => {
      if (item.userId != null) setFirstApproverUserId(item.userId);
    },
  }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Card style={styles.sectionCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Talep Bilgileri
          </ThemedText>

          <Input
            label="Başlık"
            required
            placeholder="Talep başlığını giriniz"
            value={formData.title}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, title: value }))}
          />

          <TextArea
            label="Açıklama"
            required
            placeholder="Talep açıklamasını giriniz"
            value={formData.description}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, description: value }))}
            numberOfLines={3}
          />

          {!isEditMode && firstApproverCandidates.length > 0 ? (
            <View style={styles.firstApproverSection}>
              <ThemedText style={styles.inputLabel}>Talebin gideceği ilk onaycı</ThemedText>
              <Pressable
                disabled={selectableFirstApprovers.length <= 1}
                onPress={() => setFirstApproverPickVisible(true)}
                style={[
                  styles.pickerTouch,
                  { borderColor: colors.border, opacity: selectableFirstApprovers.length <= 1 ? 0.75 : 1 },
                ]}
              >
                <ThemedText style={{ color: colors.text, flex: 1 }} numberOfLines={2}>
                  {firstApproverLabel}
                </ThemedText>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </Pressable>
              {selectableFirstApprovers.length <= 1 ? (
                <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>
                  Tek üst grubunuz var; talep bu kişiye iletilecek.
                </ThemedText>
              ) : null}
            </View>
          ) : null}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Ürünler ({formData.items.length})
            </ThemedText>
            <Button title="Ürün Ekle" onPress={addNewItem} variant="outline" size="small" />
          </View>

          {formData.items.map((item, index) => (
            <Card key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <ThemedText style={styles.itemTitle}>Ürün {index + 1}</ThemedText>
                {formData.items.length > 1 ? (
                  <Pressable onPress={() => removeItem(index)} style={styles.removeButton} hitSlop={8}>
                    <Ionicons name="close" size={18} color={colors.error} />
                  </Pressable>
                ) : null}
              </View>

              <Input
                label="Ürün Adı"
                required
                placeholder="Ürün adını giriniz"
                value={item.productName}
                onChangeText={(value) => updateItem(index, 'productName', value)}
              />

              <TextArea
                label="Açıklama"
                required
                placeholder="Ürün açıklaması"
                value={item.description || ''}
                onChangeText={(value) => updateItem(index, 'description', value)}
                numberOfLines={2}
              />

              <NumberInput
                label="Miktar"
                required
                value={item.quantity}
                onChangeValue={(value) => updateItem(index, 'quantity', value ?? 1)}
                min={1}
              />

              <DateTimeField
                label="Tahmini Teslimat"
                required
                mode="date"
                value={parseOptionalDate(item.estimatedDeliveryDate)}
                onChange={(date) =>
                  updateItem(index, 'estimatedDeliveryDate', date ? toLocalDateTime(date) : '')
                }
                minimumDate={new Date()}
                placeholder="Teslimat tarihi seçin"
              />

              <ImagePickerField
                label="Ürün Resmi"
                source="library"
                value={item.imageUrl ? { uri: item.imageUrl } : null}
                onChange={(image) => updateItem(index, 'imageUrl', image?.uri || '')}
              />

              <Input
                label="Ürün Linki"
                placeholder="https://example.com/product"
                value={item.productLink || ''}
                onChangeText={(value) => updateItem(index, 'productLink', value)}
                keyboardType="url"
                autoCapitalize="none"
              />

              <TextArea
                label="Notlar"
                placeholder="Ek notlar"
                value={item.notes || ''}
                onChangeText={(value) => updateItem(index, 'notes', value)}
                numberOfLines={2}
              />
            </Card>
          ))}
        </Card>

        <View style={styles.buttonContainer}>
          <Button title="İptal" onPress={() => onCancel?.()} variant="outline" style={styles.cancelButton} />
          <Button
            title={isEditMode ? 'Güncelle' : 'Talep Oluştur'}
            onPress={() => void handleSubmit()}
            loading={isSubmitting}
            disabled={
              isSubmitting ||
              (!isEditMode &&
                selectableFirstApprovers.length > 1 &&
                (firstApproverUserId === '' || firstApproverUserId == null))
            }
            style={styles.submitButton}
          />
        </View>
      </View>

      <CandidatePickerModal
        visible={firstApproverPickVisible}
        title="İlk onaycı seçin"
        options={firstApproverOptions}
        onClose={() => setFirstApproverPickVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 20 },
  sectionCard: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  itemCard: { marginBottom: 16 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(219, 0, 50, 0.08)',
  },
  buttonContainer: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  cancelButton: { flex: 1 },
  submitButton: { flex: 2 },
  firstApproverSection: { marginBottom: 8 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  pickerTouch: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hint: { fontSize: 12, marginTop: 6 },
});
