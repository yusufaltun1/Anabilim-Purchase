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
 * Tedarikçi teklif kalemleri için SupplierQuoteItem entity'si
 */
@Entity
@Table(name = "supplier_quote_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierQuoteItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_quote_id", nullable = false)
    private SupplierQuote supplierQuote;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_item_id", nullable = false)
    private RequestItem requestItem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    
    @Column(name = "product_name")
    private String productName;
    
    @Column(name = "product_description")
    private String productDescription;
    
    @Column(name = "brand")
    private String brand;
    
    @Column(name = "model")
    private String model;
    
    @Column(name = "quantity")
    private BigDecimal quantity;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "unit_of_measure")
    private UnitOfMeasure unitOfMeasure;
    
    @Column(name = "unit_price")
    private BigDecimal unitPrice;
    
    @Column(name = "total_price")
    private BigDecimal totalPrice;
    
    @Column(name = "currency")
    private String currency = "TRY";
    
    @Column(name = "delivery_time_days")
    private Integer deliveryTimeDays;
    
    @Column(name = "warranty_period")
    private String warrantyPeriod;
    
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Yardımcı metodlar
    public void calculateTotalPrice() {
        if (quantity != null && unitPrice != null) {
            this.totalPrice = quantity.multiply(unitPrice);
        }
    }
} 