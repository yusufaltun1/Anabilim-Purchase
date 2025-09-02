package com.anabilim.purchase.dto.request;

import com.anabilim.purchase.entity.enums.StockItemStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class UpdateStockItemDto {
    
    @NotNull(message = "Durum zorunludur")
    private StockItemStatus status;
    
    private Long warehouseId;
    
    private Long assignedUserId;
    
    private Long assignedSchoolId;
    
    @Positive(message = "Satın alma fiyatı pozitif olmalıdır")
    private BigDecimal purchasePrice;
    
    private LocalDateTime purchaseDate;
    
    private LocalDateTime warrantyExpiryDate;
    
    private String locationDetails;
    
    private String imageUrl;
    
    private List<String> additionalImages;
    
    private String notes;
    
    private boolean isActive = true;
}
