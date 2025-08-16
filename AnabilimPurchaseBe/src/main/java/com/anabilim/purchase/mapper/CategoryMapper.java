package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreateCategoryDto;
import com.anabilim.purchase.dto.request.UpdateCategoryDto;
import com.anabilim.purchase.dto.response.CategoryDto;
import com.anabilim.purchase.entity.Category;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashSet;

@Component
public class CategoryMapper {
    
    public Category toEntity(CreateCategoryDto createDto) {
        Category category = new Category();
        category.setName(createDto.getName());
        category.setCode(createDto.getCode());
        category.setDescription(createDto.getDescription());
        return category;
    }
    
    public void updateEntity(Category category, UpdateCategoryDto updateDto) {
        category.setName(updateDto.getName());
        category.setDescription(updateDto.getDescription());
        category.setActive(updateDto.isActive());
    }
    
    public CategoryDto toDto(Category category) {
        if (category == null) {
            return null;
        }
        
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setCode(category.getCode());
        dto.setDescription(category.getDescription());
        dto.setActive(category.isActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        
        if (category.getParent() != null) {
            dto.setParent(toCategoryBasicDto(category.getParent()));
        }
        
        if (category.getSubCategories() != null) {
            Set<CategoryDto.CategoryBasicDto> subCategoryDtos = new HashSet<>();
            for (Category subCategory : new HashSet<>(category.getSubCategories())) {
                subCategoryDtos.add(toCategoryBasicDto(subCategory));
            }
            dto.setSubCategories(subCategoryDtos);
        }
        
        return dto;
    }
    
    public List<CategoryDto> toDtoList(List<Category> categories) {
        return categories.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    private CategoryDto.CategoryBasicDto toCategoryBasicDto(Category category) {
        return new CategoryDto.CategoryBasicDto(
                category.getId(),
                category.getName(),
                category.getCode()
        );
    }
} 