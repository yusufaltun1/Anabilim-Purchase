package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolDto {
    private Long id;
    private String name;
    private String code;
    private String address;
    private String phone;
    private String email;
    private String principalName;
    private String district;
    private String city;
    private String schoolType;
    private Integer studentCapacity;
    private boolean isActive;
    private Integer employeeCount; // Çalışan sayısı
    private Integer transferCount; // Toplam transfer sayısı
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 