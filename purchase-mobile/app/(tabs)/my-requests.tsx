import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { purchaseService } from '@/services/api/purchase.service';
import { PurchaseRequest } from '@/services/types/purchase.types';
import { ThemedText } from '@/components/themed-text';
import { TabView, SceneMap, TabBar, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppColors } from '@/constants/colors';

type StatusStyle = {
  text: string;
  color: string;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
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

const RequestList = ({ fetchFunction, onNav, listKey }: { fetchFunction: (token: string) => Promise<PurchaseRequest[]>, onNav: (id: number) => void, listKey: string }) => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

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

  const renderItem = ({ item }: { item: PurchaseRequest }) => {
    const statusStyle = getStatusTranslationAndColor(item.status);
    return (
      <TouchableOpacity onPress={() => onNav(item.id)}>
        <View style={styles.itemContainer}>
          <ThemedText style={styles.title}>{item.title}</ThemedText>
          <ThemedText style={styles.description}>{item.description}</ThemedText>
          <View style={styles.footer}>
            <ThemedText style={[styles.status, { color: statusStyle.color }]}>{statusStyle.text}</ThemedText>
            <ThemedText style={styles.date}>{formatDate(item.createdAt)}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  }
  
  if (requests.length === 0) {
    return <View style={styles.emptyContainer}><ThemedText>Gösterilecek talep bulunamadı.</ThemedText></View>;
  }

  return (
    <FlatList
      data={requests}
      renderItem={renderItem}
      keyExtractor={item => `${listKey}-${item.id.toString()}`}
      style={styles.list}
      onRefresh={loadData}
      refreshing={loading}
    />
  );
};

export default function MyRequestsScreen() {
  const layout = useWindowDimensions();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'myRequests', title: 'Taleplerim' },
    { key: 'pendingApprovals', title: 'Onay Bekleyenler' },
  ]);

  const renderScene = SceneMap({
    myRequests: () => <RequestList listKey="my" fetchFunction={purchaseService.getMyRequests} onNav={(id) => router.push(`/request-detail/${id}`)} />,
    pendingApprovals: () => <RequestList listKey="pending" fetchFunction={purchaseService.getPendingApprovals} onNav={(id) => router.push(`/approval-detail/${id}`)} />,
  });

  const renderCustomTabBar = (props: SceneRendererProps & { navigationState: NavigationState<{ key: string; title: string; }> }) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors.tabIconSelected }}
      style={{ backgroundColor: colors.background }}
      labelStyle={{ fontWeight: '600' }}
      activeColor={colors.tabIconSelected}
      inactiveColor={colors.tabIconDefault}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderCustomTabBar}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    alignItems: 'center',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
});
