package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssetTransferDto {
    private Long id;
    private String transferCode;
    private WarehouseBasicDto sourceWarehouse;
    private SchoolBasicDto targetSchool;
    private String status;
    private String statusDisplayName;
    private LocalDateTime transferDate;
    private LocalDateTime actualTransferDate;
    private String notes;
    private UserBasicDto requestedBy;
    private UserBasicDto approvedBy;
    private UserBasicDto deliveredBy;
    private UserBasicDto receivedBy;
    private List<AssetTransferItemDto> items;
    private Integer totalItemCount; // Toplam kalem sayısı
    private Integer totalRequestedQuantity; // Toplam istenen miktar
    private Integer totalTransferredQuantity; // Toplam transfer edilen miktar
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseBasicDto {
        private Long id;
        private String name;
        private String code;
        private String address;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SchoolBasicDto {
        private Long id;
        private String name;
        private String code;
        private String city;
        private String district;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserBasicDto {
        private Long id;
        private String fullName;
        private String email;
        private String department;
        private String position;
    }
} 