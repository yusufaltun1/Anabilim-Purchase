package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Category;
import com.anabilim.purchase.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsByTaxNumber(String taxNumber);
    boolean existsByTaxNumberAndIdNot(String taxNumber, Long id);
    Optional<Supplier> findByTaxNumber(String taxNumber);
    List<Supplier> findAllByIsActiveTrue();
    List<Supplier> findByCategoriesContaining(Category category);
} 