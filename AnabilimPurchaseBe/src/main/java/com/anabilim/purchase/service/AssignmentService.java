package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.CreateAssignmentDto;
import com.anabilim.purchase.dto.response.AssignmentDto;
import com.anabilim.purchase.entity.enums.AssignmentStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AssignmentService {
    
    // CRUD İşlemleri
    AssignmentDto createAssignment(CreateAssignmentDto dto);

    /** Zimmet oluşturur; ürün fotoğrafı zorunludur. */
    AssignmentDto createAssignment(CreateAssignmentDto dto, MultipartFile photo);
    
    AssignmentDto getAssignmentById(Long id);
    
    List<AssignmentDto> getAllAssignments();
    
    void deleteAssignment(Long id);
    
    // Ürün Bazlı İşlemler
    List<AssignmentDto> getAssignmentsByProductId(Long productId);
    
    List<AssignmentDto> getAssignmentsByProductIdAndStatus(Long productId, AssignmentStatus status);

    List<AssignmentDto> getAssignmentsByStockItemId(Long stockItemId);
    
    // Kullanıcı Bazlı İşlemler
    List<AssignmentDto> getAssignmentsByUserId(Long userId);
    
    List<AssignmentDto> getAssignmentsByUserIdAndStatus(Long userId, AssignmentStatus status);
    
    List<AssignmentDto> getActiveAssignmentsByUserId(Long userId);
    
    // Konum Bazlı İşlemler
    List<AssignmentDto> getAssignmentsByLocationId(Long locationId);
    
    // Konum Bazlı İşlemler
    List<AssignmentDto> getAssignmentsByLocation(String locationName);
    
    List<AssignmentDto> getActiveAssignmentsByLocation(String locationName);
    
    // Durum İşlemleri
    List<AssignmentDto> getAssignmentsByStatus(AssignmentStatus status);
    
    List<AssignmentDto> getActiveAssignments();
    
    List<AssignmentDto> getExpiredAssignments();
    
    // Zimmet İşlemleri
    AssignmentDto returnAssignment(Long assignmentId);

    AssignmentDto returnAssignment(
            Long assignmentId,
            MultipartFile photo,
            MultipartFile document,
            String notes,
            Long warehouseId
    );
    
    AssignmentDto markAssignmentAsLost(Long assignmentId);
    
    AssignmentDto markAssignmentAsDamaged(Long assignmentId);
    
    AssignmentDto transferAssignmentToUser(Long assignmentId, Long newUserId, Long newLocationId);
    
    AssignmentDto transferAssignmentToLocation(Long assignmentId, String newLocationName, String newLocationDetails);
    
    // Sayım İşlemleri
    long countAssignmentsByProductId(Long productId);
    
    long countAssignmentsByProductIdAndStatus(Long productId, AssignmentStatus status);
    
    long countAssignmentsByUserId(Long userId);
    
    long countAssignmentsByUserIdAndStatus(Long userId, AssignmentStatus status);
    
    long countAssignmentsByLocationId(Long locationId);
    
    long countAssignmentsByLocation(String locationName);
    
    long countAssignmentsByStatus(AssignmentStatus status);
    
    long countActiveAssignments();
    
    // Aktif/Pasif İşlemler
    List<AssignmentDto> getActiveAssignmentsOnly();
    
    AssignmentDto activateAssignment(Long assignmentId);
    
    AssignmentDto deactivateAssignment(Long assignmentId);
    
    // ========== Otomatik İşlemler ==========
    
    /**
     * Süresi dolmuş zimmetleri otomatik olarak kapatır
     */
    void autoCloseExpiredAssignments();
}
