package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.response.NotificationDto;
import com.anabilim.purchase.entity.Notification;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class NotificationMapper {

    /**
     * Notification entity'sini NotificationDto'ya dönüştürür.
     * @param notification Dönüştürülecek entity
     * @return Dönüştürülmüş DTO
     */
    public NotificationDto toDto(Notification notification) {
        if (notification == null) {
            return null;
        }

        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());

        if (notification.getPurchaseRequest() != null) {
            dto.setPurchaseRequestId(notification.getPurchaseRequest().getId());
        }

        return dto;
    }

    /**
     * Notification entity listesini NotificationDto listesine dönüştürür.
     * @param notifications Dönüştürülecek entity listesi
     * @return Dönüştürülmüş DTO listesi
     */
    public List<NotificationDto> toDtoList(List<Notification> notifications) {
        if (notifications == null || notifications.isEmpty()) {
            return Collections.emptyList();
        }

        return notifications.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
