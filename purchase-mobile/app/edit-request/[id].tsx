import { PurchaseRequestForm } from '@/components/forms/PurchaseRequestForm';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { purchaseService } from '@/services/api/purchase.service';
import { PurchaseRequest } from '@/services/types/purchase.types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function EditRequestScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && token) {
      const fetchRequest = async () => {
        try {
          const data = await purchaseService.getRequestById(Number(id), token);
          setRequest(data);
        } catch (error) {
          console.error('Failed to fetch request:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchRequest();
    }
  }, [id, token]);

  const handleSuccess = () => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Talep Güncelle' }} />
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Yükleniyor...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!request) {
    return (
      <ThemedView style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Talep Güncelle' }} />
        <ThemedText style={[styles.errorText, { color: colors.text }]}>
          Talep bulunamadı
        </ThemedText>
      </ThemedView>
    );
  }

  if (request.status !== 'REJECTED') {
    return (
      <ThemedView style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Talep Güncelle' }} />
        <ThemedText style={[styles.errorText, { color: colors.text }]}>
          Sadece reddedilmiş talepler güncellenebilir
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Talep Güncelle' }} />
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      <PurchaseRequestForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        initialData={request}
        requestId={Number(id)}
      />
    </SafeAreaView>
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
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
