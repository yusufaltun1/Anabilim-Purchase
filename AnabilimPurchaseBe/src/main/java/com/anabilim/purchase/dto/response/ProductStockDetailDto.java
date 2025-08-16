package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductStockDetailDto {
    private ProductBasicDto product;
    private Integer totalStock;
    private List<WarehouseStockDetailDto> warehouseStocks;
    private List<StockMovementDto> recentMovements;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductBasicDto {
        private Long id;
        private String name;
        private String code;
        private String description;
        private String unit;
        private String category;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseStockDetailDto {
        private Long stockId;
        private WarehouseBasicDto warehouse;
        private Integer currentStock;
        private Integer minStock;
        private Integer maxStock;
        private boolean isLowStock;
        private LocalDateTime lastMovementDate;
        
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class WarehouseBasicDto {
            private Long id;
            private String name;
            private String code;
            private String address;
        }
    }
} 