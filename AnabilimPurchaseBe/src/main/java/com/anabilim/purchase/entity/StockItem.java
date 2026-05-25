package com.anabilim.purchase.entity;

import com.anabilim.purchase.entity.enums.StockItemStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Seri numaralı ürünlerin detaylı takibi için StockItem entity'si
 * Her bir seri numaralı ürün için ayrı kayıt tutulur
 */
@Entity
@Table(name = "stock_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "serial_number")
    private String serialNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StockItemStatus status = StockItemStatus.IN_STOCK;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_warehouse_id")
    private Warehouse currentWarehouse;
    

    

    @Column(name = "purchase_price")
    private BigDecimal purchasePrice;
    
    @Column(name = "purchase_date")
    private LocalDateTime purchaseDate;
    
    @Column(name = "warranty_expiry_date")
    private LocalDateTime warrantyExpiryDate;
    
    @Column(name = "location_details")
    private String locationDetails;

    @Column(name = "asset_label")
    private String assetLabel;

    @Column(name = "domain_name")
    private String domainName;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "mac_address")
    private String macAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_model_id")
    private DeviceModel deviceModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_condition_id")
    private AssetCondition assetCondition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_parent_location_id")
    private Location defaultParentLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_child_location_id")
    private Location defaultChildLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @Column(name = "order_number")
    private String orderNumber;

    @Column(name = "byod")
    private Boolean byod = false;

    @Column(name = "warranty_months")
    private Integer warrantyMonths;

    @Column(name = "lifespan_end_date")
    private LocalDateTime lifespanEndDate;
    
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;
    
    @Column(name = "additional_images", columnDefinition = "TEXT")
    private String additionalImages; // JSON array olarak birden fazla resim URL'i
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Yardımcı metodlar
    public boolean isInStock() {
        return StockItemStatus.IN_STOCK.equals(this.status);
    }
    
    public boolean isAssigned() {
        return StockItemStatus.ASSIGNED.equals(this.status) || 
               StockItemStatus.IN_USE.equals(this.status);
    }
    
    public boolean isAvailable() {
        return StockItemStatus.IN_STOCK.equals(this.status);
    }
    
    public boolean isUnderWarranty() {
        return warrantyExpiryDate != null && 
               warrantyExpiryDate.isAfter(LocalDateTime.now());
    }
    
    public void markAsInUse() {
        this.status = StockItemStatus.IN_USE;
    }
    
    public void markAsMaintenance() {
        this.status = StockItemStatus.MAINTENANCE;
    }
    
    public void markAsRetired() {
        this.status = StockItemStatus.RETIRED;
        this.isActive = false;
    }
}
