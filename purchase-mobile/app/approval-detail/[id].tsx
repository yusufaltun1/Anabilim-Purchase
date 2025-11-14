import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, TextInput, Modal, Button, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { purchaseService } from '@/services/api/purchase.service';
import { PurchaseRequest } from '@/services/types/purchase.types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type StatusStyle = {
  text: string;
  color: string;
};

export default function ApprovalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (id && token) {
      const fetchRequest = async () => {
        setLoading(true);
        try {
          const data = await purchaseService.getRequestById(Number(id), token);
          setRequest(data);
        } catch (error) {
          console.error('Failed to fetch request details:', error);
          Alert.alert('Hata', 'Talep detayları alınamadı.');
        } finally {
          setLoading(false);
        }
      };
      fetchRequest();
    }
  }, [id, token]);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await purchaseService.approveRequest(Number(id), token!);
      Alert.alert('Başarılı', 'Talep onaylandı.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to approve request:', error);
      Alert.alert('Hata', 'Talep onaylanırken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Hata', 'Lütfen reddetme nedenini giriniz.');
      return;
    }
    setIsSubmitting(true);
    try {
      await purchaseService.rejectRequest(Number(id), rejectionReason, token!);
      setModalVisible(false);
      Alert.alert('Başarılı', 'Talep reddedildi.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to reject request:', error);
      Alert.alert('Hata', 'Talep reddedilirken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusTranslationAndColor = (status: string): StatusStyle => {
    switch (status) {
      case 'IN_APPROVAL': return { text: 'Onayda', color: '#FFA500' };
      case 'APPROVED': return { text: 'Onaylandı', color: '#4CAF50' };
      case 'REJECTED': return { text: 'Reddedildi', color: '#F44336' };
      case 'PENDING': return { text: 'Beklemede', color: '#808080' };
      default: return { text: status, color: '#000000' };
    }
  };

  if (loading) {
    return <ThemedView style={styles.centered}><ActivityIndicator size="large" /></ThemedView>;
  }

  if (!request) {
    return <ThemedView style={styles.centered}><ThemedText>Talep bulunamadı.</ThemedText></ThemedView>;
  }

  const statusStyle = getStatusTranslationAndColor(request.status);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: request.title || 'Onay Detayı' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>{request.title}</ThemedText>
        <ThemedText style={styles.description}>{request.description}</ThemedText>
        
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoLabel}>Durum:</ThemedText>
          <ThemedText style={[styles.status, { color: statusStyle.color }]}>{statusStyle.text}</ThemedText>
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoLabel}>Talep Eden:</ThemedText>
          <ThemedText style={styles.infoValue}>{request.requester.firstName} {request.requester.lastName}</ThemedText>
        </View>

        <ThemedText style={styles.itemsTitle}>Ürünler</ThemedText>
        {request.items.map(item => (
          <View key={item.id} style={styles.itemContainer}>
            {item.imageBase64 && <Image source={{ uri: item.imageBase64 }} style={styles.itemImage} />}
            <ThemedText style={styles.itemName}>{item.productName}</ThemedText>
            <ThemedText>Miktar: {item.quantity}</ThemedText>
            <ThemedText>Notlar: {item.notes}</ThemedText>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button title="Reddet" color="red" onPress={() => setModalVisible(true)} disabled={isSubmitting} />
        <Button title="Onayla" onPress={handleApprove} disabled={isSubmitting} />
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <ThemedText style={styles.modalText}>Reddetme Nedenini Girin</ThemedText>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              onChangeText={setRejectionReason}
              value={rejectionReason}
              placeholder="Neden reddediyorsunuz?"
            />
            <View style={styles.modalButtonContainer}>
              <Button title="İptal" onPress={() => setModalVisible(false)} color="gray" />
              <Button title="Gönder" onPress={handleReject} disabled={isSubmitting} />
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 80 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, color: '#666', marginBottom: 16 },
  infoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  infoValue: { fontSize: 16 },
  status: { fontSize: 16, fontWeight: 'bold' },
  itemsTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 12, borderTopColor: '#eee', borderTopWidth: 1, paddingTop: 16 },
  itemContainer: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  itemName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  itemImage: { width: '100%', height: 200, resizeMode: 'contain', marginBottom: 10, borderRadius: 8 },
  buttonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
  modalText: { marginBottom: 15, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  input: { width: '100%', borderColor: 'gray', borderWidth: 1, borderRadius: 5, padding: 10, minHeight: 100, textAlignVertical: 'top', marginBottom: 20 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
});
