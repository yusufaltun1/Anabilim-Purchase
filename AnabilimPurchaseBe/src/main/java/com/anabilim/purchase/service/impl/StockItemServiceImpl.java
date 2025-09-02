package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.AssignStockItemDto;
import com.anabilim.purchase.dto.request.CreateStockItemDto;
import com.anabilim.purchase.dto.request.UpdateStockItemDto;
import com.anabilim.purchase.dto.response.StockItemDto;
import com.anabilim.purchase.dto.response.StockItemSummaryDto;
import com.anabilim.purchase.entity.*;
import com.anabilim.purchase.entity.enums.StockItemStatus;
import com.anabilim.purchase.exception.ResourceAlreadyExistsException;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.mapper.StockItemMapper;
import com.anabilim.purchase.repository.ProductRepository;
import com.anabilim.purchase.repository.SchoolRepository;
import com.anabilim.purchase.repository.StockItemRepository;
import com.anabilim.purchase.repository.UserRepository;
import com.anabilim.purchase.repository.WarehouseRepository;
import com.anabilim.purchase.service.StockItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StockItemServiceImpl implements StockItemService {
    
    private final StockItemRepository stockItemRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final StockItemMapper stockItemMapper;
    
    @Override
    public StockItemDto createStockItem(CreateStockItemDto dto) {
        // Ürün kontrolü
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + dto.getProductId()));
        
        // Seri numarası kontrolü - sadece seri numarası varsa kontrol et
        if (dto.getSerialNumber() != null && !dto.getSerialNumber().trim().isEmpty()) {
            if (stockItemRepository.existsBySerialNumber(dto.getSerialNumber())) {
                throw new ResourceAlreadyExistsException("Bu seri numarası zaten mevcut: " + dto.getSerialNumber());
            }
        }
        
        // Depo kontrolü
        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Depo bulunamadı: " + dto.getWarehouseId()));
        
        // StockItem oluştur
        StockItem stockItem = stockItemMapper.toEntity(dto);
        stockItem.setProduct(product);
        stockItem.setCurrentWarehouse(warehouse);


        
        StockItem savedStockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(savedStockItem);
    }
    
    @Override
    @Transactional(readOnly = true)
    public StockItemDto getStockItemById(Long id) {
        StockItem stockItem = stockItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + id));
        return stockItemMapper.toDto(stockItem);
    }
    
    @Override
    @Transactional(readOnly = true)
    public StockItemDto getStockItemBySerialNumber(String serialNumber) {
        StockItem stockItem = stockItemRepository.findBySerialNumber(serialNumber)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + serialNumber));
        return stockItemMapper.toDto(stockItem);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemDto> getAllStockItems() {
        List<StockItem> stockItems = stockItemRepository.findAll();
        return stockItemMapper.toDtoList(stockItems);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemSummaryDto> getAllStockItemSummaries() {
        List<StockItem> stockItems = stockItemRepository.findAll();
        return stockItemMapper.toSummaryDtoList(stockItems);
    }
    
    @Override
    public StockItemDto updateStockItem(Long id, UpdateStockItemDto dto) {
        StockItem stockItem = stockItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + id));
        
        stockItemMapper.updateEntity(stockItem, dto);
        
        // Depo güncellemesi
        if (dto.getWarehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Depo bulunamadı: " + dto.getWarehouseId()));
            stockItem.setCurrentWarehouse(warehouse);
        }

        StockItem updatedStockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(updatedStockItem);
    }
    
    @Override
    public void deleteStockItem(Long id) {
        if (!stockItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("StockItem bulunamadı: " + id);
        }
        stockItemRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemDto> getStockItemsByProductId(Long productId) {
        List<StockItem> stockItems = stockItemRepository.findByProductId(productId);
        return stockItemMapper.toDtoList(stockItems);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemSummaryDto> getStockItemSummariesByProductId(Long productId) {
        List<StockItem> stockItems = stockItemRepository.findByProductId(productId);
        return stockItemMapper.toSummaryDtoList(stockItems);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemDto> getStockItemsByProductIdAndStatus(Long productId, StockItemStatus status) {
        List<StockItem> stockItems = stockItemRepository.findByProductIdAndStatus(productId, status);
        return stockItemMapper.toDtoList(stockItems);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemDto> getStockItemsByWarehouseId(Long warehouseId) {
        List<StockItem> stockItems = stockItemRepository.findByCurrentWarehouseId(warehouseId);
        return stockItemMapper.toDtoList(stockItems);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemSummaryDto> getStockItemSummariesByWarehouseId(Long warehouseId) {
        List<StockItem> stockItems = stockItemRepository.findByCurrentWarehouseId(warehouseId);
        return stockItemMapper.toSummaryDtoList(stockItems);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemDto> getStockItemsByWarehouseIdAndStatus(Long warehouseId, StockItemStatus status) {
        List<StockItem> stockItems = stockItemRepository.findByCurrentWarehouseIdAndStatus(warehouseId, status);
        return stockItemMapper.toDtoList(stockItems);
    }
    


    
    @Override
    public StockItemDto assignStockItemToUser(Long stockItemId, AssignStockItemDto dto) {
        StockItem stockItem = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + stockItemId));
        
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + dto.getUserId()));
        
        if (dto.getLocationDetails() != null) {
            stockItem.setLocationDetails(dto.getLocationDetails());
        }
        
        if (dto.getNotes() != null) {
            stockItem.setNotes(dto.getNotes());
        }
        
        StockItem savedStockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(savedStockItem);
    }
    
    @Override
    public StockItemDto returnStockItemToWarehouse(Long stockItemId, Long warehouseId) {
        StockItem stockItem = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + stockItemId));
        
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Depo bulunamadı: " + warehouseId));
        

        
        StockItem savedStockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(savedStockItem);
    }
    
    @Override
    public StockItemDto markStockItemAsInUse(Long stockItemId) {
        StockItem stockItem = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + stockItemId));
        
        stockItem.markAsInUse();
        
        StockItem savedStockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(savedStockItem);
    }
    
    @Override
    public StockItemDto markStockItemAsMaintenance(Long stockItemId) {
        StockItem stockItem = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + stockItemId));
        
        stockItem.markAsMaintenance();
        
        StockItem savedStockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(savedStockItem);
    }
    
    @Override
    public StockItemDto markStockItemAsRetired(Long stockItemId) {
        StockItem stockItem = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + stockItemId));
        
        stockItem.markAsRetired();
        
        StockItem savedStockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(savedStockItem);
    }
    
    @Override
    public StockItemDto markStockItemAsLost(Long stockItemId) {
        StockItem stockItem = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + stockItemId));
        
        stockItem.setStatus(StockItemStatus.LOST);
        
        StockItem savedStockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(savedStockItem);
    }
    
    @Override
    public StockItemDto markStockItemAsDamaged(Long stockItemId) {
        StockItem stockItem = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + stockItemId));
        
        stockItem.setStatus(StockItemStatus.DAMAGED);
        
        StockItem savedStockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(savedStockItem);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countStockItemsByProductId(Long productId) {
        return stockItemRepository.countInStockByProductId(productId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countStockItemsByProductIdAndStatus(Long productId, StockItemStatus status) {
        return stockItemRepository.findByProductIdAndStatus(productId, status).size();
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countStockItemsByWarehouseId(Long warehouseId) {
        return stockItemRepository.findByCurrentWarehouseId(warehouseId).size();
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countStockItemsByWarehouseIdAndStatus(Long warehouseId, StockItemStatus status) {
        return stockItemRepository.findByCurrentWarehouseIdAndStatus(warehouseId, status).size();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemDto> getExpiredWarrantyItems() {
        List<StockItem> stockItems = stockItemRepository.findExpiredWarrantyItems();
        return stockItemMapper.toDtoList(stockItems);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemSummaryDto> getExpiredWarrantyItemSummaries() {
        List<StockItem> stockItems = stockItemRepository.findExpiredWarrantyItems();
        return stockItemMapper.toSummaryDtoList(stockItems);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemDto> searchStockItemsBySerialNumber(String serialNumber) {
        List<StockItem> stockItems = stockItemRepository.findBySerialNumber(serialNumber)
                .map(List::of)
                .orElse(List.of());
        return stockItemMapper.toDtoList(stockItems);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemSummaryDto> searchStockItemSummariesBySerialNumber(String serialNumber) {
        List<StockItem> stockItems = stockItemRepository.findBySerialNumber(serialNumber)
                .map(List::of)
                .orElse(List.of());
        return stockItemMapper.toSummaryDtoList(stockItems);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemDto> getActiveStockItems() {
        List<StockItem> stockItems = stockItemRepository.findByIsActiveTrue();
        return stockItemMapper.toDtoList(stockItems);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<StockItemSummaryDto> getActiveStockItemSummaries() {
        List<StockItem> stockItems = stockItemRepository.findByIsActiveTrue();
        return stockItemMapper.toSummaryDtoList(stockItems);
    }
    
    @Override
    public StockItemDto activateStockItem(Long stockItemId) {
        StockItem stockItem = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + stockItemId));
        
        stockItem.setActive(true);
        
        StockItem savedStockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(savedStockItem);
    }
    
    @Override
    public StockItemDto deactivateStockItem(Long stockItemId) {
        StockItem stockItem = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + stockItemId));
        
        stockItem.setActive(false);
        
        StockItem savedStockItem = stockItemRepository.save(stockItem);
        return stockItemMapper.toDto(savedStockItem);
    }
}
