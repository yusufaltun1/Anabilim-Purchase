package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreateStockItemDto;
import com.anabilim.purchase.dto.request.UpdateStockItemDto;
import com.anabilim.purchase.dto.response.StockItemDto;
import com.anabilim.purchase.dto.response.StockItemSummaryDto;
import com.anabilim.purchase.entity.Assignment;
import com.anabilim.purchase.entity.StockItem;
import com.anabilim.purchase.repository.AssignmentRepository;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class StockItemMapper {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AssignmentRepository assignmentRepository;
    
    public StockItemMapper(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }
    
    public StockItem toEntity(CreateStockItemDto dto) {
        if (dto == null) {
            return null;
        }
        
        StockItem stockItem = new StockItem();
        stockItem.setSerialNumber(dto.getSerialNumber());
        stockItem.setPurchasePrice(dto.getPurchasePrice());
        stockItem.setPurchaseDate(dto.getPurchaseDate());
        stockItem.setWarrantyExpiryDate(dto.getWarrantyExpiryDate());
        stockItem.setLocationDetails(dto.getLocationDetails());
        stockItem.setImageUrl(dto.getImageUrl());
        stockItem.setAdditionalImages(convertListToJson(dto.getAdditionalImages()));
        stockItem.setNotes(dto.getNotes());
        stockItem.setStatus(com.anabilim.purchase.entity.enums.StockItemStatus.IN_STOCK);
        stockItem.setActive(true);
        
        return stockItem;
    }
    
    public void updateEntity(StockItem entity, UpdateStockItemDto dto) {
        if (dto == null || entity == null) {
            return;
        }
        
        entity.setStatus(dto.getStatus());
        entity.setPurchasePrice(dto.getPurchasePrice());
        entity.setPurchaseDate(dto.getPurchaseDate());
        entity.setWarrantyExpiryDate(dto.getWarrantyExpiryDate());
        entity.setLocationDetails(dto.getLocationDetails());
        entity.setImageUrl(dto.getImageUrl());
        entity.setAdditionalImages(convertListToJson(dto.getAdditionalImages()));
        entity.setNotes(dto.getNotes());
        entity.setActive(dto.isActive());
    }
    
    public StockItemDto toDto(StockItem entity) {
        if (entity == null) {
            return null;
        }
        
        StockItemDto dto = new StockItemDto();
        dto.setId(entity.getId());
        dto.setSerialNumber(entity.getSerialNumber());
        dto.setStatus(entity.getStatus());
        dto.setPurchasePrice(entity.getPurchasePrice());
        dto.setPurchaseDate(entity.getPurchaseDate());
        dto.setWarrantyExpiryDate(entity.getWarrantyExpiryDate());
        dto.setLocationDetails(entity.getLocationDetails());
        dto.setImageUrl(entity.getImageUrl());
        dto.setAdditionalImages(convertJsonToList(entity.getAdditionalImages()));
        dto.setNotes(entity.getNotes());
        dto.setActive(entity.isActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getProduct() != null) {
            dto.setProductId(entity.getProduct().getId());
            dto.setProductName(entity.getProduct().getName());
            dto.setProductCode(entity.getProduct().getCode());
        }

        if (entity.getCurrentWarehouse() != null) {
            dto.setWarehouseId(entity.getCurrentWarehouse().getId());
            dto.setWarehouseName(entity.getCurrentWarehouse().getName());
        }

        List<Assignment> assignments = assignmentRepository.findByStockItemId(entity.getId());
        if (!assignments.isEmpty()) {
            Assignment activeAssignment = assignments.stream()
                    .filter(a -> a.isActive() && a.getStatus().equals(com.anabilim.purchase.entity.enums.AssignmentStatus.ACTIVE))
                    .findFirst()
                    .orElse(assignments.get(0));
            
            dto.setAssignmentId(activeAssignment.getId());
            dto.setAssignmentStatus(activeAssignment.getStatus().name());
            dto.setAssignmentDate(activeAssignment.getAssignmentDate());
            dto.setAssignmentNotes(activeAssignment.getNotes());
            
            // Assigned User bilgileri - Assignment'dan al
            if (activeAssignment.getAssignedUser() != null) {
                dto.setAssignedUserId(activeAssignment.getAssignedUser().getId());
                dto.setAssignedUserName(activeAssignment.getAssignedUser().getFullName());
            }
            
            // Assigned Location bilgileri - Assignment'dan al
            if (activeAssignment.getAssignedLocation() != null) {
                dto.setAssignedLocationId(activeAssignment.getAssignedLocation().getId());
                dto.setAssignedLocationName(activeAssignment.getAssignedLocation().getName());
            }
            dto.setAssigned(true);
        }
        
        // Hesaplanmış alanlar
        dto.setUnderWarranty(isUnderWarranty(entity.getWarrantyExpiryDate()));
        dto.setAvailable(isAvailable(entity.getStatus()));

        return dto;
    }
    
    public StockItemSummaryDto toSummaryDto(StockItem entity) {
        if (entity == null) {
            return null;
        }
        
        StockItemSummaryDto dto = new StockItemSummaryDto();
        dto.setId(entity.getId());
        dto.setSerialNumber(entity.getSerialNumber());
        dto.setStatus(entity.getStatus());
        dto.setPurchasePrice(entity.getPurchasePrice());
        dto.setImageUrl(entity.getImageUrl());
        dto.setWarrantyExpiryDate(entity.getWarrantyExpiryDate());
        dto.setCreatedAt(entity.getCreatedAt());
        
        // Product bilgileri
        if (entity.getProduct() != null) {
            dto.setProductName(entity.getProduct().getName());
            dto.setProductCode(entity.getProduct().getCode());
        }
        
        // Warehouse bilgileri
        if (entity.getCurrentWarehouse() != null) {
            dto.setWarehouseName(entity.getCurrentWarehouse().getName());
        }
        
        // Zimmet bilgileri - Assignment tablosundan al
        List<Assignment> assignments = assignmentRepository.findByStockItemId(entity.getId());
        if (!assignments.isEmpty()) {
            Assignment activeAssignment = assignments.stream()
                    .filter(a -> a.isActive() && a.getStatus().equals(com.anabilim.purchase.entity.enums.AssignmentStatus.ACTIVE))
                    .findFirst()
                    .orElse(assignments.get(0)); // Eğer aktif zimmet yoksa ilkini al
            
            // Assigned User bilgileri - Assignment'dan al
            if (activeAssignment.getAssignedUser() != null) {
                dto.setAssignedUserName(activeAssignment.getAssignedUser().getFullName());
            }
            
            // Assigned Location bilgileri - Assignment'dan al
            if (activeAssignment.getAssignedLocation() != null) {
                dto.setAssignedLocationName(activeAssignment.getAssignedLocation().getName());
            }
        }
        
        // Hesaplanmış alanlar
        dto.setUnderWarranty(isUnderWarranty(entity.getWarrantyExpiryDate()));
        dto.setAvailable(isAvailable(entity.getStatus()));
        
        return dto;
    }
    
    public List<StockItemDto> toDtoList(List<StockItem> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public List<StockItemSummaryDto> toSummaryDtoList(List<StockItem> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(this::toSummaryDto)
                .collect(Collectors.toList());
    }
    
    private boolean isUnderWarranty(LocalDateTime warrantyExpiryDate) {
        return warrantyExpiryDate != null && warrantyExpiryDate.isAfter(LocalDateTime.now());
    }
    
    private boolean isAvailable(com.anabilim.purchase.entity.enums.StockItemStatus status) {
        return com.anabilim.purchase.entity.enums.StockItemStatus.IN_STOCK.equals(status);
    }
    
    private boolean isAssigned(com.anabilim.purchase.entity.enums.StockItemStatus status) {
        return com.anabilim.purchase.entity.enums.StockItemStatus.ASSIGNED.equals(status) ||
               com.anabilim.purchase.entity.enums.StockItemStatus.IN_USE.equals(status);
    }
    
    // JSON dönüşüm yardımcı metodları
    private String convertListToJson(List<String> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
    
    private List<String> convertJsonToList(String json) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
