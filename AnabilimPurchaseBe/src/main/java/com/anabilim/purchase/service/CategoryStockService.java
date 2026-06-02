package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.response.CategoryDetailDto;
import com.anabilim.purchase.dto.response.CategoryDto;
import com.anabilim.purchase.dto.response.CategoryStockCountsDto;
import com.anabilim.purchase.dto.response.CategoryWarehouseStockDto;
import com.anabilim.purchase.entity.Category;
import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.StockItem;
import com.anabilim.purchase.entity.WarehouseStock;
import com.anabilim.purchase.entity.enums.ProductType;
import com.anabilim.purchase.entity.enums.StockTrackingType;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.mapper.StockItemMapper;
import com.anabilim.purchase.repository.AssignmentRepository;
import com.anabilim.purchase.repository.CategoryRepository;
import com.anabilim.purchase.repository.ProductRepository;
import com.anabilim.purchase.repository.StockItemRepository;
import com.anabilim.purchase.repository.WarehouseStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryStockService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseStockRepository warehouseStockRepository;
    private final StockItemRepository stockItemRepository;
    private final AssignmentRepository assignmentRepository;
    private final StockItemMapper stockItemMapper;

    /** Liste endpoint'leri için tek seferde stok sayıları (agregat sorgular). */
    public void enrichCategoryDtos(List<CategoryDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return;
        }
        Map<Long, Long> quantityTotalByCategory = toLongMap(productRepository.sumCurrentStockGroupByCategoryId());
        Map<Long, Long> assignedByCategory = toLongMap(assignmentRepository.sumActiveQuantityGroupByCategoryId());
        Map<Long, Long> assignmentCountByCategory = toLongMap(assignmentRepository.countActiveAssignmentsGroupByCategoryId());
        Map<Long, Long> productCountByCategory = toLongMap(productRepository.countActiveProductsGroupByCategoryId());
        Map<Long, Long> serialTotalByCategory = toLongMap(stockItemRepository.countTotalGroupByCategoryId());
        Map<Long, Long> serialAssignedByCategory = toLongMap(stockItemRepository.countAssignedGroupByCategoryId());
        Map<Long, Long> serialAvailableByCategory = toLongMap(stockItemRepository.countInStockGroupByCategoryId());

        for (CategoryDto dto : dtos) {
            if (dto.getId() == null) {
                continue;
            }
            long productCount = productCountByCategory.getOrDefault(dto.getId(), 0L);
            dto.setActiveProductCount((int) productCount);

            if (isSerialTracked(dto.getProductType())) {
                long stockTotal = serialTotalByCategory.getOrDefault(dto.getId(), 0L);
                long stockAssigned = serialAssignedByCategory.getOrDefault(dto.getId(), 0L);
                long stockAvailable = serialAvailableByCategory.getOrDefault(dto.getId(), 0L);
                long assignmentCount = assignmentCountByCategory.getOrDefault(dto.getId(), 0L);

                int total = (int) Math.max(stockTotal, productCount);
                int assigned = (int) Math.max(stockAssigned, assignmentCount);
                int available = stockTotal > 0
                        ? (int) stockAvailable
                        : Math.max(0, total - assigned);

                dto.setTotalQuantity(total);
                dto.setAssignedQuantity(assigned);
                dto.setAvailableQuantity(available);
            } else {
                int total = quantityTotalByCategory.getOrDefault(dto.getId(), 0L).intValue();
                int assigned = assignedByCategory.getOrDefault(dto.getId(), 0L).intValue();
                if (total == 0 && productCount > 0) {
                    total = (int) productCount;
                }
                dto.setTotalQuantity(total);
                dto.setAssignedQuantity(assigned);
                dto.setAvailableQuantity(Math.max(0, total - assigned));
            }
        }
    }

    public CategoryStockCountsDto getStockCounts(Long categoryId) {
        Category category = findCategory(categoryId);
        long productCount = productRepository.countActiveByCategoryId(categoryId);
        if (isSerialTracked(category.getProductType())) {
            long stockTotal = stockItemRepository.countByCategoryId(categoryId);
            long stockAssigned = stockItemRepository.countAssignedByCategoryId(categoryId);
            long stockAvailable = stockItemRepository.countInStockByCategoryId(categoryId);
            long assignmentCount = assignmentRepository.countActiveByCategoryId(categoryId);

            int total = (int) Math.max(stockTotal, productCount);
            int assigned = (int) Math.max(stockAssigned, assignmentCount);
            int available = stockTotal > 0
                    ? (int) stockAvailable
                    : Math.max(0, total - assigned);
            return new CategoryStockCountsDto(total, assigned, available);
        }
        int total = (int) productRepository.sumCurrentStockByCategoryId(categoryId);
        if (total == 0 && productCount > 0) {
            total = (int) productCount;
        }
        int assigned = (int) assignmentRepository.sumActiveQuantityByCategoryId(categoryId);
        return new CategoryStockCountsDto(total, assigned, Math.max(0, total - assigned));
    }

    public List<CategoryWarehouseStockDto> getWarehouseBreakdown(Long categoryId) {
        Category category = findCategory(categoryId);
        if (isSerialTracked(category.getProductType())) {
            return buildSerialWarehouseBreakdown(categoryId);
        }
        return buildQuantityWarehouseBreakdown(categoryId);
    }

    public CategoryDetailDto buildDetail(Category category) {
        CategoryDetailDto dto = new CategoryDetailDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setCode(category.getCode());
        dto.setDescription(category.getDescription());
        dto.setProductType(category.getProductType());
        dto.setMinStockNotifyAt(category.getMinStockNotifyAt());
        dto.setActive(category.isActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());

        CategoryStockCountsDto counts = getStockCounts(category.getId());
        dto.setTotalQuantity(counts.getTotalQuantity());
        dto.setAssignedQuantity(counts.getAssignedQuantity());
        dto.setAvailableQuantity(counts.getAvailableQuantity());
        dto.setActiveProductCount((int) productRepository.countActiveByCategoryId(category.getId()));

        if (isSerialTracked(category.getProductType())) {
            List<StockItem> items = stockItemRepository.findByCategoryId(category.getId());
            dto.setStockItems(stockItemMapper.toDtoList(items));
        } else {
            dto.setWarehouseBreakdown(getWarehouseBreakdown(category.getId()));
        }
        return dto;
    }

    public boolean isBelowNotifyThreshold(Category category) {
        if (category.getMinStockNotifyAt() == null) {
            return false;
        }
        CategoryStockCountsDto counts = getStockCounts(category.getId());
        return counts.getAvailableQuantity() <= category.getMinStockNotifyAt();
    }

    private boolean isSerialTracked(ProductType productType) {
        return productType != null
                && StockTrackingType.SERIAL_NUMBER.equals(productType.getStockTrackingType());
    }

    private List<CategoryWarehouseStockDto> buildQuantityWarehouseBreakdown(Long categoryId) {
        Map<Long, CategoryWarehouseStockDto> byWarehouse = new HashMap<>();
        List<Product> products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId);
        for (Product product : products) {
            for (WarehouseStock ws : warehouseStockRepository.findByProduct(product)) {
                if (ws.getWarehouse() == null) {
                    continue;
                }
                Long whId = ws.getWarehouse().getId();
                CategoryWarehouseStockDto row = byWarehouse.computeIfAbsent(whId, id -> {
                    CategoryWarehouseStockDto d = new CategoryWarehouseStockDto();
                    d.setWarehouseId(whId);
                    d.setWarehouseName(ws.getWarehouse().getName());
                    d.setTotalQuantity(0);
                    d.setAssignedQuantity(0);
                    d.setAvailableQuantity(0);
                    return d;
                });
                row.setTotalQuantity(row.getTotalQuantity() + ws.getCurrentStock());
            }
        }
        int assignedTotal = (int) assignmentRepository.sumActiveQuantityByCategoryId(categoryId);
        List<CategoryWarehouseStockDto> rows = new ArrayList<>(byWarehouse.values());
        if (!rows.isEmpty() && assignedTotal > 0) {
            rows.get(0).setAssignedQuantity(assignedTotal);
        }
        for (CategoryWarehouseStockDto row : rows) {
            row.setAvailableQuantity(Math.max(0, row.getTotalQuantity() - row.getAssignedQuantity()));
        }
        return rows;
    }

    private List<CategoryWarehouseStockDto> buildSerialWarehouseBreakdown(Long categoryId) {
        Map<Long, CategoryWarehouseStockDto> byWarehouse = new HashMap<>();
        for (StockItem item : stockItemRepository.findByCategoryId(categoryId)) {
            if (item.getCurrentWarehouse() == null) {
                continue;
            }
            Long whId = item.getCurrentWarehouse().getId();
            CategoryWarehouseStockDto row = byWarehouse.computeIfAbsent(whId, id -> {
                CategoryWarehouseStockDto d = new CategoryWarehouseStockDto();
                d.setWarehouseId(whId);
                d.setWarehouseName(item.getCurrentWarehouse().getName());
                d.setTotalQuantity(0);
                d.setAssignedQuantity(0);
                d.setAvailableQuantity(0);
                return d;
            });
            row.setTotalQuantity(row.getTotalQuantity() + 1);
            if (item.isAssigned()) {
                row.setAssignedQuantity(row.getAssignedQuantity() + 1);
            } else if (item.isInStock()) {
                row.setAvailableQuantity(row.getAvailableQuantity() + 1);
            }
        }
        for (CategoryWarehouseStockDto row : byWarehouse.values()) {
            if (row.getAvailableQuantity() == 0 && row.getTotalQuantity() > row.getAssignedQuantity()) {
                row.setAvailableQuantity(row.getTotalQuantity() - row.getAssignedQuantity());
            }
        }
        return new ArrayList<>(byWarehouse.values());
    }

    private Map<Long, Long> toLongMap(List<Object[]> rows) {
        Map<Long, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            if (row[0] == null) {
                continue;
            }
            Long categoryId = ((Number) row[0]).longValue();
            Long value = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
            map.put(categoryId, value);
        }
        return map;
    }

    private Category findCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + categoryId));
    }
}
