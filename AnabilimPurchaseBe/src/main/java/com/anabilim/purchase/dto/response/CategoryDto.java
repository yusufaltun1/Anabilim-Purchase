package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private ProductType productType;
    private Integer minStockNotifyAt;
    private Boolean requestable;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private int totalQuantity;
    private int assignedQuantity;
    private int availableQuantity;
}
