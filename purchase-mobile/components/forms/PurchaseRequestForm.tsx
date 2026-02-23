import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { purchaseService } from '@/services/api/purchase.service';
import { CreatePurchaseRequestDto, ParentApproverCandidate, PurchaseRequest, PurchaseRequestItem } from '@/services/types/purchase.types';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface PurchaseRequestFormProps {
  onSuccess?: (request: any) => void;
  onCancel?: () => void;
  initialData?: PurchaseRequest; // Edit modu için
  requestId?: number; // Edit modu için
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
    items: initialData?.items?.map(item => ({
      productName: item.productName || '',
      description: item.description || '',
      quantity: item.quantity || 1,
      imageUrl: item.imageBase64 || '',
      productLink: item.productLink || '',
      estimatedDeliveryDate: item.estimatedDeliveryDate || '',
      notes: item.notes || '',
    })) || [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        items: initialData.items?.map(item => ({
          productName: item.productName || '',
          description: item.description || '',
          quantity: item.quantity || 1,
          imageUrl: item.imageBase64 || '',
          productLink: item.productLink || '',
          estimatedDeliveryDate: item.estimatedDeliveryDate || '',
          notes: item.notes || '',
        })) || [],
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (!isEditMode && token) {
      purchaseService.getFirstApproverCandidates(token).then((list) => {
        setFirstApproverCandidates(list);
        const selectable = list.filter((c) => c.userId != null);
        if (selectable.length === 1) setFirstApproverUserId(selectable[0].userId!);
      }).catch(() => setFirstApproverCandidates([]));
    }
  }, [isEditMode, token]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<{ itemIndex: number; show: boolean }>({
    itemIndex: -1,
    show: false,
  });
  const [firstApproverCandidates, setFirstApproverCandidates] = useState<ParentApproverCandidate[]>([]);
  const [firstApproverUserId, setFirstApproverUserId] = useState<number | ''>('');
  const [firstApproverPickVisible, setFirstApproverPickVisible] = useState(false);

  const addNewItem = () => {
    const newItem: Omit<PurchaseRequestItem, 'id' | 'potentialSuppliers' | 'supplierQuotes' | 'selectedSupplierId' | 'createdAt' | 'updatedAt'> = {
      productName: '',
      description: '',
      quantity: 1,
      imageUrl: '',
      productLink: '',
      estimatedDeliveryDate: '',
      notes: '',
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Tarihi LocalDateTime formatına çevir (YYYY-MM-DDTHH:mm:ss)
  const formatDateToLocalDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // String tarihi Date objesine çevir
  const parseDateFromString = (dateString: string | undefined): Date => {
    if (!dateString) return new Date();
    try {
      return new Date(dateString);
    } catch {
      return new Date();
    }
  };

  // Tarih seçimi için date picker'ı göster
  const handleDatePickerOpen = (itemIndex: number) => {
    setShowDatePicker({ itemIndex, show: true });
  };

  // Tarih seçildiğinde
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker({ itemIndex: -1, show: false });
    
    if (event.type === 'set' && selectedDate && showDatePicker.itemIndex >= 0) {
      const formattedDate = formatDateToLocalDateTime(selectedDate);
      updateItem(showDatePicker.itemIndex, 'estimatedDeliveryDate', formattedDate);
    }
  };

  // Tarihi görüntülemek için formatla (DD.MM.YYYY)
  const formatDateForDisplay = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return '';
    }
  };


  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Hata', 'Başlık gereklidir');
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert('Hata', 'Açıklama gereklidir');
      return false;
    }

    if (formData.items.length === 0) {
      Alert.alert('Hata', 'En az bir ürün eklemelisiniz');
      return false;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      
      if (!item.productName.trim()) {
        Alert.alert('Hata', `${i + 1}. ürün için ürün adı gereklidir`);
        return false;
      }

      if (item.quantity <= 0) {
        Alert.alert('Hata', `${i + 1}. ürün için geçerli bir miktar giriniz`);
        return false;
      }

    }

    return true;
  };

  const handleImageUpload = async (itemIndex: number) => {
    try {
      // İzin kontrolü
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('İzin Gerekli', 'Galeri erişimi için izin gereklidir');
        return;
      }

      // Resim seçimi
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        updateItem(itemIndex, 'imageUrl', imageUri);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Hata', 'Dosya yüklenirken bir hata oluştu');
    }
  };

  const selectableFirstApprovers = firstApproverCandidates.filter((c) => c.userId != null);
  const handleSubmit = async () => {
    if (!validateForm() || !token) return;
    if (!isEditMode && selectableFirstApprovers.length > 1 && (firstApproverUserId === '' || firstApproverUserId == null)) {
      Alert.alert('Uyarı', 'Lütfen talebin gideceği ilk onaycıyı seçin.');
      return;
    }
    try {
      setIsSubmitting(true);
      
      if (isEditMode && requestId) {
        // Edit modu - güncelleme
        const updateData = {
          title: formData.title,
          description: formData.description,
          items: formData.items.map(item => ({
            id: null, // Yeni item için null
            productName: item.productName,
            description: item.description,
            quantity: item.quantity,
            imageBase64: item.imageUrl,
            productLink: item.productLink,
            estimatedDeliveryDate: item.estimatedDeliveryDate,
            notes: item.notes,
            potentialSupplierIds: [],
            productId: null,
          })),
        };
        
        const updatedRequest = await purchaseService.updatePurchaseRequest(requestId, updateData, token);
        Alert.alert('Başarılı', 'Talep başarıyla güncellendi', [
          { text: 'Tamam', onPress: () => onSuccess?.(updatedRequest) }
        ]);
      } else {
        // Create modu - oluşturma
        const createPayload: CreatePurchaseRequestDto = {
          ...formData,
          firstApproverUserId: selectableFirstApprovers.length >= 1
            ? (firstApproverUserId === '' ? (selectableFirstApprovers[0].userId ?? undefined) : firstApproverUserId)
            : undefined,
        };
        const response = await purchaseService.createPurchaseRequest(createPayload, token);
        
        // Response başarılı ise (success true veya data varsa)
        if (response.success || response.data) {
          Alert.alert('Başarılı', response.message || 'Talep başarıyla oluşturuldu', [
            { text: 'Tamam', onPress: () => onSuccess?.(response.data) }
          ]);
        } else {
          throw new Error(response.message || 'Talep oluşturulamadı');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Hata',
        error instanceof Error ? error.message : (isEditMode ? 'Talep güncellenirken bir hata oluştu' : 'Talep oluşturulurken bir hata oluştu')
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.form}>
        {/* Ana Bilgiler */}
        <Card style={styles.sectionCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Talep Bilgileri
          </ThemedText>
          
          <Input
            label="Başlık *"
            placeholder="Talep başlığını giriniz"
            value={formData.title}
            onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
          />
          
          <Input
            label="Açıklama *"
            placeholder="Talep açıklamasını giriniz"
            value={formData.description}
            onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
            multiline
            numberOfLines={3}
          />

          {!isEditMode && firstApproverCandidates.length > 0 && (
            <View style={styles.firstApproverSection}>
              <ThemedText style={styles.inputLabel}>Talebin gideceği ilk onaycı</ThemedText>
              <TouchableOpacity
                style={[styles.pickerTouch, { borderColor: colors.border }]}
                onPress={() => setFirstApproverPickVisible(true)}
                disabled={selectableFirstApprovers.length <= 1}
              >
                <ThemedText style={{ color: colors.text }}>
                  {selectableFirstApprovers.length <= 1 && selectableFirstApprovers[0]
                    ? `${selectableFirstApprovers[0].userName} (${selectableFirstApprovers[0].groupName})`
                    : firstApproverUserId
                      ? firstApproverCandidates.find((c) => c.userId === firstApproverUserId)
                        ? `${firstApproverCandidates.find((c) => c.userId === firstApproverUserId)!.userName} (${firstApproverCandidates.find((c) => c.userId === firstApproverUserId)!.groupName})`
                        : 'Seçin'
                      : '— Seçin —'}
                </ThemedText>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              {selectableFirstApprovers.length <= 1 && (
                <ThemedText style={[styles.hint, { color: colors.textSecondary }]}>Tek üst grubunuz var; talep bu kişiye iletilecek.</ThemedText>
              )}
            </View>
          )}
        </Card>

        {/* Ürünler */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Ürünler ({formData.items.length})
            </ThemedText>
            <Button
              title="Ürün Ekle"
              onPress={() => addNewItem()}
              variant="outline"
              size="small"
            />
          </View>

          {formData.items.map((item, index) => (
            <Card key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <ThemedText style={styles.itemTitle}>
                  Ürün {index + 1}
                </ThemedText>
                {formData.items.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeItem(index)}
                    style={styles.removeButton}
                  >
                    <ThemedText style={[styles.removeButtonText, { color: colors.error }]}>
                      ✕
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              <Input
                label="Ürün Adı *"
                placeholder="Ürün adını giriniz"
                value={item.productName}
                onChangeText={(value) => updateItem(index, 'productName', value)}
              />

              <Input
                label="Açıklama"
                placeholder="Ürün açıklaması"
                value={item.description || ''}
                onChangeText={(value) => updateItem(index, 'description', value)}
                multiline
                numberOfLines={2}
              />

              <View style={styles.quantityRow}>
                <View style={styles.quantityInput}>
                  <Input
                    label="Miktar *"
                    placeholder="1"
                    value={item.quantity.toString()}
                    onChangeText={(value) => updateItem(index, 'quantity', parseInt(value) || 1)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.dateInput}>
                  <ThemedText style={styles.dateLabel}>Teslim Tarihi</ThemedText>
                  <TouchableOpacity
                    style={[styles.datePickerButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                    onPress={() => handleDatePickerOpen(index)}
                  >
                    <ThemedText style={[styles.datePickerText, { color: item.estimatedDeliveryDate ? colors.text : colors.textSecondary }]}>
                      {item.estimatedDeliveryDate ? formatDateForDisplay(item.estimatedDeliveryDate) : '📅 Tarih seç'}
                    </ThemedText>
                  </TouchableOpacity>
                  {showDatePicker.show && showDatePicker.itemIndex === index && Platform.OS === 'android' && (
                    <DateTimePicker
                      value={parseDateFromString(item.estimatedDeliveryDate)}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                  {Platform.OS === 'ios' && showDatePicker.show && showDatePicker.itemIndex === index && (
                    <View style={styles.iosDatePickerPlaceholder} />
                  )}
                </View>
              </View>

              {/* Dosya Yükleme */}
              <View style={styles.fileUploadSection}>
                <ThemedText style={styles.fileUploadLabel}>
                  Ürün Resmi
                </ThemedText>
                <TouchableOpacity
                  style={[styles.fileUploadButton, { borderColor: colors.border }]}
                  onPress={() => handleImageUpload(index)}
                >
                  <ThemedText style={[styles.fileUploadText, { color: colors.textSecondary }]}>
                    {item.imageUrl ? '📷 Resim seçildi' : '📷 Resim seç'}
                  </ThemedText>
                </TouchableOpacity>
                {item.imageUrl && (
                  <TouchableOpacity
                    onPress={() => updateItem(index, 'imageUrl', '')}
                    style={styles.removeFileButton}
                  >
                    <ThemedText style={[styles.removeFileText, { color: colors.error }]}>
                      ✕ Kaldır
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              <Input
                label="Ürün Linki"
                placeholder="https://example.com/product"
                value={item.productLink || ''}
                onChangeText={(value) => updateItem(index, 'productLink', value)}
                keyboardType="url"
              />

              <Input
                label="Notlar"
                placeholder="Ek notlar"
                value={item.notes || ''}
                onChangeText={(value) => updateItem(index, 'notes', value)}
                multiline
                numberOfLines={2}
              />

            </Card>
          ))}
        </Card>

        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <Button
            title="İptal"
            onPress={() => onCancel?.()}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title={isEditMode ? 'Güncelle' : 'Talep Oluştur'}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || (!isEditMode && selectableFirstApprovers.length > 1 && (firstApproverUserId === '' || firstApproverUserId == null))}
            style={styles.submitButton}
          />
        </View>
      </ThemedView>

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && showDatePicker.show && (
        <Modal
          transparent
          animationType="slide"
          visible={showDatePicker.show}
          onRequestClose={() => setShowDatePicker({ itemIndex: -1, show: false })}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowDatePicker({ itemIndex: -1, show: false })}
                >
                  <ThemedText style={[styles.modalButton, { color: colors.primary }]}>
                    İptal
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>Tarih Seç</ThemedText>
                <TouchableOpacity
                  onPress={() => {
                    if (showDatePicker.itemIndex >= 0) {
                      const item = formData.items[showDatePicker.itemIndex];
                      const selectedDate = parseDateFromString(item.estimatedDeliveryDate);
                      const formattedDate = formatDateToLocalDateTime(selectedDate);
                      updateItem(showDatePicker.itemIndex, 'estimatedDeliveryDate', formattedDate);
                    }
                    setShowDatePicker({ itemIndex: -1, show: false });
                  }}
                >
                  <ThemedText style={[styles.modalButton, { color: colors.primary }]}>
                    Tamam
                  </ThemedText>
                </TouchableOpacity>
              </View>
              {showDatePicker.itemIndex >= 0 && (
                <DateTimePicker
                  value={parseDateFromString(formData.items[showDatePicker.itemIndex]?.estimatedDeliveryDate)}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    // iOS'ta sadece "Tamam" butonuna basıldığında kaydedilecek
                    // Bu yüzden burada sadece state'i güncelliyoruz
                    if (date && showDatePicker.itemIndex >= 0) {
                      const formattedDate = formatDateToLocalDateTime(date);
                      updateItem(showDatePicker.itemIndex, 'estimatedDeliveryDate', formattedDate);
                    }
                  }}
                  minimumDate={new Date()}
                  style={styles.datePickerIOS}
                />
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* İlk onaycı seçim modal */}
      <Modal visible={firstApproverPickVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.pickerModalOverlay} activeOpacity={1} onPress={() => setFirstApproverPickVisible(false)}>
          <View style={[styles.pickerModalContent, { backgroundColor: colors.background }]}>
            <FlatList
              data={firstApproverCandidates}
              keyExtractor={(item) => (item.userId != null ? `u-${item.userId}` : `g-${item.groupName}`)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, item.userId == null && styles.pickerItemDisabled]}
                  onPress={() => {
                    if (item.userId != null) {
                      setFirstApproverUserId(item.userId);
                      setFirstApproverPickVisible(false);
                    }
                  }}
                  disabled={item.userId == null}
                >
                  <ThemedText style={[styles.pickerItemText, item.userId == null && { color: colors.textSecondary }]}>
                    {item.userId != null ? `${item.userName} (${item.groupName})` : item.userName}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[styles.pickerCancel, { borderColor: colors.border }]} onPress={() => setFirstApproverPickVisible(false)}>
              <ThemedText style={[styles.pickerCancelText, { color: colors.text }]}>İptal</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  form: {
    padding: 20,
  },
  sectionCard: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  itemCard: {
    marginBottom: 16,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInput: {
    flex: 1,
  },
  dateInput: {
    flex: 2,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  datePickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerIOS: {
    height: 200,
  },
  iosDatePickerPlaceholder: {
    height: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  fileUploadSection: {
    marginTop: 16,
  },
  fileUploadLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  fileUploadButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  fileUploadText: {
    fontSize: 14,
  },
  removeFileButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  removeFileText: {
    fontSize: 12,
    fontWeight: '500',
  },
  firstApproverSection: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 44,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
  },
  pickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerModalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '50%',
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  pickerItemDisabled: {
    opacity: 0.6,
  },
  pickerItemText: {
    fontSize: 16,
  },
  pickerCancel: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  pickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
