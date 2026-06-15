package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.response.ProductDto;
import com.anabilim.purchase.entity.DeviceModel;
import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.ProductImage;
import com.anabilim.purchase.entity.StockItem;
import com.anabilim.purchase.entity.enums.StockItemStatus;
import com.anabilim.purchase.entity.enums.StockTrackingType;
import com.anabilim.purchase.repository.ProductImageRepository;
import com.anabilim.purchase.repository.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductInventoryService {

    private final StockItemRepository stockItemRepository;
    private final ProductImageRepository productImageRepository;
    private final AssetConditionSupport assetConditionSupport;

    public void enrichProductDto(ProductDto dto, Product product) {
        if (dto == null || product == null) {
            return;
        }
        dto.setImageUrls(productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId()).stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList()));
        dto.setCurrentStock(product.getCurrentStock());

        if (product.getDeviceModel() != null) {
            dto.setDeviceModelId(product.getDeviceModel().getId());
            dto.setDeviceModelName(formatDeviceModelName(product.getDeviceModel()));
        }
        if (product.getPurchaseRequest() != null) {
            dto.setPurchaseRequestId(product.getPurchaseRequest().getId());
            dto.setPurchaseRequestTitle(product.getPurchaseRequest().getTitle());
        }
        if (product.getSuppliers() != null && !product.getSuppliers().isEmpty()) {
            var first = product.getSuppliers().iterator().next();
            dto.setPrimarySupplierId(first.getId());
            dto.setPrimarySupplierName(first.getName());
        }

        if (product.getProductType() != null) {
            StockTrackingType tracking = product.getProductType().getStockTrackingType();
            boolean assetLike = StockTrackingType.SERIAL_NUMBER.equals(tracking)
                    || StockTrackingType.QUANTITY_REUSABLE.equals(tracking);
            if (assetLike) {
                applyAssetAssignability(dto, product);
            } else {
                applyConsumableAssignability(dto, product);
            }
        } else {
            applyConsumableAssignability(dto, product);
        }
    }

    private void applyConsumableAssignability(ProductDto dto, Product product) {
        boolean hasStock = product.getCurrentStock() != null && product.getCurrentStock() > 0;
        dto.setCanAssign(hasStock);
        dto.setMustReturnFirst(false);
        if (!hasStock) {
            dto.setAssignBlockers(List.of("Depoda stok bulunmuyor"));
        } else {
            dto.setAssignBlockers(List.of());
        }
    }

    private void applyAssetAssignability(ProductDto dto, Product product) {
        List<StockItem> activeItems = stockItemRepository.findByProductIdOrderByIdAsc(product.getId()).stream()
                .filter(StockItem::isActive)
                .toList();

        if (activeItems.isEmpty()) {
            dto.setCanAssign(false);
            dto.setMustReturnFirst(false);
            dto.setAssignBlockers(List.of("Bu ürün için kayıtlı cihaz bulunamadı"));
            return;
        }

        activeItems.stream().findFirst().ifPresent(item -> applyStockItem(dto, item));

        boolean anyAssignable = activeItems.stream()
                .anyMatch(item -> assetConditionSupport.isAssignable(item) && item.getCurrentWarehouse() != null);

        if (anyAssignable) {
            dto.setCanAssign(true);
            dto.setMustReturnFirst(false);
            dto.setAssignBlockers(List.of());
            return;
        }

        Set<String> blockers = new LinkedHashSet<>();
        boolean anyAssigned = activeItems.stream().anyMatch(StockItem::isAssigned);
        for (StockItem item : activeItems) {
            blockers.addAll(collectStockItemAssignBlockers(item));
        }
        dto.setCanAssign(false);
        dto.setMustReturnFirst(anyAssigned);
        dto.setAssignBlockers(new ArrayList<>(blockers));
    }

    private List<String> collectStockItemAssignBlockers(StockItem item) {
        List<String> blockers = new ArrayList<>();
        if (item == null) {
            return blockers;
        }

        StockItemStatus status = item.getStatus();
        if (StockItemStatus.ASSIGNED.equals(status) || StockItemStatus.IN_USE.equals(status)) {
            blockers.add("Cihaz atanmış veya kullanımda; önce depoya iade edilmeli");
        } else if (!StockItemStatus.IN_STOCK.equals(status)) {
            String statusLabel = status != null ? status.getDisplayName() : "bilinmiyor";
            blockers.add("Cihaz depoda değil (durum: " + statusLabel + ")");
        }

        if (item.getAssetCondition() == null) {
            blockers.add("Cihaz durumu tanımlı değil (ör. Hazır)");
        } else if (!Boolean.TRUE.equals(item.getAssetCondition().getAllowsAssignment())) {
            blockers.add("Cihaz durumu zimmete uygun değil: " + item.getAssetCondition().getName());
        }

        if (item.getCurrentWarehouse() == null) {
            blockers.add("Cihaz bir depoya bağlı değil");
        }

        return blockers;
    }

    public void enrichProductDtoList(List<ProductDto> dtos, List<Product> products) {
        java.util.Map<Long, Product> byId = products.stream()
                .filter(p -> p.getId() != null)
                .collect(java.util.stream.Collectors.toMap(Product::getId, p -> p, (a, b) -> a));
        for (ProductDto dto : dtos) {
            if (dto.getId() != null) {
                enrichProductDto(dto, byId.get(dto.getId()));
            }
        }
    }

    private void applyStockItem(ProductDto dto, StockItem item) {
        dto.setStockItemId(item.getId());
        dto.setStockItemStatus(item.getStatus() != null ? item.getStatus().name() : null);
        dto.setAssetLabel(item.getAssetLabel());
        dto.setDomainName(item.getDomainName());
        dto.setIpAddress(item.getIpAddress());
        dto.setMacAddress(item.getMacAddress());
        if (item.getDefaultParentLocation() != null) {
            dto.setDefaultParentLocationId(item.getDefaultParentLocation().getId());
        }
        if (item.getDefaultChildLocation() != null) {
            dto.setDefaultChildLocationId(item.getDefaultChildLocation().getId());
        }
        dto.setNotes(item.getNotes());
        dto.setPurchaseDate(item.getPurchaseDate());
        dto.setPurchasePrice(item.getPurchasePrice());
        dto.setOrderNumber(item.getOrderNumber());
        dto.setByod(item.getByod());
        dto.setWarrantyMonths(item.getWarrantyMonths());
        dto.setLifespanEndDate(item.getLifespanEndDate());
        if (item.getWarrantyExpiryDate() != null) {
            dto.setWarrantyExpiryDate(item.getWarrantyExpiryDate());
        }
        if (item.getSchool() != null) {
            dto.setSchoolId(item.getSchool().getId());
            dto.setSchoolName(item.getSchool().getName());
        }
        if (item.getDeviceModel() != null) {
            dto.setDeviceModelId(item.getDeviceModel().getId());
            dto.setDeviceModelName(formatDeviceModelName(item.getDeviceModel()));
        }
        if (item.getAssetCondition() != null) {
            dto.setAssetConditionId(item.getAssetCondition().getId());
            dto.setAssetConditionName(item.getAssetCondition().getName());
            dto.setAllowsAssignment(item.getAssetCondition().getAllowsAssignment());
        } else {
            dto.setAllowsAssignment(false);
        }
        boolean inStock = item.isInStock();
        boolean inUse = item.isAssigned();
        dto.setMustReturnFirst(inUse && !inStock);
        dto.setCanAssign(assetConditionSupport.isAssignable(item) && item.getCurrentWarehouse() != null);
    }

    private static String formatDeviceModelName(DeviceModel model) {
        if (model == null) {
            return null;
        }
        String brand = model.getBrand();
        if (brand != null && !brand.isBlank()) {
            return brand.trim() + " — " + model.getName();
        }
        return model.getName();
    }
}
