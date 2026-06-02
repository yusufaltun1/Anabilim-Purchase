package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.enums.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByIsActiveTrue();
    List<Product> findByIsActiveTrueAndNameContainingIgnoreCase(String name);
    List<Product> findByCategoryNameContainingIgnoreCase(String categoryName);
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);
    List<Product> findBySuppliersIdAndIsActiveTrue(Long supplierId);
    Optional<Product> findByCode(String code);
    boolean existsByCode(String code);
    
    // Pageable versiyonlar
    Page<Product> findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(String name, String code, Pageable pageable);
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    
    // ProductType ile filtreleme
    List<Product> findByProductTypeAndIsActiveTrue(ProductType productType);
    Page<Product> findByProductType(ProductType productType, Pageable pageable);
    Page<Product> findByProductTypeAndIsActiveTrue(ProductType productType, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.category.name LIKE %:categoryName%")
    List<Product> findByActiveTrueAndCategoryNameContaining(@Param("categoryName") String categoryName);

    @Query("SELECT COALESCE(SUM(p.currentStock), 0) FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    long sumCurrentStockByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT p.category.id, COALESCE(SUM(p.currentStock), 0) FROM Product p WHERE p.isActive = true GROUP BY p.category.id")
    List<Object[]> sumCurrentStockGroupByCategoryId();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    long countActiveByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT p.category.id, COUNT(p) FROM Product p WHERE p.isActive = true AND p.category.id IS NOT NULL GROUP BY p.category.id")
    List<Object[]> countActiveProductsGroupByCategoryId();
} 