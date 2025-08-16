package com.anabilim.purchase.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePurchaseRequestItemsDto {
    
    @NotEmpty(message = "En az bir ürün eklenmelidir")
    private List<@Valid PurchaseRequestItemDto> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseRequestItemDto {
        private Long productId;
        private Set<Long> potentialSupplierIds;
        private Long selectedSupplierId;
        private Integer quantity;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime estimatedDeliveryDate;
        
        private String notes;
    }
} 