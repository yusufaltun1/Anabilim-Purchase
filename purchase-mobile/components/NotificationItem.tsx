import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Notification } from '@/services/types/notification.types';
import { useNotifications } from '@/contexts/NotificationContext';
import { Swipeable } from 'react-native-gesture-handler';

interface NotificationItemProps {
  item: Notification;
  onPress: () => void;
}

// Zamanı "X saat önce", "Y gün önce" gibi formatlayan yardımcı fonksiyon
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " yıl önce";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " ay önce";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " gün önce";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " saat önce";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " dakika önce";
  return Math.floor(seconds) + " saniye önce";
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ item, onPress }) => {
  const colorScheme = useColorScheme();
  const colors = AppColors[colorScheme ?? 'light'];
  const { deleteNotification } = useNotifications();

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity onPress={() => deleteNotification(item.id)} style={styles.deleteButton}>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <ThemedText style={styles.deleteText}>Sil</ThemedText>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: item.isRead ? colors.background : colors.primaryMuted },
        ]}
        onPress={onPress}
      >
        <View style={styles.content}>
          <ThemedText style={styles.message}>{item.message}</ThemedText>
          <ThemedText style={[styles.time, { color: colors.textSecondary }]}>
            {timeAgo(item.createdAt)}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteText: {
    color: 'white',
    fontWeight: '600',
  },
});
