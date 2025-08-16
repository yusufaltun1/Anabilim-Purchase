package com.anabilim.purchase.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Sistem ayarları için SystemConfiguration entity'si
 */
@Entity
@Table(name = "system_configurations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfiguration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "config_key", unique = true, nullable = false)
    private String configKey;
    
    @Column(name = "config_value", columnDefinition = "TEXT")
    private String configValue;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "category")
    private String category; // EMAIL, APPROVAL, NOTIFICATION, etc.
    
    @Column(name = "data_type", nullable = false)
    private String dataType; // STRING, INTEGER, BOOLEAN, JSON, etc.
    
    @Column(name = "is_encrypted", nullable = false)
    private Boolean isEncrypted = false;
    
    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Yardımcı metodlar
    public boolean isEmailConfig() {
        return "EMAIL".equals(category);
    }
    
    public boolean isApprovalConfig() {
        return "APPROVAL".equals(category);
    }
    
    public boolean isNotificationConfig() {
        return "NOTIFICATION".equals(category);
    }
} 