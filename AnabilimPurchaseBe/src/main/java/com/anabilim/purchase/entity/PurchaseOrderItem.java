package com.anabilim.purchase.entity;

import com.anabilim.purchase.entity.enums.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Sipariş kalemleri için PurchaseOrderItem entity'si
 */
@Entity
@Table(name = "purchase_order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_item_id", nullable = false)
    private RequestItem requestItem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    
    @Column(name = "product_name", nullable = false)
    private String productName;
    
    @Column(name = "product_description")
    private String productDescription;
    
    @Column(name = "brand")
    private String brand;
    
    @Column(name = "model")
    private String model;
    
    @Column(name = "ordered_quantity", nullable = false)
    private BigDecimal orderedQuantity;
    
    @Column(name = "received_quantity")
    private BigDecimal receivedQuantity = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "unit_of_measure", nullable = false)
    private UnitOfMeasure unitOfMeasure;
    
    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;
    
    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;
    
    @Column(name = "currency", nullable = false)
    private String currency = "TRY";
    
    @Column(name = "warranty_period")
    private String warrantyPeriod;
    
    @Column(name = "notes")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Yardımcı metodlar
    public void calculateTotalPrice() {
        if (orderedQuantity != null && unitPrice != null) {
            this.totalPrice = orderedQuantity.multiply(unitPrice);
        }
    }
    
    public BigDecimal getRemainingQuantity() {
        return orderedQuantity.subtract(receivedQuantity);
    }
    
    public boolean isFullyReceived() {
        return receivedQuantity.compareTo(orderedQuantity) >= 0;
    }
} 