package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.response.NotificationDto;
import com.anabilim.purchase.entity.Notification;
import com.anabilim.purchase.entity.PurchaseRequest;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.mapper.NotificationMapper;
import com.anabilim.purchase.service.MailService;
import com.anabilim.purchase.repository.NotificationRepository;
import com.anabilim.purchase.repository.UserRepository;
import com.anabilim.purchase.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;
    private final MailService mailService;

    @Override
    @Transactional
    public void createNotification(User user, String message, PurchaseRequest request) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setPurchaseRequest(request);
        notification.setRead(false);
        Notification saved = notificationRepository.save(notification);

        // Bildirim oluşturulduğu anda e-posta gönder
        try {
            mailService.sendNotificationEmail(user, saved);
        } catch (Exception e) {
            // E-posta gönderimi başarısız olsa bile iş akışını bozmayalım
            // Sadece log tarafında izleyelim.
        }

        // Expo Push Notification gönderimi (token varsa)
        sendExpoPushNotification(user, message, request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForUser(String userEmail) {
        User user = findUserByEmail(userEmail);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return notificationMapper.toDtoList(notifications);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, String userEmail) {
        User user = findUserByEmail(userEmail);
        Notification notification = findNotificationById(notificationId);

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, String userEmail) {
        User user = findUserByEmail(userEmail);
        Notification notification = findNotificationById(notificationId);

        notificationRepository.delete(notification);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(String userEmail) {
        User user = findUserByEmail(userEmail);
        return notificationRepository.countByUserIdAndIsRead(user.getId(), false);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + email));
    }

    private Notification findNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bildirim bulunamadı: " + id));
    }

    private void sendExpoPushNotification(User user, String message, PurchaseRequest request) {
        String expoPushToken = user.getExpoPushToken();
        if (expoPushToken == null || expoPushToken.isBlank()) {
            return;
        }

        // Expo token formatını kontrol et (yanlış token'ı sessizce yoksay)
        if (!expoPushToken.startsWith("ExponentPushToken[")) {
            log.warn("Expo push token formatı hatalı: {}", expoPushToken);
            return;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("to", expoPushToken);
        payload.put("title", "Anabilim");
        payload.put("body", message);
        payload.put("sound", "default");

        Map<String, Object> data = new HashMap<>();
        if (request != null) {
            data.put("purchaseRequestId", request.getId());
        }
        payload.put("data", data);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://exp.host/--/api/v2/push/send",
                    entity,
                    String.class
            );
            if (!response.getStatusCode().is2xxSuccessful()) {
                log.warn("Expo push gönderimi başarısız: {}", response.getBody());
            }
        } catch (Exception e) {
            log.warn("Expo push gönderim hatası: {}", e.getMessage());
        }
    }
}
