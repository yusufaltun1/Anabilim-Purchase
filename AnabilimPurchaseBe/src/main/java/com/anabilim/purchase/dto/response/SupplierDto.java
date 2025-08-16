package com.anabilim.purchase.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDto {
    private Long id;
    private String name;
    private String taxNumber;
    private String taxOffice;
    private String address;
    private String phone;
    private String email;
    private String website;
    private String contactPerson;
    private String contactPhone;
    private String contactEmail;
    private String bankAccount;
    private String iban;
    private boolean isActive;
    private boolean isPreferred;
    private Set<CategoryDto.CategoryBasicDto> categories;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 