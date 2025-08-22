package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.ApiResponse;
import com.anabilim.purchase.dto.ApprovalWorkflowDto;
import com.anabilim.purchase.entity.ApprovalWorkflow;
import com.anabilim.purchase.service.ApprovalWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ApprovalWorkflow controller
 */
@RestController
@RequestMapping("/api/approval-workflows")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ApprovalWorkflowController {

    private final com.anabilim.purchase.service.ApprovalWorkflowService workflowService;


    /**
     * Tüm aktif onay akışlarını getir
     * GET /api/approval-workflows
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ApprovalWorkflowDto>>> getAllWorkflows() {
        try {
            log.info("Getting all  approval workflows");
            
            List<ApprovalWorkflowDto> workflows = workflowService.getAllWorkflows()
                    .stream()
                    .map(workflowService::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Onay akışları başarıyla getirildi", workflows));
            
        } catch (Exception e) {
            log.error("Error getting approval workflows", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Onay akışları getirilemedi: " + e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ApprovalWorkflowDto>>> getActiveWorkflows() {
        try {
            log.info("Getting all active approval workflows");

            List<ApprovalWorkflowDto> workflows = workflowService.getAllActiveWorkflows()
                    .stream()
                    .map(workflowService::convertToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Onay akışları başarıyla getirildi", workflows));

        } catch (Exception e) {
            log.error("Error getting approval workflows", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Onay akışları getirilemedi: " + e.getMessage()));
        }
    }



    @GetMapping("/inactive")
    public ResponseEntity<ApiResponse<List<ApprovalWorkflowDto>>> getInactiveWorkflows() {
        try {
            List<ApprovalWorkflowDto> workflows = workflowService.getAllInActiveWorkFlow()
                    .stream()
                    .map(workflowService::convertToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Pasif onay akışları getirildi", workflows));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Pasif onay akışları getirilemedi: " + e.getMessage()));
        }
    }


    /**
     * Kategoriye göre onay akışlarını getir
     * GET /api/approval-workflows/category/{category}
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ApprovalWorkflowDto>>> getWorkflowsByCategory(@PathVariable String category) {
        try {
            log.info("Getting approval workflows for category: {}", category);
            
            List<ApprovalWorkflowDto> workflows = workflowService.getWorkflowsByCategory(category)
                    .stream()
                    .map(workflowService::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Kategori onay akışları başarıyla getirildi", workflows));
            
        } catch (Exception e) {
            log.error("Error getting approval workflows for category: {}", category, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Kategori onay akışları getirilemedi: " + e.getMessage()));
        }
    }
    
    /**
     * ID'ye göre onay akışı getir
     * GET /api/approval-workflows/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApprovalWorkflowDto>> getWorkflowById(@PathVariable Long id) {
        try {
            log.info("Getting approval workflow with id: {}", id);
            
            ApprovalWorkflow workflow = workflowService.getWorkflowById(id)
                    .orElseThrow(() -> new RuntimeException("Onay akışı bulunamadı: " + id));
            
            ApprovalWorkflowDto dto = workflowService.convertToDto(workflow);
            
            return ResponseEntity.ok(ApiResponse.success("Onay akışı başarıyla getirildi", dto));
            
        } catch (Exception e) {
            log.error("Error getting approval workflow with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Onay akışı getirilemedi: " + e.getMessage()));
        }
    }
    
    /**
     * Tutar ve kategoriye göre uygun onay akışlarını getir
     * GET /api/approval-workflows/matching?amount={amount}&category={category}
     */
    @GetMapping("/matching")
    public ResponseEntity<ApiResponse<List<ApprovalWorkflowDto>>> findMatchingWorkflows(
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) String category) {
        try {
            log.info("Finding matching approval workflows for amount: {}, category: {}", amount, category);
            
            List<ApprovalWorkflowDto> workflows = workflowService.findMatchingWorkflows(amount, category)
                    .stream()
                    .map(workflowService::convertToDto)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Uygun onay akışları başarıyla getirildi", workflows));
            
        } catch (Exception e) {
            log.error("Error finding matching approval workflows", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Uygun onay akışları getirilemedi: " + e.getMessage()));
        }
    }
    
    /**
     * Tüm kategorileri getir
     * GET /api/approval-workflows/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        try {
            log.info("Getting all approval workflow categories");
            
            List<String> categories = workflowService.getDistinctCategories();
            
            return ResponseEntity.ok(ApiResponse.success("Kategoriler başarıyla getirildi", categories));
            
        } catch (Exception e) {
            log.error("Error getting approval workflow categories", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Kategoriler getirilemedi: " + e.getMessage()));
        }
    }
    
    /**
     * Yeni onay akışı oluştur
     * POST /api/approval-workflows
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ApprovalWorkflowDto>> createWorkflow(@Valid @RequestBody ApprovalWorkflowDto workflowDto) {
        try {
            log.info("Creating new approval workflow: {}", workflowDto.getName());
            
            ApprovalWorkflow workflow = workflowService.createWorkflow(workflowDto);
            ApprovalWorkflowDto createdDto = workflowService.convertToDto(workflow);
            
            return ResponseEntity.ok(ApiResponse.success("Onay akışı başarıyla oluşturuldu", createdDto));
            
        } catch (Exception e) {
            log.error("Error creating approval workflow: {}", workflowDto.getName(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Onay akışı oluşturulamadı: " + e.getMessage()));
        }
    }
    
    /**
     * Onay akışını güncelle
     * PUT /api/approval-workflows/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ApprovalWorkflowDto>> updateWorkflow(
            @PathVariable Long id, 
            @Valid @RequestBody ApprovalWorkflowDto workflowDto) {
        try {
            log.info("Updating approval workflow with id: {}", id);
            
            ApprovalWorkflow workflow = workflowService.updateWorkflow(id, workflowDto);
            ApprovalWorkflowDto updatedDto = workflowService.convertToDto(workflow);
            
            return ResponseEntity.ok(ApiResponse.success("Onay akışı başarıyla güncellendi", updatedDto));
            
        } catch (Exception e) {
            log.error("Error updating approval workflow with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Onay akışı güncellenemedi: " + e.getMessage()));
        }
    }
    
    /**
     * Onay akışını deaktif et
     * PATCH /api/approval-workflows/{id}/deactivate
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateWorkflow(@PathVariable Long id) {
        try {
            log.info("Deactivating approval workflow with id: {}", id);
            
            workflowService.deactivateWorkflow(id);
            
            return ResponseEntity.ok(ApiResponse.success("Onay akışı başarıyla deaktif edildi", null));
            
        } catch (Exception e) {
            log.error("Error deactivating approval workflow with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Onay akışı deaktif edilemedi: " + e.getMessage()));
        }
    }
    
    /**
     * Onay akışını sil
     * DELETE /api/approval-workflows/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkflow(@PathVariable Long id) {
        try {
            log.info("Deleting approval workflow with id: {}", id);
            
            workflowService.deleteWorkflow(id);
            
            return ResponseEntity.ok(ApiResponse.success("Onay akışı başarıyla silindi", null));
            
        } catch (Exception e) {
            log.error("Error deleting approval workflow with id: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Onay akışı silinemedi: " + e.getMessage()));
        }
    }
} 