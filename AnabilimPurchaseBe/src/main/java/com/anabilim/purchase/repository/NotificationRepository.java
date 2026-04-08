package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Notification;
import com.anabilim.purchase.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Belirli bir kullanıcı ID'sine ait tüm bildirimleri, oluşturulma tarihine göre
     * en yeniden eskiye doğru sıralanmış olarak getirir.
     * @param userId Bildirimleri alınacak kullanıcının ID'si
     * @return Kullanıcının bildirim listesi
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Belirli bir kullanıcı ID'sine ait okunmamış bildirimlerin sayısını getirir.
     * @param userId Kullanıcının ID'si
     * @param isRead Okunma durumu (false)
     * @return Okunmamış bildirim sayısı
     */
    long countByUserIdAndIsRead(Long userId, boolean isRead);

    long deleteByPurchaseRequestId(Long purchaseRequestId);
}
