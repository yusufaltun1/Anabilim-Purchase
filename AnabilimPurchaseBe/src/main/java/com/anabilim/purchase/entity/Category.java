package com.anabilim.purchase.entity;

import com.anabilim.purchase.entity.enums.ProductType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "code", unique = true, nullable = false)
    private String code;
    
    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type")
    private ProductType productType = ProductType.CONSUMABLE;

    /** Kalan miktar bu değere veya altına düştüğünde günlük bildirim gönderilir */
    @Column(name = "min_stock_notify_at")
    private Integer minStockNotifyAt;

    @Column(name = "requestable")
    private Boolean requestable = false;
    
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private Set<Product> products = new HashSet<>();
    
    @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
    private Set<Supplier> suppliers = new HashSet<>();
    
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public boolean hasProducts() {
        return !products.isEmpty();
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Category category = (Category) o;
        return Objects.equals(id, category.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
} 