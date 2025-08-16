package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.request.CreatePurchaseOrderDto;
import com.anabilim.purchase.dto.response.PurchaseOrderDto;
import com.anabilim.purchase.entity.enums.OrderStatus;
import com.anabilim.purchase.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    public ResponseEntity<PurchaseOrderDto> createPurchaseOrder(@Valid @RequestBody CreatePurchaseOrderDto createPurchaseOrderDto) {
        return ResponseEntity.ok(purchaseOrderService.createPurchaseOrder(createPurchaseOrderDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDto> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderById(id));
    }

    @GetMapping("/code/{orderCode}")
    public ResponseEntity<PurchaseOrderDto> getPurchaseOrderByOrderCode(@PathVariable String orderCode) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderByOrderCode(orderCode));
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrderDto>> getAllPurchaseOrders() {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseOrderDto>> getPurchaseOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrdersByStatus(status));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<PurchaseOrderDto>> getPurchaseOrdersByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrdersByWarehouse(warehouseId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PurchaseOrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(purchaseOrderService.updateOrderStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable Long id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.ok().build();
    }
} 