package com.anabilim.purchase.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseRequestDto {
    
    @NotBlank(message = "Başlık boş olamaz")
    @Size(min = 3, max = 255, message = "Başlık 3-255 karakter arasında olmalıdır")
    private String title;
    
    @NotBlank(message = "Açıklama boş olamaz")
    @Size(min = 10, max = 2000, message = "Açıklama 10-2000 karakter arasında olmalıdır")
    private String description;
    
    @NotEmpty(message = "En az bir ürün eklenmelidir")
    private List<@Valid PurchaseRequestItemDto> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseRequestItemDto {
        @NotNull(message = "Ürün seçilmelidir")
        private Long productId;
        
        @NotNull(message = "Miktar belirtilmelidir")
        private Integer quantity;
        
        @NotEmpty(message = "En az bir potansiyel tedarikçi eklenmelidir")
        private Set<Long> potentialSupplierIds;
        
        private LocalDateTime estimatedDeliveryDate;
        private String notes;
    }
} 