package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.AssignStockItemDto;
import com.anabilim.purchase.dto.request.CreateStockItemDto;
import com.anabilim.purchase.dto.request.UpdateStockItemDto;
import com.anabilim.purchase.dto.response.StockItemDto;
import com.anabilim.purchase.dto.response.StockItemSummaryDto;
import com.anabilim.purchase.dto.response.StockMovementDto;
import com.anabilim.purchase.entity.enums.StockItemStatus;

import java.util.List;

public interface StockItemService {
    
    // CRUD İşlemleri
    StockItemDto createStockItem(CreateStockItemDto dto);
    
    StockItemDto getStockItemById(Long id);
    
    StockItemDto getStockItemBySerialNumber(String serialNumber);
    
    List<StockItemDto> getAllStockItems();
    
    List<StockItemSummaryDto> getAllStockItemSummaries();
    
    StockItemDto updateStockItem(Long id, UpdateStockItemDto dto);
    
    void deleteStockItem(Long id);
    
    // Ürün Bazlı İşlemler
    List<StockItemDto> getStockItemsByProductId(Long productId);
    
    List<StockItemSummaryDto> getStockItemSummariesByProductId(Long productId);
    
    List<StockItemDto> getStockItemsByProductIdAndStatus(Long productId, StockItemStatus status);

    List<StockMovementDto> getStockItemMovements(Long stockItemId);
    
    // Depo Bazlı İşlemler
    List<StockItemDto> getStockItemsByWarehouseId(Long warehouseId);
    
    List<StockItemSummaryDto> getStockItemSummariesByWarehouseId(Long warehouseId);
    
    List<StockItemDto> getStockItemsByWarehouseIdAndStatus(Long warehouseId, StockItemStatus status);

    
    // Atama İşlemleri
    StockItemDto assignStockItemToUser(Long stockItemId, AssignStockItemDto dto);
    
    StockItemDto returnStockItemToWarehouse(Long stockItemId, Long warehouseId);
    
    // Durum İşlemleri
    StockItemDto markStockItemAsInUse(Long stockItemId);
    
    StockItemDto markStockItemAsMaintenance(Long stockItemId);
    
    StockItemDto markStockItemAsRetired(Long stockItemId);
    
    StockItemDto markStockItemAsLost(Long stockItemId);
    
    StockItemDto markStockItemAsDamaged(Long stockItemId);
    
    // Sayım İşlemleri
    long countStockItemsByProductId(Long productId);
    
    long countStockItemsByProductIdAndStatus(Long productId, StockItemStatus status);
    
    long countStockItemsByWarehouseId(Long warehouseId);
    
    long countStockItemsByWarehouseIdAndStatus(Long warehouseId, StockItemStatus status);
    
    // Garanti İşlemleri
    List<StockItemDto> getExpiredWarrantyItems();
    
    List<StockItemSummaryDto> getExpiredWarrantyItemSummaries();
    
    // Arama İşlemleri
    List<StockItemDto> searchStockItemsBySerialNumber(String serialNumber);
    
    List<StockItemSummaryDto> searchStockItemSummariesBySerialNumber(String serialNumber);
    
    // Aktif/Pasif İşlemleri
    List<StockItemDto> getActiveStockItems();
    
    List<StockItemSummaryDto> getActiveStockItemSummaries();
    
    StockItemDto activateStockItem(Long stockItemId);
    
    StockItemDto deactivateStockItem(Long stockItemId);
}
