package com.anabilim.purchase.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssetTransferDto {
    
    @NotNull(message = "Kaynak depo ID'si boş olamaz")
    private Long sourceWarehouseId;
    
    @NotNull(message = "Hedef okul ID'si boş olamaz")
    private Long targetSchoolId;
    
    @Future(message = "Transfer tarihi gelecekte olmalıdır")
    private LocalDate transferDate;
    
    @Size(max = 1000, message = "Notlar en fazla 1000 karakter olabilir")
    private String notes;
    
    @NotEmpty(message = "Transfer kalemleri boş olamaz")
    @Valid
    private List<TransferItemDto> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferItemDto {
        
        @NotNull(message = "Ürün ID'si boş olamaz")
        private Long productId;
        
        @NotNull(message = "İstenen miktar boş olamaz")
        @Min(value = 1, message = "İstenen miktar en az 1 olmalıdır")
        private Integer requestedQuantity;
        
        @Size(max = 500, message = "Notlar en fazla 500 karakter olabilir")
        private String notes;
        
        @Size(max = 1000, message = "Seri numaraları en fazla 1000 karakter olabilir")
        private String serialNumbers; // Demirbaş için seri numaraları
        
        @Size(max = 500, message = "Durum notları en fazla 500 karakter olabilir")
        private String conditionNotes; // Eşyanın durumu hakkında notlar
    }
} 