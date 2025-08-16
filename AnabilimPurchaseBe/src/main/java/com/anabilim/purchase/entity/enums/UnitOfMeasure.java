package com.anabilim.purchase.entity.enums;

/**
 * Ölçü birimleri enum'u
 */
public enum UnitOfMeasure {
    PIECE("Adet"),
    BOX("Kutu"),
    PACKAGE("Paket"),
    KILOGRAM("Kilogram"),
    LITER("Litre"),
    METER("Metre"),
    SET("Takım"),
    PAIR("Çift"),
    ROLL("Rulo"),
    BOTTLE("Şişe");

    private final String displayName;

    UnitOfMeasure(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 