package com.anabilim.purchase.dto.response;

import com.anabilim.purchase.entity.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderDto {
    private Long id;
    private String orderCode;
    private SupplierQuoteDto supplierQuote;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private WarehouseDto deliveryWarehouse;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private OrderStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 