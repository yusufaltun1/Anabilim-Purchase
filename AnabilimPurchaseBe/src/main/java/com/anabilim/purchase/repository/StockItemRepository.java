package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.StockItem;
import com.anabilim.purchase.entity.enums.StockItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, Long> {

    Optional<StockItem> findBySerialNumber(String serialNumber);

    List<StockItem> findByProductId(Long productId);

    List<StockItem> findByProductIdAndStatus(Long productId, StockItemStatus status);

    List<StockItem> findByCurrentWarehouseId(Long warehouseId);

    List<StockItem> findByCurrentWarehouseIdAndStatus(Long warehouseId, StockItemStatus status);

    List<StockItem> findByIsActiveTrue();

    boolean existsBySerialNumber(String serialNumber);

    
    // Garanti süresi dolmuş ürünleri getir
    @Query("SELECT si FROM StockItem si WHERE si.warrantyExpiryDate < CURRENT_TIMESTAMP AND si.isActive = true")
    List<StockItem> findExpiredWarrantyItems();

    @Query("SELECT COUNT(si) FROM StockItem si WHERE si.product.id = :productId AND si.status = 'IN_STOCK' AND si.isActive = true")
    long countInStockByProductId(@Param("productId") Long productId);

    @Query("SELECT si FROM StockItem si JOIN FETCH si.product p WHERE p.category.id = :categoryId AND si.isActive = true")
    List<StockItem> findByCategoryId(@Param("categoryId") Long categoryId);

    List<StockItem> findByProductIdOrderByIdAsc(Long productId);

    Optional<StockItem> findFirstByProductIdAndIsActiveTrueOrderByIdAsc(Long productId);

    @Query("SELECT COUNT(si) FROM StockItem si WHERE si.product.category.id = :categoryId AND si.isActive = true")
    long countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(si) FROM StockItem si WHERE si.product.category.id = :categoryId AND si.status = 'IN_STOCK' AND si.isActive = true")
    long countInStockByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(si) FROM StockItem si WHERE si.product.category.id = :categoryId AND si.status IN ('ASSIGNED', 'IN_USE') AND si.isActive = true")
    long countAssignedByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT si.product.category.id, COUNT(si) FROM StockItem si WHERE si.isActive = true GROUP BY si.product.category.id")
    List<Object[]> countTotalGroupByCategoryId();

    @Query("SELECT si.product.category.id, COUNT(si) FROM StockItem si WHERE si.status IN ('ASSIGNED', 'IN_USE') AND si.isActive = true GROUP BY si.product.category.id")
    List<Object[]> countAssignedGroupByCategoryId();

    @Query("SELECT si.product.category.id, COUNT(si) FROM StockItem si WHERE si.status = 'IN_STOCK' AND si.isActive = true GROUP BY si.product.category.id")
    List<Object[]> countInStockGroupByCategoryId();

}
