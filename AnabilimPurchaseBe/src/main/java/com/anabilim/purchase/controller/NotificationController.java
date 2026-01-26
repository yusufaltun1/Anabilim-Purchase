package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.response.NotificationDto;
import com.anabilim.purchase.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Giriş yapmış kullanıcının tüm bildirimlerini getirir.
     * @param userDetails Kimliği doğrulanmış kullanıcıyı temsil eden UserDetails nesnesi
     * @return Bildirim listesi
     */
    @GetMapping
    public ResponseEntity<List<NotificationDto>> getUserNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        String userEmail = userDetails.getUsername();
        List<NotificationDto> notifications = notificationService.getNotificationsForUser(userEmail);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Belirli bir bildirimi okundu olarak işaretler.
     * @param id Okunacak bildirimin ID'si
     * @param userDetails Kimliği doğrulanmış kullanıcıyı temsil eden UserDetails nesnesi
     * @return İçeriksiz başarılı yanıt
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        String userEmail = userDetails.getUsername();
        notificationService.markAsRead(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    /**
     * Belirli bir bildirimi siler.
     * @param id Silinecek bildirimin ID'si
     * @param userDetails Kimliği doğrulanmış kullanıcıyı temsil eden UserDetails nesnesi
     * @return İçeriksiz başarılı yanıt
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        String userEmail = userDetails.getUsername();
        notificationService.deleteNotification(id, userEmail);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Giriş yapmış kullanıcının okunmamış bildirim sayısını getirir.
     * @param userDetails Kimliği doğrulanmış kullanıcıyı temsil eden UserDetails nesnesi
     * @return Okunmamış bildirim sayısı
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadNotificationCount(@AuthenticationPrincipal UserDetails userDetails) {
        String userEmail = userDetails.getUsername();
        long count = notificationService.getUnreadNotificationCount(userEmail);
        return ResponseEntity.ok(count);
    }
}
