package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.enums.StockItemStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockItemDto {
    
    private Long id;
    
    private Long productId;
    
    private String productName;
    
    private String productCode;
    
    private String serialNumber;
    
    private StockItemStatus status;
    
    private Long warehouseId;
    
    private String warehouseName;
    
    private Long assignedUserId;
    
    private String assignedUserName;
    
    private Long assignedLocationId;
    
    private String assignedLocationName;
    
    private BigDecimal purchasePrice;
    
    private LocalDateTime purchaseDate;
    
    private LocalDateTime warrantyExpiryDate;
    
    private String locationDetails;
    
    private String imageUrl;
    
    private List<String> additionalImages;
    
    private String notes;

    private Long assetConditionId;

    private String assetConditionName;

    private Boolean allowsAssignment;
    
    private boolean isActive;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // Hesaplanmış alanlar
    private boolean isUnderWarranty;
    
    private boolean isAvailable;
    
    private boolean isAssigned;
    
    // Zimmet bilgileri
    private Long assignmentId;
    
    private String assignmentStatus;
    
    private LocalDateTime assignmentDate;
    
    private String assignmentNotes;
}
