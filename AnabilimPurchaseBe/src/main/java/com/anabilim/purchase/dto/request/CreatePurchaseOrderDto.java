package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseOrderDto {
    
    @NotNull(message = "Tedarikçi teklifi ID'si zorunludur")
    private Long supplierQuoteId;
    
    @NotNull(message = "Sipariş adedi zorunludur")
    @Min(value = 1, message = "Sipariş adedi en az 1 olmalıdır")
    private Integer quantity;
    
    @NotNull(message = "Teslimat deposu ID'si zorunludur")
    private Long deliveryWarehouseId;
    
    private LocalDateTime expectedDeliveryDate;
    
    private String notes;
} 