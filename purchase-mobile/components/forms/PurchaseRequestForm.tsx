import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { purchaseService } from '@/services/api/purchase.service';
import { CreatePurchaseRequestDto, PurchaseRequestItem } from '@/services/types/purchase.types';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface PurchaseRequestFormProps {
  onSuccess?: (request: any) => void;
  onCancel?: () => void;
}

export const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState<CreatePurchaseRequestDto>({
    title: '',
    description: '',
    items: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!validateForm() || !token) return;

    try {
      setIsSubmitting(true);
      const response = await purchaseService.createPurchaseRequest(formData, token);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Talep başarıyla oluşturuldu', [
          { text: 'Tamam', onPress: () => onSuccess?.(response.data) }
        ]);
      } else {
        throw new Error(response.message || 'Talep oluşturulamadı');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Hata',
        error instanceof Error ? error.message : 'Talep oluşturulurken bir hata oluştu'
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
                  <Input
                    label="Teslim Tarihi"
                    placeholder="YYYY-MM-DD"
                    value={item.estimatedDeliveryDate || ''}
                    onChangeText={(value) => updateItem(index, 'estimatedDeliveryDate', value)}
                  />
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
            title="Talep Oluştur"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </ThemedView>
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
});
