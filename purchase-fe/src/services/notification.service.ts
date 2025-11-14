import { API_CONFIG } from '../config/api.config';
import { authService } from './auth.service';
import { Notification } from '../types/notification';

class NotificationService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getNotifications(): Promise<Notification[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/notifications`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Bildirimler alınamadı');
    }
    return response.json();
  }

  async getUnreadCount(): Promise<number> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/notifications/unread-count`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Okunmamış bildirim sayısı alınamadı');
    }
    const data = await response.json();
    // API'nin doğrudan sayıyı döndürdüğünü varsayıyoruz.
    // Eğer bir nesne içinde geliyorsa (örn: { count: 1 }), bu satırı güncellemeliyiz.
    return typeof data === 'number' ? data : data.count || 0;
  }

  async markAsRead(notificationId: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    if (response.status !== 204) {
      throw new Error('Bildirim okundu olarak işaretlenemedi');
    }
  }

  async deleteNotification(notificationId: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (response.status !== 204) {
      throw new Error('Bildirim silinemedi');
    }
  }
}

export const notificationService = new NotificationService();
