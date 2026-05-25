package com.anabilim.purchase.dto.request;

import com.anabilim.purchase.entity.enums.ProductType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCategoryDto {
    
    @NotBlank(message = "Kategori adı boş olamaz")
    @Size(min = 2, max = 100, message = "Kategori adı 2-100 karakter arasında olmalıdır")
    private String name;
    
    @Size(max = 500, message = "Açıklama en fazla 500 karakter olabilir")
    private String description;

    @NotNull(message = "Ürün tipi seçilmelidir")
    private ProductType productType;

    private Integer minStockNotifyAt;

    private Boolean requestable;
    
    private boolean isActive;
} 