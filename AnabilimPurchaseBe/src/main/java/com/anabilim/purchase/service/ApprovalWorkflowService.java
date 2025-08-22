package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.ApprovalWorkflowDto;
import com.anabilim.purchase.entity.ApprovalStep;
import com.anabilim.purchase.entity.ApprovalWorkflow;
import com.anabilim.purchase.entity.Role;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.repository.ApprovalWorkflowRepository;
import com.anabilim.purchase.repository.RoleRepository;
import com.anabilim.purchase.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ApprovalWorkflow service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalWorkflowService {
    
    private final ApprovalWorkflowRepository workflowRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    
    public List<ApprovalWorkflow> getAllActiveWorkflows() {
        return workflowRepository.findByIsActiveTrue();
    }
    public List<ApprovalWorkflow> getAllWorkflows() {
        return workflowRepository.findAll();
    }

    public List<ApprovalWorkflow> getAllInActiveWorkFlow(){return workflowRepository.findByIsActiveFalse();}
    public List<ApprovalWorkflow> getWorkflowsByCategory(String category) {
        return workflowRepository.findByCategoryAndIsActiveTrue(category);
    }
    
    public Optional<ApprovalWorkflow> getWorkflowById(Long id) {
        return workflowRepository.findById(id);
    }
    
    public List<ApprovalWorkflow> findMatchingWorkflows(BigDecimal amount, String category) {
        return workflowRepository.findMatchingWorkflows(amount, category);
    }
    
    public List<String> getDistinctCategories() {
        return workflowRepository.findDistinctCategories();
    }
    
    @Transactional
    public ApprovalWorkflow createWorkflow(ApprovalWorkflowDto workflowDto) {
        // İsim kontrolü
        if (workflowRepository.existsByName(workflowDto.getName())) {
            throw new RuntimeException("Bu isimde bir onay akışı zaten mevcut: " + workflowDto.getName());
        }
        
        // Workflow oluştur
        ApprovalWorkflow workflow = new ApprovalWorkflow();
        workflow.setName(workflowDto.getName());
        workflow.setDescription(workflowDto.getDescription());
        workflow.setIsActive(workflowDto.getIsActive());
        workflow.setMinAmount(workflowDto.getMinAmount());
        workflow.setMaxAmount(workflowDto.getMaxAmount());
        workflow.setCategory(workflowDto.getCategory());
        
        // Adımları ekle
        if (workflowDto.getSteps() != null) {
            for (ApprovalWorkflowDto.ApprovalStepDto stepDto : workflowDto.getSteps()) {
                ApprovalStep step = createApprovalStep(stepDto);
                workflow.addStep(step);
            }
        }
        
        return workflowRepository.save(workflow);
    }
    
    @Transactional
    public ApprovalWorkflow updateWorkflow(Long id, ApprovalWorkflowDto workflowDto) {
        ApprovalWorkflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Onay akışı bulunamadı: " + id));
        
        // İsim kontrolü (kendisi hariç)
        if (!workflow.getName().equals(workflowDto.getName()) && 
            workflowRepository.existsByName(workflowDto.getName())) {
            throw new RuntimeException("Bu isimde bir onay akışı zaten mevcut: " + workflowDto.getName());
        }
        
        // Workflow güncelle
        workflow.setName(workflowDto.getName());
        workflow.setDescription(workflowDto.getDescription());
        workflow.setIsActive(workflowDto.getIsActive());
        workflow.setMinAmount(workflowDto.getMinAmount());
        workflow.setMaxAmount(workflowDto.getMaxAmount());
        workflow.setCategory(workflowDto.getCategory());
        
        // Mevcut adımları temizle
        workflow.getSteps().clear();
        
        // Yeni adımları ekle
        if (workflowDto.getSteps() != null) {
            for (ApprovalWorkflowDto.ApprovalStepDto stepDto : workflowDto.getSteps()) {
                ApprovalStep step = createApprovalStep(stepDto);
                workflow.addStep(step);
            }
        }
        
        return workflowRepository.save(workflow);
    }
    
    @Transactional
    public void deleteWorkflow(Long id) {
        ApprovalWorkflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Onay akışı bulunamadı: " + id));
        
        // Sistem akışı kontrolü
        if (workflow.getIsSystem() != null && workflow.getIsSystem()) {
            throw new RuntimeException("Sistem onay akışları silinemez");
        }
        
        workflowRepository.delete(workflow);
    }
    
    @Transactional
    public void deactivateWorkflow(Long id) {
        ApprovalWorkflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Onay akışı bulunamadı: " + id));
        
        workflow.setIsActive(false);
        workflowRepository.save(workflow);
    }
    
    private ApprovalStep createApprovalStep(ApprovalWorkflowDto.ApprovalStepDto stepDto) {
        ApprovalStep step = new ApprovalStep();
        step.setStepOrder(stepDto.getStepOrder());
        step.setStepName(stepDto.getStepName());
        step.setDescription(stepDto.getDescription());
        step.setApproverType(ApprovalStep.ApproverType.ROLE_BASED);
        step.setApprovalLevel(stepDto.getApprovalLevel());
        step.setIsRequired(stepDto.getIsRequired());
        step.setCanDelegate(stepDto.getCanDelegate());
        step.setTimeoutHours(stepDto.getTimeoutHours());
        step.setIsActive(stepDto.getIsActive());
        
        // Belirli kullanıcı ataması
        if (stepDto.getSpecificApproverId() != null) {
            User approver = userRepository.findById(stepDto.getSpecificApproverId())
                    .orElseThrow(() -> new RuntimeException("Onaylayıcı kullanıcı bulunamadı: " + stepDto.getSpecificApproverId()));
            step.setSpecificApprover(approver);
        }
        
        // Rol ataması
        if (stepDto.getApproverRoleId() != null) {
            Role role = roleRepository.findById(stepDto.getApproverRoleId())
                    .orElseThrow(() -> new RuntimeException("Onaylayıcı rol bulunamadı: " + stepDto.getApproverRoleId()));
            step.setApproverRole(role);
        }
        
        return step;
    }
    
    public ApprovalWorkflowDto convertToDto(ApprovalWorkflow workflow) {
        ApprovalWorkflowDto dto = new ApprovalWorkflowDto();
        dto.setId(workflow.getId());
        dto.setName(workflow.getName());
        dto.setDescription(workflow.getDescription());
        dto.setIsActive(workflow.getIsActive());
        dto.setMinAmount(workflow.getMinAmount());
        dto.setMaxAmount(workflow.getMaxAmount());
        dto.setCategory(workflow.getCategory());
        
        if (workflow.getSteps() != null) {
            dto.setSteps(workflow.getSteps().stream()
                    .map(this::convertStepToDto)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    private ApprovalWorkflowDto.ApprovalStepDto convertStepToDto(ApprovalStep step) {
        ApprovalWorkflowDto.ApprovalStepDto dto = new ApprovalWorkflowDto.ApprovalStepDto();
        dto.setId(step.getId());
        dto.setStepOrder(step.getStepOrder());
        dto.setStepName(step.getStepName());
        dto.setDescription(step.getDescription());
        dto.setApproverType(step.getApproverType().name());
        dto.setApprovalLevel(step.getApprovalLevel());
        dto.setIsRequired(step.getIsRequired());
        dto.setCanDelegate(step.getCanDelegate());
        dto.setTimeoutHours(step.getTimeoutHours());
        dto.setIsActive(step.getIsActive());
        
        if (step.getSpecificApprover() != null) {
            dto.setSpecificApproverId(step.getSpecificApprover().getId());
        }
        
        if (step.getApproverRole() != null) {
            dto.setApproverRoleId(step.getApproverRole().getId());
        }
        
        return dto;
    }
} 