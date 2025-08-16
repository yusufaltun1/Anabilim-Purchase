package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.PurchaseOrder;
import com.anabilim.purchase.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByOrderCode(String orderCode);
    List<PurchaseOrder> findByStatus(OrderStatus status);
    List<PurchaseOrder> findByDeliveryWarehouseId(Long warehouseId);
    List<PurchaseOrder> findBySupplierQuoteId(Long supplierQuoteId);
    boolean existsByOrderCode(String orderCode);
} 