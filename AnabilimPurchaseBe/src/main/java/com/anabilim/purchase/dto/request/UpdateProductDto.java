package com.anabilim.purchase.dto.request;

import com.anabilim.purchase.entity.enums.ProductType;
import com.anabilim.purchase.entity.enums.UnitOfMeasure;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductDto {
    
    @NotBlank(message = "Ürün adı boş olamaz")
    @Size(min = 2, max = 100, message = "Ürün adı 2-100 karakter arasında olmalıdır")
    private String name;

    @Size(max = 100, message = "Seri numarası en fazla 100 karakter olabilir")
    private String serialnumber;


    private String imageUrl;


    @Size(max = 500, message = "Açıklama en fazla 500 karakter olabilir")
    private String description;
    
    @NotNull(message = "Kategori ID'si boş olamaz")
    private Long categoryId;
    
    @NotNull(message = "Ürün tipi boş olamaz")
    private ProductType productType;
    
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
    
    private boolean isActive;

    private List<String> imageUrls;
    private String assetLabel;
    private String domainName;
    private Long deviceModelId;
    private Long assetConditionId;
    private Long defaultParentLocationId;
    private Long defaultChildLocationId;
    private Long purchaseRequestId;
    private LocalDateTime warrantyExpiryDate;
    private Integer warrantyMonths;
    private LocalDateTime lifespanEndDate;
    private LocalDateTime purchaseDate;
    private BigDecimal purchasePrice;
    private String orderNumber;
    private Boolean byod;
    private Long schoolId;
    private String notes;
    private String ipAddress;
    private String macAddress;
} 