package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.StockMovement;
import com.anabilim.purchase.entity.WarehouseStock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    
    @EntityGraph(attributePaths = {"warehouseStock", "warehouseStock.warehouse", "warehouseStock.product"})
    Page<StockMovement> findByWarehouseStock(WarehouseStock warehouseStock, Pageable pageable);
    
    @EntityGraph(attributePaths = {"warehouseStock", "warehouseStock.warehouse", "warehouseStock.product"})
    Page<StockMovement> findByWarehouseStockAndReferenceTypeAndReferenceId(
            WarehouseStock warehouseStock, String referenceType, Long referenceId, Pageable pageable);
    
    @Query("SELECT sm FROM StockMovement sm JOIN sm.warehouseStock ws WHERE ws.product = :product ORDER BY sm.createdAt DESC")
    @EntityGraph(attributePaths = {"warehouseStock", "warehouseStock.warehouse", "warehouseStock.product"})
    List<StockMovement> findRecentMovementsByProduct(@Param("product") Product product, Pageable pageable);
    
    @Query("SELECT MAX(sm.createdAt) FROM StockMovement sm WHERE sm.warehouseStock = :warehouseStock")
    Optional<LocalDateTime> findLastMovementDateByWarehouseStock(@Param("warehouseStock") WarehouseStock warehouseStock);
    
    @Query("SELECT MAX(sm.createdAt) FROM StockMovement sm JOIN sm.warehouseStock ws WHERE ws.product = :product")
    Optional<LocalDateTime> findLastMovementDateByProduct(@Param("product") Product product);
} 