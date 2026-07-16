package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.AssignStockItemDto;
import com.anabilim.purchase.dto.request.CreateStockItemDto;
import com.anabilim.purchase.dto.request.UpdateStockItemDto;
import com.anabilim.purchase.dto.response.StockItemDto;
import com.anabilim.purchase.dto.response.StockItemSummaryDto;
import com.anabilim.purchase.dto.response.StockMovementDto;
import com.anabilim.purchase.dto.response.WarehouseStockDto;
import com.anabilim.purchase.entity.*;
import com.anabilim.purchase.entity.enums.StockItemStatus;
import com.anabilim.purchase.exception.ResourceAlreadyExistsException;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.mapper.StockItemMapper;
import com.anabilim.purchase.repository.AssignmentRepository;
import com.anabilim.purchase.repository.ProductRepository;
import com.anabilim.purchase.repository.SchoolRepository;
import com.anabilim.purchase.repository.StockItemRepository;
import com.anabilim.purchase.repository.StockMovementRepository;
import com.anabilim.purchase.repository.UserRepository;
import com.anabilim.purchase.repository.WarehouseRepository;
import com.anabilim.purchase.service.AssetConditionSupport;
import com.anabilim.purchase.service.StockItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
    private final AssetConditionSupport assetConditionSupport;
    private final StockMovementRepository stockMovementRepository;
    private final AssignmentRepository assignmentRepository;
    
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
        assetConditionSupport.applyReadyState(stockItem);

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
    public List<StockMovementDto> getStockItemMovements(Long stockItemId) {
        StockItem stockItem = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResourceNotFoundException("StockItem bulunamadı: " + stockItemId));

        Map<Long, StockMovement> merged = new LinkedHashMap<>();

        stockMovementRepository.findByStockItemIdOrderByCreatedAtDesc(stockItemId)
                .forEach(movement -> merged.putIfAbsent(movement.getId(), movement));

        List<Long> assignmentIds = assignmentRepository.findByStockItemId(stockItemId).stream()
                .map(Assignment::getId)
                .toList();
        if (!assignmentIds.isEmpty()) {
            stockMovementRepository.findByReferenceTypeAndReferenceIdInOrderByCreatedAtDesc("ASSIGNMENT", assignmentIds)
                    .forEach(movement -> merged.putIfAbsent(movement.getId(), movement));
            stockMovementRepository.findByReferenceTypeAndReferenceIdInOrderByCreatedAtDesc("ASSIGNMENT_RETURN", assignmentIds)
                    .forEach(movement -> merged.putIfAbsent(movement.getId(), movement));
            stockMovementRepository.findByReferenceTypeAndReferenceIdInOrderByCreatedAtDesc("ASSIGNMENT_CANCEL", assignmentIds)
                    .forEach(movement -> merged.putIfAbsent(movement.getId(), movement));
        }

        String serial = stockItem.getSerialNumber();
        if (serial != null && !serial.isBlank()) {
            String serialMarker = "SN: " + serial;
            stockMovementRepository.findRecentMovementsByProduct(stockItem.getProduct(), org.springframework.data.domain.PageRequest.of(0, 200))
                    .stream()
                    .filter(movement -> movement.getNotes() != null && movement.getNotes().contains(serialMarker))
                    .forEach(movement -> merged.putIfAbsent(movement.getId(), movement));
        }

        return merged.values().stream()
                .sorted(Comparator.comparing(StockMovement::getCreatedAt).reversed())
                .map(this::convertToMovementDto)
                .toList();
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
    
    private StockMovementDto convertToMovementDto(StockMovement movement) {
        StockMovementDto dto = new StockMovementDto();
        dto.setId(movement.getId());
        dto.setQuantity(movement.getQuantity());
        dto.setMovementType(movement.getMovementType());
        dto.setReferenceType(movement.getReferenceType());
        dto.setReferenceId(movement.getReferenceId());
        dto.setNotes(movement.getNotes());
        dto.setCreatedAt(movement.getCreatedAt());
        dto.setUpdatedAt(movement.getUpdatedAt());
        if (movement.getStockItem() != null) {
            dto.setStockItemId(movement.getStockItem().getId());
            dto.setStockItemSerialNumber(movement.getStockItem().getSerialNumber());
        }
        if (movement.getParentLocation() != null) {
            dto.setParentLocationId(movement.getParentLocation().getId());
            dto.setParentLocationName(movement.getParentLocation().getName());
        }
        if (movement.getChildLocation() != null) {
            dto.setChildLocationId(movement.getChildLocation().getId());
            dto.setChildLocationName(movement.getChildLocation().getName());
        }
        WarehouseStock warehouseStock = movement.getWarehouseStock();
        if (warehouseStock != null) {
            WarehouseStockDto stockDto = new WarehouseStockDto();
            stockDto.setId(warehouseStock.getId());
            stockDto.setCurrentStock(warehouseStock.getCurrentStock());
            stockDto.setMinStock(warehouseStock.getMinStock());
            stockDto.setMaxStock(warehouseStock.getMaxStock());
            stockDto.setCreatedAt(warehouseStock.getCreatedAt());
            stockDto.setUpdatedAt(warehouseStock.getUpdatedAt());
            if (warehouseStock.getWarehouse() != null) {
                stockDto.setWarehouse(new com.anabilim.purchase.dto.response.WarehouseDto(
                        warehouseStock.getWarehouse().getId(),
                        warehouseStock.getWarehouse().getName(),
                        warehouseStock.getWarehouse().getCode(),
                        warehouseStock.getWarehouse().getAddress(),
                        warehouseStock.getWarehouse().getPhone(),
                        warehouseStock.getWarehouse().getEmail(),
                        warehouseStock.getWarehouse().getManagerName(),
                        warehouseStock.getWarehouse().isActive(),
                        warehouseStock.getWarehouse().getCreatedAt(),
                        warehouseStock.getWarehouse().getUpdatedAt()
                ));
            }
            if (warehouseStock.getProduct() != null) {
                Product product = warehouseStock.getProduct();
                stockDto.setProduct(new WarehouseStockDto.ProductBasicDto(
                        product.getId(),
                        product.getName(),
                        product.getCode(),
                        product.getUnitOfMeasure() != null ? product.getUnitOfMeasure().getDisplayName() : null
                ));
            }
            dto.setWarehouseStock(stockDto);
        }
        return dto;
    }
}
