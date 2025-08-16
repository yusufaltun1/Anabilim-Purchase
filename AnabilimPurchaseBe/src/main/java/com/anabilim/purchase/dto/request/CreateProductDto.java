package com.anabilim.purchase.dto.request;

import com.anabilim.purchase.entity.enums.ProductType;
import com.anabilim.purchase.entity.enums.UnitOfMeasure;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductDto {
    
    @NotBlank(message = "Ürün adı boş olamaz")
    @Size(min = 2, max = 100, message = "Ürün adı 2-100 karakter arasında olmalıdır")
    private String name;
    
    @NotBlank(message = "Ürün kodu boş olamaz")
    @Pattern(regexp = "^[A-Z0-9_]{2,20}$", message = "Ürün kodu sadece büyük harf, rakam ve alt çizgi içerebilir (2-20 karakter)")
    private String code;
    
    @Size(max = 500, message = "Açıklama en fazla 500 karakter olabilir")
    private String description;
    
    @NotNull(message = "Kategori ID'si boş olamaz")
    private Long categoryId;
    
    @NotNull(message = "Ürün tipi boş olamaz")
    private ProductType productType = ProductType.OTHER;
    
    @NotNull(message = "Ölçü birimi boş olamaz")
    private UnitOfMeasure unitOfMeasure;
    
    @Min(value = 0, message = "Minimum miktar 0'dan küçük olamaz")
    private Integer minQuantity;
    
    @Min(value = 0, message = "Maksimum miktar 0'dan küçük olamaz")
    private Integer maxQuantity;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Tahmini birim fiyat 0'dan küçük olamaz")
    private BigDecimal estimatedUnitPrice;
    
    @NotBlank(message = "Para birimi boş olamaz")
    private String currency = "TRY";
    
    private Set<Long> supplierIds;
} 