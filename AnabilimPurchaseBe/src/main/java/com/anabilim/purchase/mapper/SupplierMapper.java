package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreateSupplierDto;
import com.anabilim.purchase.dto.request.UpdateSupplierDto;
import com.anabilim.purchase.dto.response.CategoryDto;
import com.anabilim.purchase.dto.response.SupplierDto;
import com.anabilim.purchase.entity.Category;
import com.anabilim.purchase.entity.Supplier;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SupplierMapper {
    
    private final CategoryRepository categoryRepository;
    
    public Supplier toEntity(CreateSupplierDto dto) {
        if (dto == null) {
            return null;
        }
        
        Supplier supplier = new Supplier();
        supplier.setName(dto.getName());
        supplier.setTaxNumber(dto.getTaxNumber());
        supplier.setTaxOffice(dto.getTaxOffice());
        supplier.setAddress(dto.getAddress());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setWebsite(dto.getWebsite());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setContactPhone(dto.getContactPhone());
        supplier.setContactEmail(dto.getContactEmail());
        supplier.setBankAccount(dto.getBankAccount());
        supplier.setIban(dto.getIban());
        supplier.setPreferred(dto.isPreferred());
        supplier.setActive(true);
        
        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            Set<Category> categories = dto.getCategoryIds().stream()
                    .map(id -> categoryRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id)))
                    .collect(Collectors.toSet());
            supplier.setCategories(categories);
        }
        
        return supplier;
    }
    
    public void updateEntity(UpdateSupplierDto dto, Supplier supplier) {
        if (dto == null || supplier == null) {
            return;
        }
        
        if (dto.getName() != null) supplier.setName(dto.getName());
        if (dto.getTaxOffice() != null) supplier.setTaxOffice(dto.getTaxOffice());
        if (dto.getAddress() != null) supplier.setAddress(dto.getAddress());
        if (dto.getPhone() != null) supplier.setPhone(dto.getPhone());
        if (dto.getEmail() != null) supplier.setEmail(dto.getEmail());
        if (dto.getWebsite() != null) supplier.setWebsite(dto.getWebsite());
        if (dto.getContactPerson() != null) supplier.setContactPerson(dto.getContactPerson());
        if (dto.getContactPhone() != null) supplier.setContactPhone(dto.getContactPhone());
        if (dto.getContactEmail() != null) supplier.setContactEmail(dto.getContactEmail());
        if (dto.getBankAccount() != null) supplier.setBankAccount(dto.getBankAccount());
        if (dto.getIban() != null) supplier.setIban(dto.getIban());
        supplier.setActive(dto.isActive());
        supplier.setPreferred(dto.isPreferred());
        
        if (dto.getCategoryIds() != null) {
            supplier.getCategories().clear();
            Set<Category> newCategories = dto.getCategoryIds().stream()
                    .map(id -> categoryRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id)))
                    .collect(Collectors.toSet());
            supplier.getCategories().addAll(newCategories);
        }
    }
    
    public SupplierDto toDto(Supplier supplier) {
        if (supplier == null) {
            return null;
        }
        
        SupplierDto dto = new SupplierDto();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setTaxNumber(supplier.getTaxNumber());
        dto.setTaxOffice(supplier.getTaxOffice());
        dto.setAddress(supplier.getAddress());
        dto.setPhone(supplier.getPhone());
        dto.setEmail(supplier.getEmail());
        dto.setWebsite(supplier.getWebsite());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setContactPhone(supplier.getContactPhone());
        dto.setContactEmail(supplier.getContactEmail());
        dto.setBankAccount(supplier.getBankAccount());
        dto.setIban(supplier.getIban());
        dto.setActive(supplier.isActive());
        dto.setPreferred(supplier.isPreferred());
        dto.setCreatedAt(supplier.getCreatedAt());
        dto.setUpdatedAt(supplier.getUpdatedAt());
        
        if (supplier.getCategories() != null) {
            dto.setCategories(supplier.getCategories().stream()
                    .map(category -> new CategoryDto.CategoryBasicDto(
                            category.getId(),
                            category.getName(),
                            category.getCode()))
                    .collect(Collectors.toSet()));
        }
        
        return dto;
    }
    
    public List<SupplierDto> toDtoList(List<Supplier> suppliers) {
        if (suppliers == null) {
            return List.of();
        }
        
        return suppliers.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
} 