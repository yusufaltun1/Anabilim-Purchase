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
} 