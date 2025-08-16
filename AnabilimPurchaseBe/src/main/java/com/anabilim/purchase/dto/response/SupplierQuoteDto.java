package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.enums.QuoteStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierQuoteDto {
    private Long id;
    private String quoteUid;
    private Long requestItemId;
    private ProductDto product;
    private SupplierDto supplier;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice;
    private String currency;
    private LocalDateTime deliveryDate;
    private LocalDateTime validityDate;
    private String notes;
    private String supplierReference;
    private QuoteStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime respondedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductDto {
        private Long id;
        private String name;
        private String code;
        private String description;
        private String category;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierDto {
        private Long id;
        private String companyName;
        private String taxNumber;
        private String contactPerson;
        private String contactPhone;
        private String contactEmail;
    }
} 