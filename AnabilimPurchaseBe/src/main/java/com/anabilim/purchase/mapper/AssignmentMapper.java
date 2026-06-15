package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreateAssignmentDto;
import com.anabilim.purchase.dto.response.AssignmentDto;
import com.anabilim.purchase.entity.Assignment;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AssignmentMapper {
    
    public Assignment toEntity(CreateAssignmentDto dto) {
        if (dto == null) {
            return null;
        }
        
        Assignment assignment = new Assignment();
        assignment.setQuantity(dto.getQuantity());
        assignment.setLocationName(dto.getLocationName());
        assignment.setLocationDetails(dto.getLocationDetails());
        assignment.setExpectedReturnDate(dto.getExpectedReturnDate());
        assignment.setNotes(dto.getNotes());
        assignment.setAssignmentDate(LocalDateTime.now());
        assignment.setActive(true);
        
        return assignment;
    }
    
    public AssignmentDto toDto(Assignment entity) {
        if (entity == null) {
            return null;
        }
        
        AssignmentDto dto = new AssignmentDto();
        dto.setId(entity.getId());
        dto.setAssignmentDate(entity.getAssignmentDate());
        dto.setExpectedReturnDate(entity.getExpectedReturnDate());
        dto.setActualReturnDate(entity.getActualReturnDate());
        dto.setStatus(entity.getStatus());
        dto.setQuantity(entity.getQuantity());
        dto.setNotes(entity.getNotes());
        dto.setActive(entity.isActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // StockItem bilgileri
        if (entity.getStockItem() != null) {
            dto.setStockItemId(entity.getStockItem().getId());
            dto.setSerialNumber(entity.getStockItem().getSerialNumber());
        }
        
        // Product bilgileri
        if (entity.getProduct() != null) {
            dto.setProductId(entity.getProduct().getId());
            dto.setProductName(entity.getProduct().getName());
            dto.setProductCode(entity.getProduct().getCode());
        }
        
        // Assigned User bilgileri
        if (entity.getAssignedUser() != null) {
            dto.setAssignedUserId(entity.getAssignedUser().getId());
            dto.setAssignedUserName(entity.getAssignedUser().getFullName());
        }
        
        // Assigned Location bilgileri
        if (entity.getAssignedLocation() != null) {
            dto.setAssignedLocationId(entity.getAssignedLocation().getId());
            dto.setAssignedLocationName(entity.getAssignedLocation().getName());
        }
        
        // Location bilgileri
        dto.setLocationName(entity.getLocationName());
        dto.setLocationDetails(entity.getLocationDetails());
        
        // Hesaplanmış alanlar
        dto.setExpired(entity.isExpired());
        dto.setUserAssignment(entity.isUserAssignment());
        dto.setLocationAssignment(entity.isLocationAssignment());
        dto.setCanBeReturned(entity.canBeReturned());

        dto.setHasSignedForm(entity.getSignedFormStoredPath() != null && !entity.getSignedFormStoredPath().isBlank());
        dto.setSignedFormFileName(entity.getSignedFormFileName());
        dto.setSignedFormUploadedAt(entity.getSignedFormUploadedAt());
        
        return dto;
    }
    
    public List<AssignmentDto> toDtoList(List<Assignment> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
