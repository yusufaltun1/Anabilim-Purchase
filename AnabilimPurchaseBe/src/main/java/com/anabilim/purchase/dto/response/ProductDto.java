package com.anabilim.purchase.dto.response;

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
public class ProductDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private CategoryBasicDto category;
    private String productType;
    private String unit;
    private String serialNumber;
    private String imageUrl;
    private Integer minQuantity;
    private Integer maxQuantity;
    private BigDecimal estimatedUnitPrice;
    private Set<SupplierBasicDto> suppliers;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdByUserId;
    private String createdByUserName;

    private List<String> imageUrls;
    private String assetLabel;
    private String domainName;
    private Long deviceModelId;
    private String deviceModelName;
    private Long assetConditionId;
    private String assetConditionName;
    private Boolean allowsAssignment;
    private Long defaultParentLocationId;
    private Long defaultChildLocationId;
    private String defaultParentLocationName;
    private String defaultChildLocationName;
    private Long purchaseRequestId;
    private String purchaseRequestTitle;
    private LocalDateTime warrantyExpiryDate;
    private Integer warrantyMonths;
    private LocalDateTime lifespanEndDate;
    private LocalDateTime purchaseDate;
    private BigDecimal purchasePrice;
    private String orderNumber;
    private Boolean byod;
    private Long schoolId;
    private String schoolName;
    private String notes;
    private Long primarySupplierId;
    private String primarySupplierName;
    private String ipAddress;
    private String macAddress;

    /** Liste: stok kalemi durumu */
    private String stockItemStatus;
    private Long stockItemId;
    private Integer currentStock;
    private boolean canAssign;
    private boolean mustReturnFirst;
    /** Zimmet edilememe nedenleri (canAssign false iken dolu) */
    private List<String> assignBlockers;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierBasicDto {
        private Long id;
        private String name;
        private String taxNumber;
    }
} 