package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private CategoryDto.CategoryBasicDto category;
    private String productType;
    private String unit;
    private String serialNumber;
    private String imageUrl;
    private Integer minQuantity;
    private Integer maxQuantity;
    private BigDecimal estimatedUnitPrice;
    private Set<SupplierBasicDto> suppliers;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierBasicDto {
        private Long id;
        private String name;
        private String taxNumber;
    }
} 