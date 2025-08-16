package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductStockSummaryDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String unit;
    private String category;
    private String productType; // Display name of ProductType enum
    private Integer totalStock;
    private Integer warehouseCount; // Kaç depoda stok var
    private boolean hasLowStock; // Herhangi bir depoda düşük stok var mı
    private LocalDateTime lastMovementDate; // En son hareket tarihi
    private boolean isActive;
} 