package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.enums.MovementType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementDto {
    private Long id;
    private WarehouseStockDto warehouseStock;
    private Integer quantity;
    private MovementType movementType;
    private String referenceType;
    private Long referenceId;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 