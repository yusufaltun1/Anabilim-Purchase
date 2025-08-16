package com.anabilim.purchase.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Onay akışı için DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalWorkflowDto {
    
    private Long id;
    
    @NotBlank(message = "Akış adı boş olamaz")
    private String name;
    
    private String description;
    
    @NotNull(message = "Aktiflik durumu belirtilmelidir")
    private Boolean isActive = true;
    
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private String category;
    
    @Valid
    private List<ApprovalStepDto> steps;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApprovalStepDto {
        private Long id;
        
        @NotNull(message = "Adım sırası belirtilmelidir")
        private Integer stepOrder;
        
        @NotBlank(message = "Adım adı boş olamaz")
        private String stepName;
        
        private String description;
        
        @NotNull(message = "Onaylayıcı türü belirtilmelidir")
        private String approverType; // SPECIFIC_USER, ROLE_BASED, MANAGER_HIERARCHY, etc.
        
        private Long specificApproverId;
        private Long approverRoleId;
        private String approvalLevel;
        
        @NotNull(message = "Zorunluluk durumu belirtilmelidir")
        private Boolean isRequired = true;
        
        @NotNull(message = "Yetki devretme durumu belirtilmelidir")
        private Boolean canDelegate = false;
        
        private Integer timeoutHours;
        
        @NotNull(message = "Aktiflik durumu belirtilmelidir")
        private Boolean isActive = true;
    }
} 