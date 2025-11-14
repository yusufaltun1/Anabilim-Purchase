import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notification.service';
import { Notification } from '../types/notification';
import { formatDate } from '../utils/date'; // Zaman formatlama fonksiyonu

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Her 60 saniyede bir kontrol et
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    setIsOpen(false);
    navigate(`/purchase-requests/${notification.purchaseRequestId}`);
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        fetchNotifications(); // Listeyi ve sayacı yenile
      } catch (error) {
        console.error('Bildirim okundu olarak işaretlenemedi:', error);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation(); // Dropdown'un kapanmasını engelle
    try {
      await notificationService.deleteNotification(notificationId);
      fetchNotifications(); // Listeyi yenile
    } catch (error) {
      console.error('Bildirim silinemedi:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-600 hover:text-indigo-600 focus:outline-none">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
          <div className="p-2 font-bold text-gray-800 border-b">Bildirimler</div>
          <div className="py-1">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 hover:bg-gray-100 cursor-pointer border-l-4 ${notif.isRead ? 'border-transparent' : 'border-indigo-500'}`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <button onClick={(e) => handleDelete(e, notif.id)} className="ml-2 text-gray-400 hover:text-red-600 p-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Yeni bildirim yok.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
