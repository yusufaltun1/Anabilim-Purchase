package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.response.NotificationDto;
import com.anabilim.purchase.entity.Notification;
import com.anabilim.purchase.entity.PurchaseRequest;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.mapper.NotificationMapper;
import com.anabilim.purchase.repository.NotificationRepository;
import com.anabilim.purchase.repository.UserRepository;
import com.anabilim.purchase.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional
    public void createNotification(User user, String message, PurchaseRequest request) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setPurchaseRequest(request);
        notification.setRead(false);
        notificationRepository.save(notification);
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

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bu bildirimi düzenleme yetkiniz yok.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, String userEmail) {
        User user = findUserByEmail(userEmail);
        Notification notification = findNotificationById(notificationId);

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bu bildirimi silme yetkiniz yok.");
        }

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
}
