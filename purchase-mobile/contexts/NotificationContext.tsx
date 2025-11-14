import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { notificationService } from '@/services/api/notification.service';
import { Notification } from '@/services/types/notification.types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [notifs, unread] = await Promise.all([
        notificationService.getNotifications(token),
        notificationService.getUnreadCount(token),
      ]);
      setNotifications(notifs);
      setUnreadCount(unread.count);
    } catch (error) {
      console.error('Failed to fetch notification data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Her 30 saniyede bir bildirimleri yenile
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  const markNotificationAsRead = async (notificationId: number) => {
    if (!token) return;
    try {
      await notificationService.markAsRead(notificationId, token);
      // State'i anında güncelle
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    if (!token) return;
    try {
      // Silmeden önce okunmamış olup olmadığını kontrol et
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      const wasUnread = notificationToDelete && !notificationToDelete.isRead;

      await notificationService.deleteNotification(notificationId, token);
      
      // State'i anında güncelle
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
      }
    } catch (error) {
      console.error(`Failed to delete notification ${notificationId}:`, error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markNotificationAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
