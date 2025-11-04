package com.anabilim.purchase.entity;

import com.anabilim.purchase.entity.enums.AssignmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Zimmet kayıtları için Assignment entity'si
 * Kullanıcıya veya konuma zimmet atama işlemlerini takip eder
 */
@Entity
@Table(name = "assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_item_id")
    private StockItem stockItem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_user_id")
    private User assignedUser;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_location_id")
    private Location assignedLocation;
    
    @Column(name = "location_name")
    private String locationName; // Konuma zimmet için
    
    @Column(name = "location_details")
    private String locationDetails;
    
    @Column(name = "assignment_date", nullable = false)
    private LocalDateTime assignmentDate;
    
    @Column(name = "expected_return_date")
    private LocalDate expectedReturnDate; // Sarf malzemeler için süre
    
    @Column(name = "actual_return_date")
    private LocalDateTime actualReturnDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AssignmentStatus status = AssignmentStatus.ACTIVE;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1; // SEMI_FIXED_ASSET için adet
    
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
    public boolean isActive() {
        return this.isActive && AssignmentStatus.ACTIVE.equals(this.status);
    }
    
    public boolean isReturned() {
        return AssignmentStatus.RETURNED.equals(this.status);
    }
    
    public boolean isExpired() {
        return expectedReturnDate != null && 
               expectedReturnDate.isBefore(LocalDate.now()) &&
               AssignmentStatus.ACTIVE.equals(this.status);
    }
    
    /**
     * Geçerlilik tarihi geçmişse otomatik olarak kapatır
     */
    public void autoCloseIfExpired() {
        if (isExpired()) {
            this.status = AssignmentStatus.EXPIRED;
//            this.actualReturnDate = LocalDate.now();
        }
    }
    
    public boolean isUserAssignment() {
        return assignedUser != null;
    }
    
    public boolean isLocationAssignment() {
        return assignedLocation != null && assignedUser == null;
    }
    
    public boolean canBeReturned() {
        // CONSUMABLE ürünler geri kazandırılamaz
        if (product != null && product.isConsumable()) {
            return false;
        }
        return AssignmentStatus.ACTIVE.equals(this.status);
    }
    
    public void markAsReturned() {
        this.status = AssignmentStatus.RETURNED;
        this.actualReturnDate = LocalDateTime.now();
    }
    
    public void markAsExpired() {
        this.status = AssignmentStatus.EXPIRED;
    }
    
    public void markAsLost() {
        this.status = AssignmentStatus.LOST;
    }
    
    public void markAsDamaged() {
        this.status = AssignmentStatus.DAMAGED;
    }
    
    public void transferToUser(User newUser, Location newLocation) {
        this.assignedUser = newUser;
        this.assignedLocation = newLocation;
        this.locationName = null; // Konum zimmeti kaldırılır
        this.status = AssignmentStatus.TRANSFERRED;
    }
    
    public void transferToLocation(String newLocationName, String newLocationDetails) {
        this.assignedUser = null;
        this.assignedLocation = null;
        this.locationName = newLocationName;
        this.locationDetails = newLocationDetails;
        this.status = AssignmentStatus.TRANSFERRED;
    }
}
