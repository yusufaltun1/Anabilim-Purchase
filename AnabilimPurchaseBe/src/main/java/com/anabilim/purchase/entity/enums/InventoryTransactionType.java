package com.anabilim.purchase.entity.enums;

/**
 * Envanter işlem türleri enum'u
 */
public enum InventoryTransactionType {
    IN("Giriş"),
    OUT("Çıkış"),
    ASSIGNMENT("Zimmet"),
    RETURN("İade"),
    ADJUSTMENT("Düzeltme");

    private final String displayName;

    InventoryTransactionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 