import { Notification, UnreadCountResponse } from '../types/notification.types';
import { API_CONFIG, getAuthHeaders } from './api.config';

class NotificationService {
  private baseUrl = `${API_CONFIG.BASE_URL}/api/v1/notifications`;

  async getNotifications(token: string): Promise<Notification[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getUnreadCount(token: string): Promise<UnreadCountResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/unread-count`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // API'nin doğrudan sayı döndürdüğünü varsayarak, onu bir nesneye sarıyoruz.
      const count = await response.json();
      return { count };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: number, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${notificationId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
      });

      if (response.status !== 204) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: number, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (response.status !== 204) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
