package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.enums.StockItemStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockItemSummaryDto {
    
    private Long id;
    
    private String serialNumber;
    
    private String productName;
    
    private String productCode;
    
    private StockItemStatus status;
    
    private String warehouseName;
    
    private String assignedUserName;
    
    private String assignedLocationName;
    
    private BigDecimal purchasePrice;
    
    private String imageUrl;
    
    private LocalDateTime warrantyExpiryDate;
    
    private boolean isUnderWarranty;
    
    private boolean isAvailable;
    
    private LocalDateTime createdAt;
}
