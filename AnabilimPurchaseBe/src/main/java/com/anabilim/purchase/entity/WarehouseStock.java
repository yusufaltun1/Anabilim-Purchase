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
    
    @Column(name = "current_stock", nullable = false)
    private Integer currentStock = 0;
    
    @Column(name = "min_stock")
    private Integer minStock;
    
    @Column(name = "max_stock")
    private Integer maxStock;
    
    @OneToMany(mappedBy = "warehouseStock", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<StockMovement> movements = new HashSet<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public void addMovement(StockMovement movement) {
        movements.add(movement);
        movement.setWarehouseStock(this);
        
        // Stok miktarını güncelle
        switch (movement.getMovementType()) {
            case IN:
                this.currentStock += movement.getQuantity();
                break;
            case OUT:
                this.currentStock -= movement.getQuantity();
                break;
            case ADJUSTMENT:
                this.currentStock += movement.getQuantity(); // Pozitif veya negatif olabilir
                break;
        }
    }
    
    public void removeMovement(StockMovement movement) {
        if (movements.remove(movement)) {
            movement.setWarehouseStock(null);
            
            // Stok miktarını geri al
            switch (movement.getMovementType()) {
                case IN:
                    this.currentStock -= movement.getQuantity();
                    break;
                case OUT:
                    this.currentStock += movement.getQuantity();
                    break;
                case ADJUSTMENT:
                    this.currentStock -= movement.getQuantity(); // Pozitif veya negatif olabilir
                    break;
            }
        }
    }
} 