import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { productService } from '@/services/api/product.service';
import { categoryService, Category } from '@/services/api/category.service';

type ProductType = 'CONSUMABLE' | 'SEMI_FIXED_ASSET' | 'FIXED_ASSET';
type UnitOfMeasure = 'PIECE' | 'METER' | 'LITER' | 'KILOGRAM';

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'CONSUMABLE', label: 'Sarf Malzemesi' },
  { value: 'SEMI_FIXED_ASSET', label: 'Yarı Sabit Kıymet' },
  { value: 'FIXED_ASSET', label: 'Sabit Kıymet' },
];

const UNIT_OF_MEASURES: { value: UnitOfMeasure; label: string }[] = [
  { value: 'PIECE', label: 'Adet' },
  { value: 'METER', label: 'Metre' },
  { value: 'LITER', label: 'Litre' },
  { value: 'KILOGRAM', label: 'Kilogram' },
];

export default function CreateProductScreen() {
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: 0,
    productType: 'CONSUMABLE' as ProductType,
    unitOfMeasure: 'PIECE' as UnitOfMeasure,
    minQuantity: '',
    maxQuantity: '',
    estimatedUnitPrice: '',
    currency: 'TRY',
    imageUrl: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);

  useEffect(() => {
    if (token) {
      loadCategories();
    }
  }, [token]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getActiveCategories(token!);
      setCategories(data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      Alert.alert('Hata', 'Kategoriler yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('İzin Gerekli', 'Galeri erişimi için izin gereklidir');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setFormData((prev) => ({ ...prev, imageUrl: base64Image }));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Hata', 'Resim yüklenirken bir hata oluştu');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Hata', 'Ürün adı gereklidir');
      return false;
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      Alert.alert('Hata', 'Kategori seçmelisiniz');
      return false;
    }

    if (formData.minQuantity && parseInt(formData.minQuantity) < 0) {
      Alert.alert('Hata', "Minimum miktar 0'dan küçük olamaz");
      return false;
    }

    if (formData.maxQuantity && parseInt(formData.maxQuantity) < 0) {
      Alert.alert('Hata', "Maksimum miktar 0'dan küçük olamaz");
      return false;
    }

    if (formData.estimatedUnitPrice && parseFloat(formData.estimatedUnitPrice) < 0) {
      Alert.alert('Hata', "Tahmini birim fiyat 0'dan küçük olamaz");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !token) return;

    try {
      setSubmitting(true);

      const productData = {
        name: formData.name.trim(),
        code: '', // Boş bırakılırsa backend otomatik oluşturur
        description: formData.description.trim() || undefined,
        categoryId: formData.categoryId,
        productType: formData.productType,
        unitOfMeasure: formData.unitOfMeasure,
        minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : undefined,
        maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : undefined,
        estimatedUnitPrice: formData.estimatedUnitPrice ? parseFloat(formData.estimatedUnitPrice) : undefined,
        currency: formData.currency,
        imageUrl: formData.imageUrl || undefined,
      };

      await productService.createProduct(productData, token);
      Alert.alert('Başarılı', 'Ürün başarıyla oluşturuldu', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Ürün oluşturulurken hata:', error);
      Alert.alert('Hata', error.message || 'Ürün oluşturulurken bir sorun oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const selectedProductType = PRODUCT_TYPES.find((pt) => pt.value === formData.productType);
  const selectedUnit = UNIT_OF_MEASURES.find((u) => u.value === formData.unitOfMeasure);

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Ürün Oluştur' }} />
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>Yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Ürün Oluştur' }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.formCard, { backgroundColor: colors.background }]}>
          {/* Ürün Adı */}
          <Input
            label="Ürün Adı *"
            placeholder="Ürün adını giriniz"
            value={formData.name}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, name: value }))}
          />

          {/* Kategori */}
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>Kategori *</ThemedText>
            <TouchableOpacity
              style={[styles.selectButton, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
              onPress={() => setShowCategoryModal(true)}
            >
              <ThemedText style={[styles.selectButtonText, { color: selectedCategory ? colors.text : colors.textSecondary }]}>
                {selectedCategory ? selectedCategory.name : 'Kategori seçiniz'}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Ürün Tipi */}
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>Ürün Tipi *</ThemedText>
            <TouchableOpacity
              style={[styles.selectButton, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
              onPress={() => setShowProductTypeModal(true)}
            >
              <ThemedText style={[styles.selectButtonText, { color: colors.text }]}>
                {selectedProductType?.label || 'Ürün tipi seçiniz'}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Birim */}
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>Birim *</ThemedText>
            <TouchableOpacity
              style={[styles.selectButton, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
              onPress={() => setShowUnitModal(true)}
            >
              <ThemedText style={[styles.selectButtonText, { color: colors.text }]}>
                {selectedUnit?.label || 'Birim seçiniz'}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Açıklama */}
          <Input
            label="Açıklama"
            placeholder="Ürün açıklaması (opsiyonel)"
            value={formData.description}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, description: value }))}
            multiline
            numberOfLines={3}
          />

          {/* Min/Max Miktar */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Min. Miktar"
                placeholder="0"
                value={formData.minQuantity}
                onChangeText={(value) => setFormData((prev) => ({ ...prev, minQuantity: value.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Max. Miktar"
                placeholder="0"
                value={formData.maxQuantity}
                onChangeText={(value) => setFormData((prev) => ({ ...prev, maxQuantity: value.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Tahmini Birim Fiyat */}
          <Input
            label="Tahmini Birim Fiyat"
            placeholder="0.00"
            value={formData.estimatedUnitPrice}
            onChangeText={(value) => setFormData((prev) => ({ ...prev, estimatedUnitPrice: value.replace(/[^0-9.,]/g, '').replace(',', '.') }))}
            keyboardType="decimal-pad"
          />

          {/* Resim Yükleme */}
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: colors.text }]}>Ürün Resmi</ThemedText>
            {formData.imageUrl ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: formData.imageUrl }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={[styles.removeImageButton, { backgroundColor: '#EF4444' }]}
                  onPress={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.imageUploadButton, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                onPress={handleImageUpload}
              >
                <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                <ThemedText style={[styles.imageUploadText, { color: colors.textSecondary }]}>
                  Resim Yükle
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <Button
            title="İptal"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Oluştur"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {/* Kategori Seçim Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Kategori Seçiniz</ThemedText>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.modalItem,
                    { backgroundColor: formData.categoryId === category.id ? colors.primary + '20' : 'transparent' },
                  ]}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, categoryId: category.id }));
                    setShowCategoryModal(false);
                  }}
                >
                  <ThemedText style={[styles.modalItemText, { color: colors.text }]}>{category.name}</ThemedText>
                  {formData.categoryId === category.id && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Ürün Tipi Seçim Modal */}
      <Modal
        visible={showProductTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Ürün Tipi Seçiniz</ThemedText>
              <TouchableOpacity onPress={() => setShowProductTypeModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {PRODUCT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.modalItem,
                    { backgroundColor: formData.productType === type.value ? colors.primary + '20' : 'transparent' },
                  ]}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, productType: type.value }));
                    setShowProductTypeModal(false);
                  }}
                >
                  <ThemedText style={[styles.modalItemText, { color: colors.text }]}>{type.label}</ThemedText>
                  {formData.productType === type.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Birim Seçim Modal */}
      <Modal
        visible={showUnitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUnitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>Birim Seçiniz</ThemedText>
              <TouchableOpacity onPress={() => setShowUnitModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {UNIT_OF_MEASURES.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.modalItem,
                    { backgroundColor: formData.unitOfMeasure === unit.value ? colors.primary + '20' : 'transparent' },
                  ]}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, unitOfMeasure: unit.value }));
                    setShowUnitModal(false);
                  }}
                >
                  <ThemedText style={[styles.modalItemText, { color: colors.text }]}>{unit.label}</ThemedText>
                  {formData.unitOfMeasure === unit.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectButtonText: {
    fontSize: 16,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalScrollView: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalItemText: {
    fontSize: 16,
    flex: 1,
  },
});
