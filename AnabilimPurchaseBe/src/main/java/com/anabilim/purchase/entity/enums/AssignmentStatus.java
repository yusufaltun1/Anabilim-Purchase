package com.anabilim.purchase.entity.enums;

import lombok.Getter;

@Getter
public enum AssignmentStatus {
    ACTIVE("Aktif", "Zimmet aktif durumda"),
    RETURNED("İade Edildi", "Zimmet iade edildi"),
    EXPIRED("Süresi Doldu", "Zimmet süresi doldu"),
    LOST("Kayıp", "Zimmet kayboldu"),
    DAMAGED("Hasarlı", "Zimmet hasarlı"),
    TRANSFERRED("Transfer Edildi", "Zimmet başka birine transfer edildi");

    private final String displayName;
    private final String description;

    AssignmentStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
}
