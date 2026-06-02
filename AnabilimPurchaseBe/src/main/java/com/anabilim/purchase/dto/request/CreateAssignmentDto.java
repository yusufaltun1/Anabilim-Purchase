package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssignmentDto {
    
    @NotNull(message = "Ürün ID'si zorunludur")
    private Long productId;
    
    private Long stockItemId; // Seri numaralı ürünler için
    
    private Long warehouseId; // Miktar bazlı zimmet için çıkış yapılacak depo
    
    @Positive(message = "Miktar pozitif olmalıdır")
    private Integer quantity = 1; // SEMI_FIXED_ASSET için
    
    private Long assignedUserId; // Kullanıcıya zimmet
    
    private Long assignedLocationId;
    
    private String locationName; // Konuma zimmet
    
    private String locationDetails;
    
    private LocalDate expectedReturnDate; // Zimmet geçerlilik tarihi - bu tarihte otomatik kapanır (opsiyonel)
    
    private String notes;
}
