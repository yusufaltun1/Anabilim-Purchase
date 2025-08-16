package com.anabilim.purchase.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Onay akışı adımları için ApprovalStep entity'si
 */
@Entity
@Table(name = "approval_steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStep {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    private ApprovalWorkflow workflow;
    
    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;
    
    @Column(name = "step_name", nullable = false)
    private String stepName;
    
    @Column(name = "description")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "approver_type", nullable = false)
    private ApproverType approverType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specific_approver_id")
    private User specificApprover;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_role_id")
    private Role approverRole;
    
    @Column(name = "approval_level")
    private String approvalLevel; // Örn: MANAGER, DIRECTOR, CEO
    
    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = true;
    
    @Column(name = "can_delegate", nullable = false)
    private Boolean canDelegate = false;
    
    @Column(name = "timeout_hours")
    private Integer timeoutHours;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Onaylayıcı türleri enum'u
     */
    public enum ApproverType {
        SPECIFIC_USER("Belirli Kullanıcı"),
        ROLE_BASED("Rol Bazlı"),
        MANAGER_HIERARCHY("Yönetici Hiyerarşisi"),
        DEPARTMENT_HEAD("Bölüm Başkanı"),
        UNIT_MANAGER("Birim Müdürü");
        
        private final String displayName;
        
        ApproverType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
} 