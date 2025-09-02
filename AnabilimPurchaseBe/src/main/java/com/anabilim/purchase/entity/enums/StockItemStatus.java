package com.anabilim.purchase.entity.enums;

import lombok.Getter;

@Getter
public enum StockItemStatus {
    IN_STOCK("Depoda", "Ürün depoda mevcut"),
    ASSIGNED("Atanmış", "Ürün bir kullanıcıya atanmış"),
    IN_USE("Kullanımda", "Ürün aktif olarak kullanılıyor"),
    MAINTENANCE("Bakımda", "Ürün bakım/onarım sürecinde"),
    RETIRED("Emekli", "Ürün kullanım dışı bırakılmış"),
    LOST("Kayıp", "Ürün kaybolmuş"),
    DAMAGED("Hasarlı", "Ürün hasarlı durumda"),
    TRANSFERRED("Transfer Edildi", "Ürün başka depoya transfer edildi");

    private final String displayName;
    private final String description;

    StockItemStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
}
