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

}
