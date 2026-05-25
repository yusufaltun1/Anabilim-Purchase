package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreateCategoryDto;
import com.anabilim.purchase.dto.request.UpdateCategoryDto;
import com.anabilim.purchase.dto.response.CategoryDto;
import com.anabilim.purchase.dto.response.CategoryStockCountsDto;
import com.anabilim.purchase.entity.Category;
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
        return category;
    }

    public void updateEntity(Category category, UpdateCategoryDto updateDto) {
        category.setName(updateDto.getName());
        category.setDescription(updateDto.getDescription());
        category.setActive(updateDto.isActive());
        category.setProductType(updateDto.getProductType());
        category.setMinStockNotifyAt(updateDto.getMinStockNotifyAt());
        if (updateDto.getRequestable() != null) {
            category.setRequestable(updateDto.getRequestable());
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
        dto.setActive(category.isActive());
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
