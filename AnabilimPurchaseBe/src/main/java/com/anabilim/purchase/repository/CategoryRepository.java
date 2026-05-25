package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsActiveTrue();
    Optional<Category> findByCode(String code);
    boolean existsByCode(String code);
    List<Category> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    List<Category> findByMinStockNotifyAtIsNotNullAndIsActiveTrue();
}
