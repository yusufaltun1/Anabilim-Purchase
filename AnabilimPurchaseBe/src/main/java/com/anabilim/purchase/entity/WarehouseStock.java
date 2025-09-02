package com.anabilim.purchase.entity;

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

@Entity
@Table(name = "warehouse_stocks", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"warehouse_id", "product_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseStock {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    // currentStock artık veritabanında tutulmuyor, dinamik olarak hesaplanıyor
    @Transient
    private Integer currentStock;
    
    @Column(name = "min_stock")
    private Integer minStock;
    
    @Column(name = "max_stock")
    private Integer maxStock;
    
    @OneToMany(mappedBy = "warehouseStock", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<StockMovement> movements = new HashSet<>();
    
    // Bu ilişki gereksiz, StockItem zaten currentWarehouse ile Warehouse'a bağlı
    // @OneToMany(mappedBy = "currentWarehouse", fetch = FetchType.LAZY)
    // private Set<StockItem> stockItems = new HashSet<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public void addMovement(StockMovement movement) {
        movements.add(movement);
        movement.setWarehouseStock(this);
    }
    
    public void removeMovement(StockMovement movement) {
        if (movements.remove(movement)) {
            movement.setWarehouseStock(null);
        }
    }
    
    // Stok takip tipi kontrol metodları
    public boolean isSerialNumberTracked() {
        return product != null && product.isSerialNumberTracked();
    }
    
    public boolean isQuantityOnlyTracked() {
        return product != null && product.isQuantityOnlyTracked();
    }
    
    public boolean isQuantityReusableTracked() {
        return product != null && product.isQuantityReusableTracked();
    }
    
    // Bu metodlar artık Service katmanında StockItemRepository kullanılarak hesaplanacak
    // public int getSerialNumberStockCount() {
    //     if (!isSerialNumberTracked()) {
    //         return 0;
    //     }
    //     return (int) stockItems.stream()
    //             .filter(item -> item.isInStock())
    //             .count();
    // }
    
    // public int getAssignedStockCount() {
    //     if (!isSerialNumberTracked()) {
    //         return 0;
    //     }
    //     return (int) stockItems.stream()
    //             .filter(item -> item.isAssigned())
    //             .count();
    // }
    
    // Stok durumu kontrol metodları
    public boolean isLowStock() {
        return minStock != null && currentStock <= minStock;
    }
    
    public boolean isOutOfStock() {
        return currentStock <= 0;
    }
    
    public boolean hasAvailableStock() {
        return currentStock > 0;
    }
    
    /**
     * StockMovement kayıtlarından dinamik olarak mevcut stok miktarını hesaplar
     */
    public int calculateCurrentStock() {
        return movements.stream()
                .mapToInt(movement -> {
                    switch (movement.getMovementType()) {
                        case IN:
                            return movement.getQuantity();
                        case OUT:
                            return -movement.getQuantity();
                        case ADJUSTMENT:
                            return movement.getQuantity(); // Pozitif veya negatif olabilir
                        default:
                            return 0;
                    }
                })
                .sum();
    }
    
    /**
     * Dinamik olarak mevcut stok miktarını hesaplar ve döner
     */
    public int getCurrentStock() {
        return calculateCurrentStock();
    }
    

} 