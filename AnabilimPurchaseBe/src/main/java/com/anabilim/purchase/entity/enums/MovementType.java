package com.anabilim.purchase.entity.enums;

public enum MovementType {
    IN("Giriş"),
    OUT("Çıkış"),
    ADJUSTMENT("Düzeltme");
    
    private final String displayName;
    
    MovementType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 