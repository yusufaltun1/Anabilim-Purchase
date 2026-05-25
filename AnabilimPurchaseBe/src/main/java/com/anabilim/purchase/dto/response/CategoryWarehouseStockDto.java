package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryWarehouseStockDto {
    private Long warehouseId;
    private String warehouseName;
    private int totalQuantity;
    private int assignedQuantity;
    private int availableQuantity;
}
