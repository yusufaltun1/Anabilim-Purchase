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
 * Satınalma talepleri için Request entity'si
 */
@Entity
@Table(name = "requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Request {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "request_number", unique = true, nullable = false)
    private String requestNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    private User manager;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "priority")
    private String priority; // LOW, MEDIUM, HIGH, URGENT
    
    @Column(name = "urgency_reason")
    private String urgencyReason;
    
    @Column(name = "total_amount")
    private BigDecimal totalAmount;
    
    @Column(name = "currency", nullable = false)
    private String currency = "TRY";
    
    @Column(name = "status", nullable = false)
    private String status = "DRAFT"; // Dinamik status - enum yerine string
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id")
    private ApprovalWorkflow workflow;
    
    @Column(name = "current_step")
    private Integer currentStep = 0;
    
    @Column(name = "is_manual_entry", nullable = false)
    private Boolean isManualEntry = false;
    
    @Column(name = "email_request_id")
    private String emailRequestId; // E-posta talebinin ID'si
    
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<RequestItem> items = new ArrayList<>();
    
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RequestApproval> approvals = new ArrayList<>();
    
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RequestHistory> history = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    // Yardımcı metodlar
    public void addItem(RequestItem item) {
        items.add(item);
        item.setRequest(this);
    }
    
    public void removeItem(RequestItem item) {
        items.remove(item);
        item.setRequest(null);
    }
    
    public void addApproval(RequestApproval approval) {
        approvals.add(approval);
        approval.setRequest(this);
    }
    
    public void addHistory(RequestHistory historyEntry) {
        history.add(historyEntry);
        historyEntry.setRequest(this);
    }
} 