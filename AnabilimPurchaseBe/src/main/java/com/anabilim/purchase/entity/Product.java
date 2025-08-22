package com.anabilim.purchase.entity;

import com.anabilim.purchase.entity.enums.ProductType;
import com.anabilim.purchase.entity.enums.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Ürün yönetimi için Product entity'si
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "serial_number" , nullable = false)
    private String serialNumber;

    @Column(name = "image_url" , columnDefinition = "TEXT", nullable = false)
    private String imageUrl;

    @Column(name = "product_code", unique = true, nullable = false)
    private String code;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    private ProductType productType = ProductType.OTHER;
    
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WarehouseStock> stocks = new HashSet<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "unit_of_measure", nullable = false)
    private UnitOfMeasure unitOfMeasure;
    
    @Column(name = "min_quantity")
    private Integer minQuantity;
    
    @Column(name = "max_quantity")
    private Integer maxQuantity;
    
    @Column(name = "current_stock")
    private Integer currentStock = 0;
    
    @Column(name = "estimated_unit_price")
    private BigDecimal estimatedUnitPrice;
    
    @Column(name = "currency", nullable = false)
    private String currency = "TRY";
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "product_suppliers",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "supplier_id")
    )
    private Set<Supplier> suppliers = new HashSet<>();
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PurchaseRequestItem> purchaseRequestItems = new HashSet<>();
    
    // Yardımcı metodlar
    public boolean isLowStock() {
        return minQuantity != null && currentStock != null && currentStock <= minQuantity;
    }
    
    public boolean isOutOfStock() {
        return currentStock == null || currentStock <= 0;
    }
    
    public void addSupplier(Supplier supplier) {
        suppliers.add(supplier);
        supplier.getProducts().add(this);
    }
    
    public void removeSupplier(Supplier supplier) {
        suppliers.remove(supplier);
        supplier.getProducts().remove(this);
    }
    
    // Ürün tipi kontrol metodları
    public boolean isFixedAsset() {
        return ProductType.FIXED_ASSET.equals(this.productType);
    }
    
    public boolean isConsumable() {
        return ProductType.CONSUMABLE.equals(this.productType);
    }
    
    public boolean isService() {
        return ProductType.SERVICE.equals(this.productType);
    }
} 