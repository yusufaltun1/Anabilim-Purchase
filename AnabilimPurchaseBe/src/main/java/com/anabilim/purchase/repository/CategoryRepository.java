package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.subCategories")
    List<Category> findAllWithSubCategories();
    
    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.subCategories WHERE c.isActive = true")
    List<Category> findByIsActiveTrueWithSubCategories();
    
    List<Category> findByIsActiveTrue();
    List<Category> findByParentIdAndIsActiveTrue(Long parentId);
    List<Category> findByParentIsNullAndIsActiveTrue();
    Optional<Category> findByCode(String code);
    boolean existsByCode(String code);
    List<Category> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
} 