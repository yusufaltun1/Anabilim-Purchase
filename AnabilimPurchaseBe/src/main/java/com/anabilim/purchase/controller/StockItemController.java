package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.ApiResponse;
import com.anabilim.purchase.dto.request.AssignStockItemDto;
import com.anabilim.purchase.dto.request.CreateStockItemDto;
import com.anabilim.purchase.dto.request.UpdateStockItemDto;
import com.anabilim.purchase.dto.response.StockItemDto;
import com.anabilim.purchase.dto.response.StockItemSummaryDto;
import com.anabilim.purchase.dto.response.StockMovementDto;
import com.anabilim.purchase.entity.enums.StockItemStatus;
import com.anabilim.purchase.service.StockItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stock-items")
@RequiredArgsConstructor
public class StockItemController {
    
    private final StockItemService stockItemService;
    
    // CRUD İşlemleri
    @PostMapping
    public ResponseEntity<ApiResponse<StockItemDto>> createStockItem(@Valid @RequestBody CreateStockItemDto dto) {
        StockItemDto createdStockItem = stockItemService.createStockItem(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Seri numaralı ürün başarıyla oluşturuldu", createdStockItem));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StockItemDto>> getStockItemById(@PathVariable Long id) {
        StockItemDto stockItem = stockItemService.getStockItemById(id);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün başarıyla getirildi", stockItem));
    }
    
    @GetMapping("/serial/{serialNumber}")
    public ResponseEntity<ApiResponse<StockItemDto>> getStockItemBySerialNumber(@PathVariable String serialNumber) {
        StockItemDto stockItem = stockItemService.getStockItemBySerialNumber(serialNumber);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün başarıyla getirildi", stockItem));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<StockItemDto>>> getAllStockItems() {
        List<StockItemDto> stockItems = stockItemService.getAllStockItems();
        return ResponseEntity.ok(ApiResponse.success("Tüm seri numaralı ürünler başarıyla getirildi", stockItems));
    }
    
    @GetMapping("/summaries")
    public ResponseEntity<ApiResponse<List<StockItemSummaryDto>>> getAllStockItemSummaries() {
        List<StockItemSummaryDto> stockItems = stockItemService.getAllStockItemSummaries();
        return ResponseEntity.ok(ApiResponse.success("Tüm seri numaralı ürün özetleri başarıyla getirildi", stockItems));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StockItemDto>> updateStockItem(@PathVariable Long id, 
                                                                   @Valid @RequestBody UpdateStockItemDto dto) {
        StockItemDto updatedStockItem = stockItemService.updateStockItem(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün başarıyla güncellendi", updatedStockItem));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStockItem(@PathVariable Long id) {
        stockItemService.deleteStockItem(id);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün başarıyla silindi", null));
    }
    
    // Ürün Bazlı İşlemler
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<StockItemDto>>> getStockItemsByProductId(@PathVariable Long productId) {
        List<StockItemDto> stockItems = stockItemService.getStockItemsByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Ürüne ait seri numaralı ürünler başarıyla getirildi", stockItems));
    }
    
    @GetMapping("/product/{productId}/summaries")
    public ResponseEntity<ApiResponse<List<StockItemSummaryDto>>> getStockItemSummariesByProductId(@PathVariable Long productId) {
        List<StockItemSummaryDto> stockItems = stockItemService.getStockItemSummariesByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Ürüne ait seri numaralı ürün özetleri başarıyla getirildi", stockItems));
    }
    
    @GetMapping("/product/{productId}/status/{status}")
    public ResponseEntity<ApiResponse<List<StockItemDto>>> getStockItemsByProductIdAndStatus(
            @PathVariable Long productId, @PathVariable StockItemStatus status) {
        List<StockItemDto> stockItems = stockItemService.getStockItemsByProductIdAndStatus(productId, status);
        return ResponseEntity.ok(ApiResponse.success("Ürüne ait seri numaralı ürünler başarıyla getirildi", stockItems));
    }

    @GetMapping("/{id}/movements")
    public ResponseEntity<ApiResponse<List<StockMovementDto>>> getStockItemMovements(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Stok kalemi hareketleri listelendi",
                stockItemService.getStockItemMovements(id)));
    }
    
    // Depo Bazlı İşlemler
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<ApiResponse<List<StockItemDto>>> getStockItemsByWarehouseId(@PathVariable Long warehouseId) {
        List<StockItemDto> stockItems = stockItemService.getStockItemsByWarehouseId(warehouseId);
        return ResponseEntity.ok(ApiResponse.success("Depoya ait seri numaralı ürünler başarıyla getirildi", stockItems));
    }
    
    @GetMapping("/warehouse/{warehouseId}/summaries")
    public ResponseEntity<ApiResponse<List<StockItemSummaryDto>>> getStockItemSummariesByWarehouseId(@PathVariable Long warehouseId) {
        List<StockItemSummaryDto> stockItems = stockItemService.getStockItemSummariesByWarehouseId(warehouseId);
        return ResponseEntity.ok(ApiResponse.success("Depoya ait seri numaralı ürün özetleri başarıyla getirildi", stockItems));
    }
    
    @GetMapping("/warehouse/{warehouseId}/status/{status}")
    public ResponseEntity<ApiResponse<List<StockItemDto>>> getStockItemsByWarehouseIdAndStatus(
            @PathVariable Long warehouseId, @PathVariable StockItemStatus status) {
        List<StockItemDto> stockItems = stockItemService.getStockItemsByWarehouseIdAndStatus(warehouseId, status);
        return ResponseEntity.ok(ApiResponse.success("Depoya ait seri numaralı ürünler başarıyla getirildi", stockItems));
    }
    
    // Atama İşlemleri
    @PostMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<StockItemDto>> assignStockItemToUser(@PathVariable Long id, 
                                                                         @Valid @RequestBody AssignStockItemDto dto) {
        StockItemDto assignedStockItem = stockItemService.assignStockItemToUser(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün başarıyla kullanıcıya atandı", assignedStockItem));
    }
    
    @PostMapping("/{id}/return/{warehouseId}")
    public ResponseEntity<ApiResponse<StockItemDto>> returnStockItemToWarehouse(@PathVariable Long id, 
                                                                              @PathVariable Long warehouseId) {
        StockItemDto returnedStockItem = stockItemService.returnStockItemToWarehouse(id, warehouseId);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün başarıyla depoya iade edildi", returnedStockItem));
    }
    
    // Durum İşlemleri
    @PostMapping("/{id}/mark-in-use")
    public ResponseEntity<ApiResponse<StockItemDto>> markStockItemAsInUse(@PathVariable Long id) {
        StockItemDto stockItem = stockItemService.markStockItemAsInUse(id);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün kullanımda olarak işaretlendi", stockItem));
    }
    
    @PostMapping("/{id}/mark-maintenance")
    public ResponseEntity<ApiResponse<StockItemDto>> markStockItemAsMaintenance(@PathVariable Long id) {
        StockItemDto stockItem = stockItemService.markStockItemAsMaintenance(id);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün bakımda olarak işaretlendi", stockItem));
    }
    
    @PostMapping("/{id}/mark-retired")
    public ResponseEntity<ApiResponse<StockItemDto>> markStockItemAsRetired(@PathVariable Long id) {
        StockItemDto stockItem = stockItemService.markStockItemAsRetired(id);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün emekli olarak işaretlendi", stockItem));
    }
    
    @PostMapping("/{id}/mark-lost")
    public ResponseEntity<ApiResponse<StockItemDto>> markStockItemAsLost(@PathVariable Long id) {
        StockItemDto stockItem = stockItemService.markStockItemAsLost(id);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün kayıp olarak işaretlendi", stockItem));
    }
    
    @PostMapping("/{id}/mark-damaged")
    public ResponseEntity<ApiResponse<StockItemDto>> markStockItemAsDamaged(@PathVariable Long id) {
        StockItemDto stockItem = stockItemService.markStockItemAsDamaged(id);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün hasarlı olarak işaretlendi", stockItem));
    }
    
    // Sayım İşlemleri
    @GetMapping("/count/product/{productId}")
    public ResponseEntity<ApiResponse<Long>> countStockItemsByProductId(@PathVariable Long productId) {
        long count = stockItemService.countStockItemsByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Ürüne ait seri numaralı ürün sayısı", count));
    }
    
    @GetMapping("/count/product/{productId}/status/{status}")
    public ResponseEntity<ApiResponse<Long>> countStockItemsByProductIdAndStatus(
            @PathVariable Long productId, @PathVariable StockItemStatus status) {
        long count = stockItemService.countStockItemsByProductIdAndStatus(productId, status);
        return ResponseEntity.ok(ApiResponse.success("Ürüne ait seri numaralı ürün sayısı", count));
    }
    
    @GetMapping("/count/warehouse/{warehouseId}")
    public ResponseEntity<ApiResponse<Long>> countStockItemsByWarehouseId(@PathVariable Long warehouseId) {
        long count = stockItemService.countStockItemsByWarehouseId(warehouseId);
        return ResponseEntity.ok(ApiResponse.success("Depoya ait seri numaralı ürün sayısı", count));
    }
    
    // Garanti İşlemleri
    @GetMapping("/expired-warranty")
    public ResponseEntity<ApiResponse<List<StockItemDto>>> getExpiredWarrantyItems() {
        List<StockItemDto> stockItems = stockItemService.getExpiredWarrantyItems();
        return ResponseEntity.ok(ApiResponse.success("Garanti süresi dolmuş seri numaralı ürünler başarıyla getirildi", stockItems));
    }
    
    @GetMapping("/expired-warranty/summaries")
    public ResponseEntity<ApiResponse<List<StockItemSummaryDto>>> getExpiredWarrantyItemSummaries() {
        List<StockItemSummaryDto> stockItems = stockItemService.getExpiredWarrantyItemSummaries();
        return ResponseEntity.ok(ApiResponse.success("Garanti süresi dolmuş seri numaralı ürün özetleri başarıyla getirildi", stockItems));
    }
    
    // Arama İşlemleri
    @GetMapping("/search/{serialNumber}")
    public ResponseEntity<ApiResponse<List<StockItemDto>>> searchStockItemsBySerialNumber(@PathVariable String serialNumber) {
        List<StockItemDto> stockItems = stockItemService.searchStockItemsBySerialNumber(serialNumber);
        return ResponseEntity.ok(ApiResponse.success("Seri numarasına göre arama sonuçları", stockItems));
    }
    
    // Aktif/Pasif İşlemler
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<StockItemDto>>> getActiveStockItems() {
        List<StockItemDto> stockItems = stockItemService.getActiveStockItems();
        return ResponseEntity.ok(ApiResponse.success("Aktif seri numaralı ürünler başarıyla getirildi", stockItems));
    }
    
    @GetMapping("/active/summaries")
    public ResponseEntity<ApiResponse<List<StockItemSummaryDto>>> getActiveStockItemSummaries() {
        List<StockItemSummaryDto> stockItems = stockItemService.getActiveStockItemSummaries();
        return ResponseEntity.ok(ApiResponse.success("Aktif seri numaralı ürün özetleri başarıyla getirildi", stockItems));
    }
    
    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<StockItemDto>> activateStockItem(@PathVariable Long id) {
        StockItemDto stockItem = stockItemService.activateStockItem(id);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün aktif hale getirildi", stockItem));
    }
    
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<StockItemDto>> deactivateStockItem(@PathVariable Long id) {
        StockItemDto stockItem = stockItemService.deactivateStockItem(id);
        return ResponseEntity.ok(ApiResponse.success("Seri numaralı ürün pasif hale getirildi", stockItem));
    }
}
