package com.anabilim.purchase.entity;

import com.anabilim.purchase.entity.enums.TransferStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Eşya transfer yönetimi için AssetTransfer entity'si
 * Depodan okula eşya transferi için kullanılır
 */
@Entity
@Table(name = "asset_transfers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssetTransfer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "transfer_code", unique = true, nullable = false)
    private String transferCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_warehouse_id", nullable = false)
    private Warehouse sourceWarehouse; // Kaynak depo

    /**
     * Hedef depo (artık hedef okul yerine depo seçiliyor)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_warehouse_id")
    private Warehouse targetWarehouse; // Hedef depo

    /**
     * Eski alan: hedef okul.
     * Şimdilik geriye dönük uyumluluk için tutuluyor, yeni geliştirmelerde kullanılmamalı.
     */

    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TransferStatus status = TransferStatus.PENDING;
    
    @Column(name = "transfer_date")
    private LocalDateTime transferDate; // Planlanan transfer tarihi
    
    @Column(name = "actual_transfer_date")
    private LocalDateTime actualTransferDate; // Gerçek transfer tarihi
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_user_id")
    private User requestedBy; // Transfer isteyen kişi
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy; // Transfer onaylayan kişi
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivered_by_user_id")
    private User deliveredBy; // Transfer yapan kişi (kurye/personel)
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "received_by_user_id")
    private User receivedBy; // Transfer alan kişi (okul personeli)

    /**
     * Kendim yöneteceğim flag'i.
     * true ise alıcı kullanıcı seçilmeden transfer oluşturulabilir.
     */
    @Column(name = "self_managed")
    private Boolean selfManaged = false;
    
    @OneToMany(mappedBy = "assetTransfer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<AssetTransferItem> transferItems = new HashSet<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Yardımcı metodlar
    public void addTransferItem(AssetTransferItem item) {
        transferItems.add(item);
        item.setAssetTransfer(this);
    }
    
    public void removeTransferItem(AssetTransferItem item) {
        transferItems.remove(item);
        item.setAssetTransfer(null);
    }
    
    public boolean isCompleted() {
        return TransferStatus.COMPLETED.equals(this.status);
    }
    
    public boolean isPending() {
        return TransferStatus.PENDING.equals(this.status);
    }
    
    public boolean isApproved() {
        return TransferStatus.APPROVED.equals(this.status);
    }
} 