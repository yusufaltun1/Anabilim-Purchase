package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.CreateCategoryDto;
import com.anabilim.purchase.dto.request.UpdateCategoryDto;
import com.anabilim.purchase.dto.response.CategoryDto;

import java.util.List;

public interface CategoryService {
    CategoryDto createCategory(CreateCategoryDto createDto);
    CategoryDto updateCategory(Long id, UpdateCategoryDto updateDto);
    void deleteCategory(Long id);
    CategoryDto getCategoryById(Long id);
    CategoryDto getCategoryByCode(String code);
    List<CategoryDto> getAllCategories();
    List<CategoryDto> getActiveCategories();
    List<CategoryDto> getRootCategories();
    List<CategoryDto> getSubCategories(Long parentId);
    List<CategoryDto> searchCategories(String name);
} 