package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssetTransferItemDto {
    private Long id;
    private ProductBasicDto product;
    private Integer requestedQuantity;
    private Integer transferredQuantity;
    private Integer remainingQuantity; // Kalan miktar
    private String notes;
    private String serialNumbers;
    private String conditionNotes;
    private boolean isFullyTransferred; // Tam transfer edildi mi
    private boolean isPartiallyTransferred; // Kısmen transfer edildi mi
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductBasicDto {
        private Long id;
        private String name;
        private String code;
        private String productType;
        private String unit;
        private String category;
    }
} 