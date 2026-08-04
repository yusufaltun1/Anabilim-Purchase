package com.anabilim.purchase.service;

import com.anabilim.purchase.entity.AssetCondition;
import com.anabilim.purchase.entity.StockItem;
import com.anabilim.purchase.entity.enums.StockItemStatus;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.repository.AssetConditionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AssetConditionSupport {

    private static final String READY_CONDITION_NAME = "Hazır";

    private final AssetConditionRepository assetConditionRepository;

    public Optional<AssetCondition> findReadyCondition() {
        return assetConditionRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .filter(c -> READY_CONDITION_NAME.equalsIgnoreCase(c.getName())
                        && Boolean.TRUE.equals(c.getAllowsAssignment()))
                .findFirst()
                .or(() -> assetConditionRepository.findByIsActiveTrueOrderByNameAsc().stream()
                        .filter(c -> Boolean.TRUE.equals(c.getAllowsAssignment()))
                        .findFirst());
    }

    public void applyReadyState(StockItem stockItem) {
        stockItem.setStatus(StockItemStatus.IN_STOCK);
        findReadyCondition().ifPresent(stockItem::setAssetCondition);
    }

    public void applyConditionIfMissing(StockItem stockItem, Long conditionId) {
        if (conditionId != null) {
            validateConditionChangeAllowed(stockItem, conditionId);
            assetConditionRepository.findById(conditionId).ifPresent(stockItem::setAssetCondition);
            return;
        }
        if (stockItem.getAssetCondition() == null) {
            findReadyCondition().ifPresent(stockItem::setAssetCondition);
        }
    }

    public void validateConditionChangeAllowed(StockItem stockItem, Long newConditionId) {
        if (stockItem == null || !stockItem.isAssigned()) {
            return;
        }
        Long currentId = stockItem.getAssetCondition() != null ? stockItem.getAssetCondition().getId() : null;
        if (Objects.equals(currentId, newConditionId)) {
            return;
        }
        throw new ValidationException("Zimmetli cihazın durumu değiştirilemez. Önce zimmet iadesi alın.");
    }

    public boolean isAssignable(StockItem stockItem) {
        if (stockItem == null) {
            return false;
        }
        if (!StockItemStatus.IN_STOCK.equals(stockItem.getStatus())) {
            return false;
        }
        AssetCondition condition = stockItem.getAssetCondition();
        return condition != null && Boolean.TRUE.equals(condition.getAllowsAssignment());
    }

    public void validateAssignable(StockItem stockItem) {
        if (StockItemStatus.IN_USE.equals(stockItem.getStatus())
                || StockItemStatus.ASSIGNED.equals(stockItem.getStatus())) {
            throw new ValidationException("Cihaz kullanımda veya atanmış. Önce depoya iade edin.");
        }
        if (!StockItemStatus.IN_STOCK.equals(stockItem.getStatus())) {
            throw new ValidationException("Sadece depoda (hazır) durumundaki cihazlar zimmetlenebilir.");
        }
        AssetCondition condition = stockItem.getAssetCondition();
        if (condition == null) {
            throw new ValidationException("Zimmet için ürün durumu tanımlı olmalıdır (ör. Hazır).");
        }
        if (!Boolean.TRUE.equals(condition.getAllowsAssignment())) {
            throw new ValidationException(
                    "Seçilen durum (" + condition.getName() + ") zimmete uygun değil. Durumu 'Hazır' yapın.");
        }
    }
}
