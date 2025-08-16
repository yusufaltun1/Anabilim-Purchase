package com.anabilim.purchase.entity;

import com.anabilim.purchase.entity.enums.QuoteStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.UUID;

/**
 * Tedarikçi teklifleri için SupplierQuote entity'si
 */
@Entity
@Table(name = "supplier_quotes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplierQuote {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "quote_uid", nullable = false, unique = true)
    private String quoteUid;
    
    @Column(name = "quote_number")
    private String quoteNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_item_id", nullable = false)
    private PurchaseRequestItem requestItem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;
    
    @Column(name = "unit_price")
    private BigDecimal unitPrice;
    
    @Column(name = "quantity")
    private Integer quantity;
    
    @Column(name = "total_price")
    private BigDecimal totalPrice;
    
    @Column(name = "currency")
    private String currency = "TRY";
    
    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;
    
    @Column(name = "quote_date")
    private LocalDateTime quoteDate;
    
    @Column(name = "validity_date")
    private LocalDateTime validityDate;
    
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "supplier_reference")
    private String supplierReference;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private QuoteStatus status = QuoteStatus.PENDING;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "is_selected")
    private Boolean isSelected = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    @PrePersist
    public void prePersist() {
        if (this.quoteUid == null) {
            this.quoteUid = UUID.randomUUID().toString();
        }
        if (this.quoteNumber == null) {
            // Format: QT-YYYYMMDD-XXXX where XXXX is a random number between 1000-9999
            String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            int randomNum = 1000 + (int)(Math.random() * 9000);
            this.quoteNumber = String.format("QT-%s-%04d", datePart, randomNum);
        }
        if (this.totalPrice == null && this.unitPrice != null && this.quantity != null) {
            this.totalPrice = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
        }
        if (this.isSelected == null) {
            this.isSelected = false;
        }
        if (this.quoteDate == null) {
            this.quoteDate = LocalDateTime.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SupplierQuote that = (SupplierQuote) o;
        return Objects.equals(id, that.id);
    }
} 