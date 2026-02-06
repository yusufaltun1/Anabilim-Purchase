package com.anabilim.purchase.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
public class UpdatePurchaseRequestDto {
    
    @NotBlank(message = "Başlık boş olamaz")
    @Size(min = 3, max = 255, message = "Başlık 3-255 karakter arasında olmalıdır")
    private String title;
    
    @NotBlank(message = "Açıklama boş olamaz")
    @Size(min = 10, max = 2000, message = "Açıklama 10-2000 karakter arasında olmalıdır")
    private String description;

    @NotEmpty(message = "En az bir ürün eklenmelidir")
    private List<@Valid UpdatePurchaseRequestItemDto> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdatePurchaseRequestItemDto {
        private Long id; // Mevcut item'ın id'si (yeni item için null)
        
        @NotBlank(message = "Ürün adı boş olamaz")
        private String productName;
        
        private String description;
        private String imageBase64;
        private String productLink;
        
        @jakarta.validation.constraints.NotNull(message = "Miktar belirtilmelidir")
        private Integer quantity;
        
        private Set<Long> potentialSupplierIds;
        private Long productId;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime estimatedDeliveryDate;
        private String notes;
    }
}
