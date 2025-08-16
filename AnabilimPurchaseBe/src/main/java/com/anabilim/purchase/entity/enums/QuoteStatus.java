package com.anabilim.purchase.entity.enums;

public enum QuoteStatus {
    PENDING("Beklemede"),
    RESPONDED("Yanıtlandı"),
    ACCEPTED("Kabul Edildi"),
    REJECTED("Reddedildi"),
    EXPIRED("Süresi Doldu"),
    CANCELLED("İptal Edildi"),
    CONVERTED_TO_ORDER("Siparişe Dönüştü");
    
    private final String displayName;
    
    QuoteStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 