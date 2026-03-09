package com.anabilim.purchase.entity.enums;

public enum RequestStatus {
    PENDING,           // İlk oluşturulduğunda
    IN_APPROVAL,       // Onay sürecinde
    APPROVED,         // Tüm onaylar tamamlandı
    REJECTED,         // Reddedildi
    IN_PROGRESS,      // Satın alma süreci başladı
    PARTIAL_APPROVAL,  // Karşı teklif girildi ve onaylı (kısmi onay)
    COMPLETED,        // Satın alma tamamlandı
    CANCELLED         // İptal edildi
} 