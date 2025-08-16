package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.CreatePurchaseOrderDto;
import com.anabilim.purchase.dto.response.PurchaseOrderDto;
import com.anabilim.purchase.entity.enums.OrderStatus;

import java.util.List;

public interface PurchaseOrderService {
    PurchaseOrderDto createPurchaseOrder(CreatePurchaseOrderDto createPurchaseOrderDto);
    PurchaseOrderDto getPurchaseOrderById(Long id);
    PurchaseOrderDto getPurchaseOrderByOrderCode(String orderCode);
    List<PurchaseOrderDto> getAllPurchaseOrders();
    List<PurchaseOrderDto> getPurchaseOrdersByStatus(OrderStatus status);
    List<PurchaseOrderDto> getPurchaseOrdersByWarehouse(Long warehouseId);
    PurchaseOrderDto updateOrderStatus(Long id, OrderStatus newStatus);
    void deletePurchaseOrder(Long id);
} 