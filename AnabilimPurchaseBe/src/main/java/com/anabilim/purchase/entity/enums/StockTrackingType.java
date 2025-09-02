package com.anabilim.purchase.entity.enums;

import lombok.Getter;

@Getter
public enum StockTrackingType {
    QUANTITY_ONLY("Sadece Adet", "Sarf malzemeler için adet bazında takip"),
    SERIAL_NUMBER("Seri Numaralı", "Demirbaşlar için seri numara bazında takip"),
    QUANTITY_REUSABLE("Adet (Tekrar Kullanılabilir)", "Yarı demirbaşlar için adet bazında ama tekrar kullanılabilir"),
    NO_STOCK("Stok Takibi Yok", "Hizmetler için stok takibi yapılmaz");

    private final String displayName;
    private final String description;

    StockTrackingType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
}
