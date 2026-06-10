package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.enums.ProductType;
import com.anabilim.purchase.entity.enums.UnitOfMeasure;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    private Boolean requestable;
    private UnitOfMeasure unitOfMeasure;
    private Integer minQuantity;
    private Integer maxQuantity;
    private String currency;
    @JsonProperty("isActive")
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private int totalQuantity;
    private int assignedQuantity;
    private int availableQuantity;
    private int activeProductCount;

    private List<CategoryWarehouseStockDto> warehouseBreakdown = new ArrayList<>();
    private List<StockItemDto> stockItems = new ArrayList<>();
}
