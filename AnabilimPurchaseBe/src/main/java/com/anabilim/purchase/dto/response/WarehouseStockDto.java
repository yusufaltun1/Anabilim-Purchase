package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseStockDto {
    private Long id;
    private WarehouseDto warehouse;
    private ProductBasicDto product;
    private Integer currentStock;
    private Integer minStock;
    private Integer maxStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductBasicDto {
        private Long id;
        private String name;
        private String code;
        private String unit;
    }
} 