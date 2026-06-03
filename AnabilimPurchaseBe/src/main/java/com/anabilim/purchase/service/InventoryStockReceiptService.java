package com.anabilim.purchase.service;

import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.StockItem;
import com.anabilim.purchase.entity.Warehouse;
import com.anabilim.purchase.entity.enums.MovementType;
import com.anabilim.purchase.entity.enums.StockTrackingType;
import com.anabilim.purchase.repository.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryStockReceiptService {

    private final StockItemRepository stockItemRepository;
    private final AssetConditionSupport assetConditionSupport;

    public void afterWarehouseStockMovement(Product product, Warehouse warehouse, MovementType movementType) {
        if (product == null || warehouse == null || movementType != MovementType.IN) {
            return;
        }
        if (product.getStockTrackingType() == null
                || StockTrackingType.QUANTITY_ONLY.equals(product.getStockTrackingType())
                || StockTrackingType.NO_STOCK.equals(product.getStockTrackingType())) {
            return;
        }

        stockItemRepository.findFirstByProductIdAndIsActiveTrueOrderByIdAsc(product.getId())
                .ifPresent(item -> markReadyInWarehouse(item, warehouse));
    }

    private void markReadyInWarehouse(StockItem item, Warehouse warehouse) {
        assetConditionSupport.applyReadyState(item);
        item.setCurrentWarehouse(warehouse);
        stockItemRepository.save(item);
    }
}
