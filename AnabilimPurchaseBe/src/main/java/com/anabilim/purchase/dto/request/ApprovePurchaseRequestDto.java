package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovePurchaseRequestDto {
    
    private boolean approved;
    
    @Size(max = 1000, message = "Yorum en fazla 1000 karakter olabilir")
    private String comment;
    
    @Size(max = 1000, message = "Red nedeni en fazla 1000 karakter olabilir")
    private String rejectionReason;

    /** Talebi bu kullanıcıya geri gönder (null = tamamen reddet). Alt kırılımdaki requester veya önceki onaycılardan biri olmalı. */
    private Long returnToUserId;

    /** Birden fazla üst grup varsa, onayı hangi üst gruba ileteceği (seçilen adayın userId'si). */
    private Long nextApproverUserId;

    /** Üst onaycı yokken talebi bu kullanıcıya ilet (alt kırılım). null ise tamamen onayla. */
    private Long sendToUserId;
} 