package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.response.NotificationDto;
import com.anabilim.purchase.entity.PurchaseRequest;
import com.anabilim.purchase.entity.User;

import java.util.List;

public interface NotificationService {

    /**
     * Yeni bir bildirim oluşturur.
     * @param user Bildirimin gönderileceği kullanıcı
     * @param message Bildirim mesajı
     * @param request İlgili satın alma talebi
     */
    void createNotification(User user, String message, PurchaseRequest request);

    /**
     * Belirli bir kullanıcının tüm bildirimlerini getirir.
     * @param userEmail Kullanıcının e-posta adresi
     * @return Bildirim DTO listesi
     */
    List<NotificationDto> getNotificationsForUser(String userEmail);

    /**
     * Belirli bir bildirimi okundu olarak işaretler.
     * @param notificationId Okundu olarak işaretlenecek bildirimin ID'si
     * @param userEmail İşlemi yapan kullanıcının e-posta adresi
     */
    void markAsRead(Long notificationId, String userEmail);

    /**
     * Belirli bir bildirimi siler.
     * @param notificationId Silinecek bildirimin ID'si
     * @param userEmail İşlemi yapan kullanıcının e-posta adresi
     */
    void deleteNotification(Long notificationId, String userEmail);
    
    /**
     * Kullanıcının okunmamış bildirim sayısını getirir.
     * @param userEmail Kullanıcının e-posta adresi
     * @return Okunmamış bildirim sayısı
     */
    long getUnreadNotificationCount(String userEmail);
}
