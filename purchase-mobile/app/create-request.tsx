import { PurchaseRequestForm } from '@/components/forms/PurchaseRequestForm';
import { AppColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';

export default function CreateRequestScreen() {
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const handleSuccess = (request: any) => {
    // Talep başarıyla oluşturuldu, ana sayfaya dön
    router.back();
  };

  const handleCancel = () => {
    // İptal edildi, geri dön
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      <PurchaseRequestForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
