package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.enums.QuoteStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequestItemDto {
    private Long id;
    private ProductDto product;
    private Set<SupplierDto> potentialSuppliers;
    private Set<SupplierQuoteDto> supplierQuotes;
    private Long selectedSupplierId;
    private Integer quantity;
    private LocalDateTime estimatedDeliveryDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductDto {
        private Long id;
        private String name;
        private String code;
        private String description;
        private String category;
        private String unit;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierDto {
        private Long id;
        private String name;
        private String taxNumber;
        private String contactPerson;
        private String contactPhone;
        private String contactEmail;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierQuoteDto {
        private Long id;
        private String quoteUid;
        private String quoteNumber;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal totalPrice;
        private String currency;
        private LocalDateTime deliveryDate;
        private LocalDateTime quoteDate;
        private LocalDateTime validityDate;
        private String notes;
        private String supplierReference;
        private QuoteStatus status;
        private String rejectionReason;
        private Boolean isSelected;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime respondedAt;
        private SupplierDto supplier;
    }
} 