package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreateCategoryDto;
import com.anabilim.purchase.dto.request.UpdateCategoryDto;
import com.anabilim.purchase.dto.response.CategoryDetailDto;
import com.anabilim.purchase.dto.response.CategoryDto;
import com.anabilim.purchase.dto.response.CategoryStockCountsDto;
import com.anabilim.purchase.entity.Category;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.mapper.CategoryMapper;
import com.anabilim.purchase.repository.CategoryRepository;
import com.anabilim.purchase.service.CategoryService;
import com.anabilim.purchase.service.CategoryStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final CategoryStockService categoryStockService;

    @Override
    public CategoryDto createCategory(CreateCategoryDto createDto) {
        if (categoryRepository.existsByCode(createDto.getCode())) {
            throw new ValidationException("Bu kod ile zaten bir kategori mevcut: " + createDto.getCode());
        }
        Category category = categoryMapper.toEntity(createDto);
        category = categoryRepository.save(category);
        return enrich(categoryMapper.toDto(category));
    }

    @Override
    public CategoryDto updateCategory(Long id, UpdateCategoryDto updateDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));
        categoryMapper.updateEntity(category, updateDto);
        category = categoryRepository.save(category);
        return enrich(categoryMapper.toDto(category));
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));
        if (category.hasProducts()) {
            throw new ValidationException("Bu kategoriye bağlı ürünler olduğu için silinemez");
        }
        categoryRepository.delete(category);
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));
        return enrich(categoryMapper.toDto(category));
    }

    @Override
    public CategoryDetailDto getCategoryDetail(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));
        return categoryStockService.buildDetail(category);
    }

    @Override
    public CategoryDto getCategoryByCode(String code) {
        Category category = categoryRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + code));
        return enrich(categoryMapper.toDto(category));
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        List<CategoryDto> dtos = categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(Category::getName, String.CASE_INSENSITIVE_ORDER))
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
        categoryStockService.enrichCategoryDtos(dtos);
        return dtos;
    }

    @Override
    public List<CategoryDto> getActiveCategories() {
        List<CategoryDto> dtos = categoryRepository.findByIsActiveTrue().stream()
                .sorted(Comparator.comparing(Category::getName, String.CASE_INSENSITIVE_ORDER))
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
        categoryStockService.enrichCategoryDtos(dtos);
        return dtos;
    }

    @Override
    public List<CategoryDto> searchCategories(String name) {
        List<CategoryDto> dtos = categoryRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name).stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
        categoryStockService.enrichCategoryDtos(dtos);
        return dtos;
    }

    private CategoryDto enrich(CategoryDto dto) {
        if (dto == null || dto.getId() == null) {
            return dto;
        }
        CategoryStockCountsDto counts = categoryStockService.getStockCounts(dto.getId());
        dto.setTotalQuantity(counts.getTotalQuantity());
        dto.setAssignedQuantity(counts.getAssignedQuantity());
        dto.setAvailableQuantity(counts.getAvailableQuantity());
        return dto;
    }
}
