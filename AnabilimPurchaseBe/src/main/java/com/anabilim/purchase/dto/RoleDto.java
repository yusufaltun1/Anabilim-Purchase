package com.anabilim.purchase.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Rol veri transfer objesi
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDto {
    
    private Long id;
    
    private String name;
    
    private String displayName;
    
    private String description;
    
    private Boolean isActive;
    
    private Boolean isSystemRole;
    
    private Set<String> permissionNames;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 