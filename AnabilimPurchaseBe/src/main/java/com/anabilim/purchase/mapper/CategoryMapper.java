package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreateCategoryDto;
import com.anabilim.purchase.dto.request.UpdateCategoryDto;
import com.anabilim.purchase.dto.response.CategoryDto;
import com.anabilim.purchase.dto.response.CategoryStockCountsDto;
import com.anabilim.purchase.entity.Category;
import com.anabilim.purchase.entity.enums.UnitOfMeasure;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    public Category toEntity(CreateCategoryDto createDto) {
        Category category = new Category();
        category.setName(createDto.getName());
        category.setCode(createDto.getCode());
        category.setDescription(createDto.getDescription());
        category.setProductType(createDto.getProductType());
        category.setMinStockNotifyAt(createDto.getMinStockNotifyAt());
        category.setRequestable(Boolean.TRUE.equals(createDto.getRequestable()));
        category.setUnitOfMeasure(createDto.getUnitOfMeasure() != null ? createDto.getUnitOfMeasure() : UnitOfMeasure.PIECE);
        category.setMinQuantity(createDto.getMinQuantity() != null ? createDto.getMinQuantity() : 1);
        category.setMaxQuantity(createDto.getMaxQuantity() != null ? createDto.getMaxQuantity() : 100);
        category.setCurrency(createDto.getCurrency() != null && !createDto.getCurrency().isBlank() ? createDto.getCurrency() : "TRY");
        return category;
    }

    public void updateEntity(Category category, UpdateCategoryDto updateDto) {
        category.setName(updateDto.getName());
        category.setDescription(updateDto.getDescription());
        if (updateDto.getActive() != null) {
            category.setActive(updateDto.getActive());
        }
        category.setProductType(updateDto.getProductType());
        category.setMinStockNotifyAt(updateDto.getMinStockNotifyAt());
        if (updateDto.getRequestable() != null) {
            category.setRequestable(updateDto.getRequestable());
        }
        if (updateDto.getUnitOfMeasure() != null) {
            category.setUnitOfMeasure(updateDto.getUnitOfMeasure());
        }
        if (updateDto.getMinQuantity() != null) {
            category.setMinQuantity(updateDto.getMinQuantity());
        }
        if (updateDto.getMaxQuantity() != null) {
            category.setMaxQuantity(updateDto.getMaxQuantity());
        }
        if (updateDto.getCurrency() != null && !updateDto.getCurrency().isBlank()) {
            category.setCurrency(updateDto.getCurrency());
        }
    }

    public CategoryDto toDto(Category category) {
        return toDto(category, null);
    }

    public CategoryDto toDto(Category category, CategoryStockCountsDto counts) {
        if (category == null) {
            return null;
        }
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setCode(category.getCode());
        dto.setDescription(category.getDescription());
        dto.setProductType(category.getProductType());
        dto.setMinStockNotifyAt(category.getMinStockNotifyAt());
        dto.setRequestable(category.getRequestable());
        dto.setUnitOfMeasure(category.getUnitOfMeasure());
        dto.setMinQuantity(category.getMinQuantity());
        dto.setMaxQuantity(category.getMaxQuantity());
        dto.setCurrency(category.getCurrency());
        dto.setActive(category.isActive()); // maps to CategoryDto.active (@JsonProperty isActive)
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        if (counts != null) {
            dto.setTotalQuantity(counts.getTotalQuantity());
            dto.setAssignedQuantity(counts.getAssignedQuantity());
            dto.setAvailableQuantity(counts.getAvailableQuantity());
        }
        return dto;
    }

    public List<CategoryDto> toDtoList(List<Category> categories) {
        return categories.stream().map(this::toDto).collect(Collectors.toList());
    }
}
