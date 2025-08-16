package com.anabilim.purchase.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Dinamik onay akışları için ApprovalWorkflow entity'si
 */
@Entity
@Table(name = "approval_workflows")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalWorkflow {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "min_amount")
    private BigDecimal minAmount;
    
    @Column(name = "max_amount")
    private BigDecimal maxAmount;
    
    @Column(name = "category")
    private String category; // Örn: OFFICE_SUPPLIES, IT_EQUIPMENT, FURNITURE
    
    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false;
    
    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    private List<ApprovalStep> steps = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Yardımcı metodlar
    public void addStep(ApprovalStep step) {
        steps.add(step);
        step.setWorkflow(this);
    }
    
    public void removeStep(ApprovalStep step) {
        steps.remove(step);
        step.setWorkflow(null);
    }
} 