package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDetailDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private ProductType productType;
    private Integer minStockNotifyAt;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private int totalQuantity;
    private int assignedQuantity;
    private int availableQuantity;

    private List<CategoryWarehouseStockDto> warehouseBreakdown = new ArrayList<>();
    private List<StockItemDto> stockItems = new ArrayList<>();
}
