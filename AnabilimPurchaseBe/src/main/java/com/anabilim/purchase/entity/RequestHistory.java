package com.anabilim.purchase.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Talep geçmişi için RequestHistory entity'si
 */
@Entity
@Table(name = "request_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private Request request;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "action", nullable = false)
    private String action; // CREATED, SUBMITTED, APPROVED, REJECTED, etc.
    
    @Column(name = "status_from")
    private String statusFrom;
    
    @Column(name = "status_to")
    private String statusTo;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
} 