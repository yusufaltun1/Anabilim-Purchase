import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { AppColors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PurchaseRequest } from '@/services/types/purchase.types';

type StatusStyle = {
  text: string;
  color: string;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusTranslationAndColor = (status: string): StatusStyle => {
  switch (status) {
    case 'IN_APPROVAL': return { text: 'Onayda', color: '#FFA500' };
    case 'APPROVED': return { text: 'Onaylandı', color: '#4CAF50' };
    case 'REJECTED': return { text: 'Reddedildi', color: '#F44336' };
    case 'PENDING': return { text: 'Beklemede', color: '#808080' };
    case 'COMPLETED': return { text: 'Tamamlandı', color: '#2196F3' };
    case 'CANCELLED': return { text: 'İptal Edildi', color: '#607D8B' };
    case 'IN_PROGRESS': return { text: 'İşlemde', color: '#00BCD4' };
    default: return { text: status, color: '#000000' };
  }
};

type RequestListProps = {
  fetchFunction: (token: string) => Promise<PurchaseRequest[]>;
  onNav: (id: number) => void;
  listKey: string;
};

export const RequestList: React.FC<RequestListProps> = ({ fetchFunction, onNav, listKey }) => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchFunction(token);
      setRequests(data);
    } catch (error) {
      console.error(`Failed to fetch data for ${listKey}:`, error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [token, fetchFunction, listKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: PurchaseRequest }) => {
    const statusStyle = getStatusTranslationAndColor(item.status);
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'IN_APPROVAL':
          return 'time-outline';
        case 'APPROVED':
          return 'checkmark-circle';
        case 'REJECTED':
          return 'close-circle';
        case 'PENDING':
          return 'hourglass-outline';
        case 'COMPLETED':
          return 'checkmark-done-circle';
        case 'CANCELLED':
          return 'ban';
        case 'IN_PROGRESS':
          return 'sync';
        default:
          return 'document-text';
      }
    };

    return (
      <Card
        style={[styles.itemCard, { backgroundColor: colors.background }]}
        onPress={() => onNav(item.id)}
      >
        <View style={styles.itemHeader}>
          <View style={[styles.itemIconContainer, { backgroundColor: statusStyle.color + '20' }]}>
            <Ionicons name={getStatusIcon(item.status) as any} size={20} color={statusStyle.color} />
          </View>
          <View style={styles.itemContent}>
            <ThemedText style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </ThemedText>
            {item.description && (
              <ThemedText style={[styles.itemDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.footerLeft}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.color + '20' }]}>
              <ThemedText style={[styles.statusText, { color: statusStyle.color }]}>
                {statusStyle.text}
              </ThemedText>
            </View>
            {item.status === 'REJECTED' && item.rejectionReason && (
              <View style={[styles.rejectionBadge, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle" size={12} color="#DC2626" />
                <ThemedText style={styles.rejectionText} numberOfLines={1}>
                  Red nedeni var
                </ThemedText>
              </View>
            )}
          </View>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
            <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Yükleniyor...
        </ThemedText>
      </ThemedView>
    );
  }

  if (requests.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
        </View>
        <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
          Talep bulunamadı
        </ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          {listKey === 'pending'
            ? 'Onay bekleyen talep bulunmuyor'
            : 'Henüz bir talep oluşturmadınız'}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => `${listKey}-${item.id.toString()}`}
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        bounces={true}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  itemCard: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rejectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    maxWidth: 120,
  },
  rejectionText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
});
