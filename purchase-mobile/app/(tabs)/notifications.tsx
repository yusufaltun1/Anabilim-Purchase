import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useNotifications } from '@/contexts/NotificationContext';
import {NotificationItem} from "@/components/NotificationItem";
import { AppColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function NotificationsScreen() {
  const { notifications, isLoading, fetchNotifications, markNotificationAsRead } = useNotifications();
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];

  const handleNotificationPress = (notificationId: number, purchaseRequestId: number) => {
    markNotificationAsRead(notificationId);
    if (purchaseRequestId) {
      router.push(`/request-detail/${purchaseRequestId}`);
    }
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <ThemedText>Hiç bildiriminiz yok.</ThemedText>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {isLoading && notifications.length === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={notifications}
            renderItem={({ item }) => (
              <NotificationItem
                item={item}
                onPress={() => handleNotificationPress(item.id, item.purchaseRequestId)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyComponent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={fetchNotifications}
                tintColor={colors.text}
              />
            }
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
});
