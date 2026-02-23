import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { transferService, AssetTransfer } from '@/services/api/transfer.service';

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return '#F59E0B';
    case 'APPROVED':
    case 'PREPARING':
      return '#3B82F6';
    case 'IN_TRANSIT':
      return '#8B5CF6';
    case 'DELIVERED':
      return '#10B981';
    case 'COMPLETED':
      return '#059669';
    case 'CANCELLED':
    case 'REJECTED':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
  switch (status) {
    case 'PENDING':
      return 'time-outline';
    case 'APPROVED':
    case 'PREPARING':
      return 'checkmark-circle-outline';
    case 'IN_TRANSIT':
      return 'car-outline';
    case 'DELIVERED':
      return 'cube-outline';
    case 'COMPLETED':
      return 'checkmark-done-circle';
    case 'CANCELLED':
    case 'REJECTED':
      return 'close-circle-outline';
    default:
      return 'help-circle-outline';
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

export default function TransfersScreen() {
  const { user, token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const [transfers, setTransfers] = useState<AssetTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && token) {
      loadTransfers();
    }
  }, [user, token]);

  const loadTransfers = async () => {
    if (!user || !token || !user.id) {
      console.log('loadTransfers: Missing requirements', { 
        hasUser: !!user, 
        hasToken: !!token,
        userId: user?.id 
      });
      return;
    }

    try {
      console.log('loadTransfers: Loading transfers for user:', user.id);
      setLoading(true);
      const data = await transferService.getAssignedTransfers(user.id, token);
      console.log('loadTransfers: Transfers loaded:', data.length);
      setTransfers(data || []);
    } catch (error: any) {
      console.error('Transferler yüklenirken hata:', error);
      Alert.alert('Hata', error.message || 'Transferler yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransfers();
  };

  const handleTransferPress = (transfer: AssetTransfer) => {
    router.push(`/transfer-detail/${transfer.id}`);
  };

  const renderTransferItem = ({ item }: { item: AssetTransfer }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <Card
        style={[styles.transferCard, { backgroundColor: colors.background }]}
        onPress={() => handleTransferPress(item)}
      >
        <View style={styles.transferHeader}>
          <View style={styles.transferHeaderLeft}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Ionicons name={statusIcon} size={16} color={statusColor} />
              <ThemedText style={[styles.statusText, { color: statusColor, marginLeft: 4 }]}>
                {item.statusDisplayName || item.status}
              </ThemedText>
            </View>
            <ThemedText style={[styles.transferCode, { color: colors.text }]}>
              {item.transferCode}
            </ThemedText>
          </View>
        </View>

        <View style={styles.transferInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
              {item.sourceWarehouse?.name || '-'} → {item.targetWarehouse?.name || item.targetSchool?.name || '-'}
            </ThemedText>
          </View>

          {item.transferDate && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                {formatDate(item.transferDate)}
              </ThemedText>
            </View>
          )}

          {item.totalItemCount !== undefined && (
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
              <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                {item.totalItemCount} kalem
              </ThemedText>
            </View>
          )}
        </View>

        {(item.status === 'IN_TRANSIT' || item.status === 'DELIVERED' || item.status === 'PREPARING') && (
          <View style={[styles.actionHint, { backgroundColor: colors.primary + '10' }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            <ThemedText style={[styles.actionHintText, { color: colors.primary }]}>
              Teslim almak için dokunun
            </ThemedText>
          </View>
        )}
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Transferler' }} />
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Yükleniyor...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Transferler' }} />
      <FlatList
        data={transfers}
        renderItem={renderTransferItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="swap-horizontal-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
              Transfer Bulunamadı
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Size atanmış transfer bulunmuyor.
            </ThemedText>
          </View>
        }
      />
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
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  transferCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transferHeaderLeft: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transferCode: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  transferInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  actionHintText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
