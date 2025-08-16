package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreateCategoryDto;
import com.anabilim.purchase.dto.request.UpdateCategoryDto;
import com.anabilim.purchase.dto.response.CategoryDto;
import com.anabilim.purchase.entity.Category;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.mapper.CategoryMapper;
import com.anabilim.purchase.repository.CategoryRepository;
import com.anabilim.purchase.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    
    @Override
    public CategoryDto createCategory(CreateCategoryDto createDto) {
        if (categoryRepository.existsByCode(createDto.getCode())) {
            throw new ValidationException("Bu kod ile zaten bir kategori mevcut: " + createDto.getCode());
        }
        
        Category category = categoryMapper.toEntity(createDto);
        
        if (createDto.getParentId() != null) {
            Category parent = categoryRepository.findById(createDto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Üst kategori bulunamadı: " + createDto.getParentId()));
            category.setParent(parent);
        }
        
        category = categoryRepository.save(category);
        return categoryMapper.toDto(category);
    }
    
    @Override
    public CategoryDto updateCategory(Long id, UpdateCategoryDto updateDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));
        
        categoryMapper.updateEntity(category, updateDto);
        
        if (updateDto.getParentId() != null && !updateDto.getParentId().equals(category.getParent() != null ? category.getParent().getId() : null)) {
            Category parent = categoryRepository.findById(updateDto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Üst kategori bulunamadı: " + updateDto.getParentId()));
            
            // Döngüsel bağımlılık kontrolü
            if (isCircularDependency(parent, id)) {
                throw new ValidationException("Döngüsel bağımlılık oluşturulamaz");
            }
            
            category.setParent(parent);
        } else if (updateDto.getParentId() == null) {
            category.setParent(null);
        }
        
        category = categoryRepository.save(category);
        return categoryMapper.toDto(category);
    }
    
    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));
        
        if (category.hasProducts()) {
            throw new ValidationException("Bu kategoriye bağlı ürünler olduğu için silinemez");
        }
        
        if (category.hasSubCategories()) {
            throw new ValidationException("Bu kategorinin alt kategorileri olduğu için silinemez");
        }
        
        categoryRepository.delete(category);
    }
    
    @Override
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + id));
        return categoryMapper.toDto(category);
    }
    
    @Override
    public CategoryDto getCategoryByCode(String code) {
        Category category = categoryRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + code));
        return categoryMapper.toDto(category);
    }
    
    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryMapper.toDtoList(categoryRepository.findAllWithSubCategories());
    }
    
    @Override
    public List<CategoryDto> getActiveCategories() {
        return categoryMapper.toDtoList(categoryRepository.findByIsActiveTrueWithSubCategories());
    }
    
    @Override
    public List<CategoryDto> getRootCategories() {
        return categoryMapper.toDtoList(categoryRepository.findByParentIsNullAndIsActiveTrue());
    }
    
    @Override
    public List<CategoryDto> getSubCategories(Long parentId) {
        return categoryMapper.toDtoList(categoryRepository.findByParentIdAndIsActiveTrue(parentId));
    }
    
    @Override
    public List<CategoryDto> searchCategories(String name) {
        return categoryMapper.toDtoList(categoryRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name));
    }
    
    private boolean isCircularDependency(Category parent, Long childId) {
        if (parent == null) {
            return false;
        }
        
        if (parent.getId().equals(childId)) {
            return true;
        }
        
        return isCircularDependency(parent.getParent(), childId);
    }
} 