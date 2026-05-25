package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductProcurementSummaryDto {
    private List<RelatedPurchaseRequestRowDto> purchaseRequests = new ArrayList<>();
    private List<RelatedPurchaseOrderRowDto> purchaseOrders = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelatedPurchaseRequestRowDto {
        private Long requestId;
        private String title;
        private String status;
        private Long requestItemId;
        private Integer quantity;
        private LocalDateTime requestCreatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelatedPurchaseOrderRowDto {
        private Long orderId;
        private String orderCode;
        private String status;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String currency;
        private LocalDateTime createdAt;
    }
}
