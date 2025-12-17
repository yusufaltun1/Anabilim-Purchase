package com.anabilim.purchase.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
        @NotEmpty(message = "En az bir potansiyel tedarikçi eklenmelidir")
        private Set<Long> potentialSupplierIds;
        
        private Long selectedSupplierId;
        
        @NotNull(message = "Miktar belirtilmelidir")
        private Integer quantity;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime estimatedDeliveryDate;
        private Long productId;
        private String notes;
        
        // Ürün bilgileri
        private String productName;
        private String description;
        private String imageBase64;
        private String productLink;
    }
} 