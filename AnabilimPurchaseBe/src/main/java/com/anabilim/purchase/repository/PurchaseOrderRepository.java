package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.PurchaseOrder;
import com.anabilim.purchase.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByOrderCode(String orderCode);
    List<PurchaseOrder> findByStatus(OrderStatus status);
    List<PurchaseOrder> findByDeliveryWarehouseId(Long warehouseId);
    List<PurchaseOrder> findBySupplierQuoteId(Long supplierQuoteId);
    boolean existsByOrderCode(String orderCode);

    @Query("SELECT po FROM PurchaseOrder po JOIN po.supplierQuote sq JOIN sq.requestItem ri WHERE ri.product.id = :productId ORDER BY po.createdAt DESC")
    List<PurchaseOrder> findByProductId(@Param("productId") Long productId);
} 