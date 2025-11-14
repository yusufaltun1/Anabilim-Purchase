import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, ScrollView, Image, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { purchaseService } from '@/services/api/purchase.service';
import { PurchaseRequest } from '@/services/types/purchase.types';

type StatusStyle = {
  text: string;
  color: string;
};

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (id && token) {
      const fetchRequestDetail = async () => {
        try {
          const data = await purchaseService.getRequestById(Number(id), token);
          setRequest(data);
        } catch (error) {
          console.error('Failed to fetch request detail:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchRequestDetail();
    }
  }, [id, token]);

  const getStatusTranslationAndColor = (status: string): StatusStyle => {
    switch (status) {
      case 'IN_APPROVAL':
        return { text: 'Onayda', color: '#FFA500' }; // Orange
      case 'APPROVED':
        return { text: 'Onaylandı', color: '#4CAF50' }; // Green
      case 'REJECTED':
        return { text: 'Reddedildi', color: '#F44336' }; // Red
      case 'PENDING':
        return { text: 'Beklemede', color: '#808080' }; // Gray
      case 'COMPLETED':
        return { text: 'Tamamlandı', color: '#2196F3' }; // Blue
      case 'CANCELLED':
        return { text: 'İptal Edildi', color: '#607D8B' }; // Blue Grey
      case 'IN_PROGRESS':
          return { text: 'İşlemde', color: '#00BCD4' }; // Cyan
      default:
        return { text: status, color: '#000000' }; // Black for unknown
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!request) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Talep bulunamadı.</ThemedText>
      </ThemedView>
    );
  }

  const statusStyle = getStatusTranslationAndColor(request.status);

  return (
    <>
      <Stack.Screen options={{ title: request.title || 'Talep Detayı' }} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <ThemedText style={styles.title}>{request.title}</ThemedText>
          <ThemedText style={styles.description}>{request.description}</ThemedText>
          
          <View style={styles.infoContainer}>
            <ThemedText style={styles.infoLabel}>Durum:</ThemedText>
            <ThemedText style={[styles.status, { color: statusStyle.color }]}>
              {statusStyle.text}
            </ThemedText>
          </View>

          <View style={styles.infoContainer}>
            <ThemedText style={styles.infoLabel}>Talep Eden:</ThemedText>
            <ThemedText style={styles.infoValue}>{request.requester.firstName} {request.requester.lastName}</ThemedText>
          </View>

          <ThemedText style={styles.itemsTitle}>Ürünler</ThemedText>
          {request.items.map(item => (
            <View key={item.id} style={styles.itemContainer}>
              {item.imageBase64 && (
                <Image source={{ uri: item.imageBase64 }} style={styles.itemImage} />
              )}
              <ThemedText style={styles.itemName}>{item.productName}</ThemedText>
              <ThemedText>Miktar: {item.quantity}</ThemedText>
              <ThemedText>Notlar: {item.notes}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    borderTopColor: '#eee',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 8,
  },
});
