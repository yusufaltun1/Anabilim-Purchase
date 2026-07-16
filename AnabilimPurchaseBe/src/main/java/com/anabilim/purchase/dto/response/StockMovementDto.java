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
    private Long stockItemId;
    private String stockItemSerialNumber;
    private Long parentLocationId;
    private String parentLocationName;
    private Long childLocationId;
    private String childLocationName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 