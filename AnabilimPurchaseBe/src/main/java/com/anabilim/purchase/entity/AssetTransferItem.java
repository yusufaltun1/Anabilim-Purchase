package com.anabilim.purchase.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Transfer edilen eşya kalemlerini temsil eden entity
 */
@Entity
@Table(name = "asset_transfer_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssetTransferItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_transfer_id", nullable = false)
    private AssetTransfer assetTransfer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "requested_quantity", nullable = false)
    private Integer requestedQuantity; // İstenen miktar
    
    @Column(name = "transferred_quantity")
    private Integer transferredQuantity; // Gerçek transfer edilen miktar
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "serial_numbers", columnDefinition = "TEXT")
    private String serialNumbers; // Seri numaraları (özellikle demirbaş için)
    
    @Column(name = "condition_notes", columnDefinition = "TEXT")
    private String conditionNotes; // Eşyanın durumu hakkında notlar
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Yardımcı metodlar
    public boolean isFullyTransferred() {
        return transferredQuantity != null && 
               requestedQuantity != null && 
               transferredQuantity.equals(requestedQuantity);
    }
    
    public boolean isPartiallyTransferred() {
        return transferredQuantity != null && 
               transferredQuantity > 0 && 
               (requestedQuantity == null || !transferredQuantity.equals(requestedQuantity));
    }
    
    public Integer getRemainingQuantity() {
        if (requestedQuantity == null) return 0;
        if (transferredQuantity == null) return requestedQuantity;
        return Math.max(0, requestedQuantity - transferredQuantity);
    }
} 