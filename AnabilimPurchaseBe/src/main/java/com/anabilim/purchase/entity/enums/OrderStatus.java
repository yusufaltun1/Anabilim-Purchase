package com.anabilim.purchase.entity.enums;

public enum OrderStatus {
    PENDING,        // Sipariş oluşturuldu, tedarikçiye gönderilmeyi bekliyor
    SENT,           // Sipariş tedarikçiye gönderildi
    CONFIRMED,      // Tedarikçi siparişi onayladı
    IN_PROGRESS,    // Tedarikçi siparişi hazırlıyor
    READY,          // Sipariş teslimata hazır
    SHIPPED,        // Sipariş kargoya verildi
    DELIVERED,      // Sipariş teslim edildi
    CANCELLED,      // Sipariş iptal edildi
    REJECTED        // Tedarikçi siparişi reddetti
} 