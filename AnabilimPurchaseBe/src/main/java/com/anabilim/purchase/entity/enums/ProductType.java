package com.anabilim.purchase.entity.enums;

import lombok.Getter;

@Getter
public enum ProductType {
    CONSUMABLE("Sarf Malzemesi", "Tüketilen malzemeler"),
    FIXED_ASSET("Demirbaş", "Sabit kıymet olarak kayıtlanan malzemeler"),
    EQUIPMENT("Ekipman", "Kullanılan ancak tüketilmeyen malzemeler"),
    SERVICE("Hizmet", "Hizmet alımları"),
    SOFTWARE("Yazılım", "Yazılım lisansları"),
    MAINTENANCE("Bakım", "Bakım ve onarım malzemeleri"),
    OFFICE_SUPPLIES("Ofis Malzemeleri", "Günlük ofis kullanımı için malzemeler"),
    IT_HARDWARE("IT Donanımı", "Bilgi işlem donanımları"),
    FURNITURE("Mobilya", "Ofis mobilyaları"),
    OTHER("Diğer", "Diğer ürün tipleri");

    private final String displayName;
    private final String description;

    ProductType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
} 