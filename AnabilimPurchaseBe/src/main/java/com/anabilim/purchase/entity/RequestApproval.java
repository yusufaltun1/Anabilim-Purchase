package com.anabilim.purchase.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Talep onayları için RequestApproval entity'si
 */
@Entity
@Table(name = "request_approvals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestApproval {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private Request request;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    private User approver;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_step_id")
    private ApprovalStep workflowStep;
    
    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;
    
    @Column(name = "step_name", nullable = false)
    private String stepName;
    
    @Column(name = "action")
    private String action;
    
    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;
    
    @Column(name = "is_approved")
    private Boolean isApproved;
    
    @Column(name = "is_rejected")
    private Boolean isRejected;
    
    @Column(name = "is_returned_for_revision")
    private Boolean isReturnedForRevision;
    
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;
    
    @Column(name = "is_delegated", nullable = false)
    private Boolean isDelegated = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delegated_to_id")
    private User delegatedTo;
    
    @Column(name = "delegation_reason")
    private String delegationReason;
    
    @Column(name = "is_timeout", nullable = false)
    private Boolean isTimeout = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Yardımcı metodlar
    public boolean isPending() {
        return action == null && !isTimeout;
    }
    
    public boolean isCompleted() {
        return action != null || isTimeout;
    }
    
    public void approve(String comments) {
        this.action = "APPROVE";
        this.isApproved = true;
        this.isRejected = false;
        this.isReturnedForRevision = false;
        this.comments = comments;
        this.approvalDate = LocalDateTime.now();
    }
    
    public void reject(String comments) {
        this.action = "REJECT";
        this.isApproved = false;
        this.isRejected = true;
        this.isReturnedForRevision = false;
        this.comments = comments;
        this.approvalDate = LocalDateTime.now();
    }
    
    public void returnForRevision(String comments) {
        this.action = "RETURN_FOR_REVISION";
        this.isApproved = false;
        this.isRejected = false;
        this.isReturnedForRevision = true;
        this.comments = comments;
        this.approvalDate = LocalDateTime.now();
    }
} 