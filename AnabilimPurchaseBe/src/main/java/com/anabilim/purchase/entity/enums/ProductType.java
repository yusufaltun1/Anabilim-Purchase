package com.anabilim.purchase.entity.enums;

import lombok.Getter;

@Getter
public enum ProductType {
    // Sarf Malzemeleri (Tüketilen, geri gelmez)
    CONSUMABLE("Sarf Malzemesi", "Tüketilen malzemeler", StockTrackingType.QUANTITY_ONLY),
    
    // Demirbaş (Seri numaralı, tekrar kullanılabilir)
    FIXED_ASSET("Demirbaş", "Seri numaralı sabit kıymetler", StockTrackingType.SERIAL_NUMBER),
    
    // Yarı Demirbaş (Seri numarasız, tekrar kullanılabilir)
    SEMI_FIXED_ASSET("Yarı Demirbaş", "Seri numarasız tekrar kullanılabilir malzemeler", StockTrackingType.QUANTITY_REUSABLE);

    private final String displayName;
    private final String description;
    private final StockTrackingType stockTrackingType;

    ProductType(String displayName, String description, StockTrackingType stockTrackingType) {
        this.displayName = displayName;
        this.description = description;
        this.stockTrackingType = stockTrackingType;
    }
} 