package com.anabilim.purchase.entity;

import com.anabilim.purchase.entity.enums.InventoryTransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Envanter işlemleri için InventoryTransaction entity'si
 */
@Entity
@Table(name = "inventory_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "transaction_number", unique = true, nullable = false)
    private String transactionNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private InventoryTransactionType transactionType;
    
    @Column(name = "quantity", nullable = false)
    private BigDecimal quantity;
    
    @Column(name = "unit_price")
    private BigDecimal unitPrice;
    
    @Column(name = "total_value")
    private BigDecimal totalValue;
    
    @Column(name = "currency", nullable = false)
    private String currency = "TRY";
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private Request request;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;
    
    @Column(name = "location")
    private String location; // Depo, sınıf, ofis vb.
    
    @Column(name = "barcode")
    private String barcode;
    
    @Column(name = "qr_code")
    private String qrCode;
    
    @Column(name = "batch_number")
    private String batchNumber;
    
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "reference_number")
    private String referenceNumber; // Fatura no, irsaliye no vb.
    
    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;
    
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Yardımcı metodlar
    public void calculateTotalValue() {
        if (quantity != null && unitPrice != null) {
            this.totalValue = quantity.multiply(unitPrice);
        }
    }
    
    public boolean isInbound() {
        return transactionType == InventoryTransactionType.IN || 
               transactionType == InventoryTransactionType.ASSIGNMENT;
    }
    
    public boolean isOutbound() {
        return transactionType == InventoryTransactionType.OUT || 
               transactionType == InventoryTransactionType.RETURN;
    }
} 