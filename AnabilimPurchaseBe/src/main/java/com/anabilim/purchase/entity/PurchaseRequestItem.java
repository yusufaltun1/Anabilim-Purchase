package com.anabilim.purchase.entity;

import com.anabilim.purchase.entity.enums.QuoteStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.Formatter;


@Entity
@Table(name = "purchase_request_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequestItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_request_id", nullable = false)
    private PurchaseRequest purchaseRequest;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "purchase_request_item_potential_suppliers",
        joinColumns = @JoinColumn(name = "item_id"),
        inverseJoinColumns = @JoinColumn(name = "supplier_id")
    )
    private Set<Supplier> potentialSuppliers = new HashSet<>();
    
    @Column(name = "selected_supplier_id")
    private Long selectedSupplierId;
    
    @Column(name = "estimated_delivery_date")
    private LocalDateTime estimatedDeliveryDate;
    
    @Column(name = "notes")
    private String notes;
    
    @OneToMany(mappedBy = "requestItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SupplierQuote> supplierQuotes = new HashSet<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PurchaseRequestItem that = (PurchaseRequestItem) o;
        return Objects.equals(id, that.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    // Yardımcı metodlar
    public void addPotentialSupplier(Supplier supplier) {
        potentialSuppliers.add(supplier);
        
        // Otomatik olarak teklif kaydı oluştur
        SupplierQuote quote = new SupplierQuote();
        quote.setRequestItem(this);
        quote.setSupplier(supplier);
        quote.setQuantity(this.quantity);
        quote.setQuoteUid(UUID.randomUUID().toString());
        quote.setStatus(QuoteStatus.PENDING);
        
        // Quote number
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomNum = 1000 + (int)(Math.random() * 9000);
        quote.setQuoteNumber(String.format("QT-%s-%04d", datePart, randomNum));
        
        // Varsayılan teslim tarihi olarak tahmini teslim tarihini veya 30 gün sonrasını kullan
        LocalDateTime defaultDeliveryDate = this.estimatedDeliveryDate != null 
            ? this.estimatedDeliveryDate 
            : LocalDateTime.now().plusDays(30);
        quote.setDeliveryDate(defaultDeliveryDate);
        
        // Teklif tarihi olarak şu anki tarihi kullan
        quote.setQuoteDate(LocalDateTime.now());
        
        // Varsayılan para birimi
        quote.setCurrency("TRY");
        
        supplierQuotes.add(quote);
    }
    
    public void removePotentialSupplier(Supplier supplier) {
        potentialSuppliers.remove(supplier);
        supplierQuotes.removeIf(quote -> quote.getSupplier().equals(supplier));
    }
    
    public void addSupplierQuote(SupplierQuote quote) {
        supplierQuotes.add(quote);
        quote.setRequestItem(this);
    }
    
    public void removeSupplierQuote(SupplierQuote quote) {
        supplierQuotes.remove(quote);
        quote.setRequestItem(null);
    }
} 
