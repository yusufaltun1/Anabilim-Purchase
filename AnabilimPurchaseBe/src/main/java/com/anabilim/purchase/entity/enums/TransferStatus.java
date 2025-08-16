package com.anabilim.purchase.entity.enums;

import lombok.Getter;

@Getter
public enum TransferStatus {
    PENDING("Beklemede", "Transfer isteği oluşturuldu, onay bekleniyor"),
    APPROVED("Onaylandı", "Transfer isteği onaylandı, hazırlık aşamasında"),
    PREPARING("Hazırlanıyor", "Eşyalar transfer için hazırlanıyor"),
    IN_TRANSIT("Yolda", "Eşyalar okula gönderildi, yolda"),
    DELIVERED("Teslim Edildi", "Eşyalar okula teslim edildi"),
    COMPLETED("Tamamlandı", "Transfer tamamlandı ve onaylandı"),
    CANCELLED("İptal Edildi", "Transfer iptal edildi"),
    REJECTED("Reddedildi", "Transfer isteği reddedildi"),
    PARTIALLY_COMPLETED("Kısmen Tamamlandı", "Transfer kısmen tamamlandı");

    private final String displayName;
    private final String description;

    TransferStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
} 