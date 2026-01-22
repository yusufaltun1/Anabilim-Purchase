package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreateAssetTransferDto;
import com.anabilim.purchase.dto.response.AssetTransferDto;
import com.anabilim.purchase.dto.response.AssetTransferItemDto;
import com.anabilim.purchase.entity.AssetTransfer;
import com.anabilim.purchase.entity.AssetTransferItem;
import com.anabilim.purchase.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;

@Component
public class AssetTransferMapper {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    
    public AssetTransfer toEntity(CreateAssetTransferDto createDto) {
        AssetTransfer transfer = new AssetTransfer();
        
        // Transfer kodu otomatik oluştur
        transfer.setTransferCode(generateTransferCode());
        
        // Transfer tarihini ayarla
        if (createDto.getTransferDate() != null) {
            // LocalDate'i LocalDateTime'a çevir ve günün sonunu (23:59:59) kullan
            transfer.setTransferDate(createDto.getTransferDate().atTime(23, 59, 59));
        } else {
            transfer.setTransferDate(LocalDateTime.now().plusDays(1).withHour(23).withMinute(59).withSecond(59));
        }
        
        transfer.setNotes(createDto.getNotes());
        
        return transfer;
    }
    
    public AssetTransferDto toDto(AssetTransfer transfer) {
        if (transfer == null) {
            return null;
        }
        
        AssetTransferDto dto = new AssetTransferDto();
        dto.setId(transfer.getId());
        dto.setTransferCode(transfer.getTransferCode());
        dto.setStatus(transfer.getStatus().name());
        dto.setStatusDisplayName(transfer.getStatus().getDisplayName());
        dto.setTransferDate(transfer.getTransferDate());
        dto.setActualTransferDate(transfer.getActualTransferDate());
        dto.setNotes(transfer.getNotes());
        dto.setCreatedAt(transfer.getCreatedAt());
        dto.setUpdatedAt(transfer.getUpdatedAt());
        dto.setSelfManaged(transfer.getSelfManaged());
        
        // Kaynak depo bilgileri
        if (transfer.getSourceWarehouse() != null) {
            dto.setSourceWarehouse(new AssetTransferDto.WarehouseBasicDto(
                transfer.getSourceWarehouse().getId(),
                transfer.getSourceWarehouse().getName(),
                transfer.getSourceWarehouse().getCode(),
                transfer.getSourceWarehouse().getAddress()
            ));
        }

        // Hedef depo bilgileri (yeni alan)
        if (transfer.getTargetWarehouse() != null) {
            dto.setTargetWarehouse(new AssetTransferDto.WarehouseBasicDto(
                transfer.getTargetWarehouse().getId(),
                transfer.getTargetWarehouse().getName(),
                transfer.getTargetWarehouse().getCode(),
                transfer.getTargetWarehouse().getAddress()
            ));
        }


        
        // User bilgileri
        dto.setRequestedBy(toUserBasicDto(transfer.getRequestedBy()));
        dto.setApprovedBy(toUserBasicDto(transfer.getApprovedBy()));
        dto.setDeliveredBy(toUserBasicDto(transfer.getDeliveredBy()));
        dto.setReceivedBy(toUserBasicDto(transfer.getReceivedBy()));
        
        // Transfer items
        if (transfer.getTransferItems() != null) {
            dto.setItems(transfer.getTransferItems().stream()
                .map(this::toItemDto)
                .collect(Collectors.toList()));
            
            // İstatistik hesapla
            dto.setTotalItemCount(transfer.getTransferItems().size());
            dto.setTotalRequestedQuantity(transfer.getTransferItems().stream()
                .mapToInt(item -> item.getRequestedQuantity() != null ? item.getRequestedQuantity() : 0)
                .sum());
            dto.setTotalTransferredQuantity(transfer.getTransferItems().stream()
                .mapToInt(item -> item.getTransferredQuantity() != null ? item.getTransferredQuantity() : 0)
                .sum());
        } else {
            dto.setTotalItemCount(0);
            dto.setTotalRequestedQuantity(0);
            dto.setTotalTransferredQuantity(0);
        }
        
        return dto;
    }
    
    public AssetTransferItemDto toItemDto(AssetTransferItem item) {
        if (item == null) {
            return null;
        }
        
        AssetTransferItemDto dto = new AssetTransferItemDto();
        dto.setId(item.getId());
        dto.setRequestedQuantity(item.getRequestedQuantity());
        dto.setTransferredQuantity(item.getTransferredQuantity());
        dto.setRemainingQuantity(item.getRemainingQuantity());
        dto.setNotes(item.getNotes());
        dto.setSerialNumbers(item.getSerialNumbers());
        dto.setConditionNotes(item.getConditionNotes());
        dto.setTransferImagesBase64(fromJsonList(item.getTransferImagesBase64()));
        dto.setReceiveImagesBase64(fromJsonList(item.getReceiveImagesBase64()));
        dto.setFullyTransferred(item.isFullyTransferred());
        dto.setPartiallyTransferred(item.isPartiallyTransferred());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        
        // Product bilgileri
        if (item.getProduct() != null) {
            dto.setProduct(new AssetTransferItemDto.ProductBasicDto(
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getCode(),
                item.getProduct().getProductType() != null ? 
                    item.getProduct().getProductType().getDisplayName() : null,
                item.getProduct().getUnitOfMeasure().getDisplayName(),
                item.getProduct().getCategory() != null ? 
                    item.getProduct().getCategory().getName() : null
            ));
        }
        
        return dto;
    }
    
    public AssetTransferItem toItemEntity(CreateAssetTransferDto.TransferItemDto itemDto) {
        AssetTransferItem item = new AssetTransferItem();
        item.setRequestedQuantity(itemDto.getRequestedQuantity());
        item.setNotes(itemDto.getNotes());
        item.setSerialNumbers(itemDto.getSerialNumbers());
        item.setConditionNotes(itemDto.getConditionNotes());
        item.setTransferImagesBase64(toJsonList(itemDto.getTransferImagesBase64()));
        item.setReceiveImagesBase64(toJsonList(itemDto.getReceiveImagesBase64()));
        return item;
    }
    
    public List<AssetTransferDto> toDtoList(List<AssetTransfer> transfers) {
        return transfers.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    private AssetTransferDto.UserBasicDto toUserBasicDto(User user) {
        if (user == null) {
            return null;
        }
        
        return new AssetTransferDto.UserBasicDto(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getDepartment(),
            user.getPosition()
        );
    }
    
    private String generateTransferCode() {
        return "TR-" + LocalDateTime.now().getYear() + "-" + 
               String.format("%06d", (int)(Math.random() * 1000000));
    }

    public java.util.List<String> fromJsonList(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<java.util.List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public String toJsonList(java.util.List<String> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return null;
        }
    }
} 