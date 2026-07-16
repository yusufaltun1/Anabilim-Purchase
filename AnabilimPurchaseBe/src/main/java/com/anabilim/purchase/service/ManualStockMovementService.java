package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.CreateStockMovementByWarehouseDto;
import com.anabilim.purchase.dto.response.StockMovementDto;
import com.anabilim.purchase.entity.Location;
import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.StockItem;
import com.anabilim.purchase.entity.StockMovement;
import com.anabilim.purchase.entity.Warehouse;
import com.anabilim.purchase.entity.WarehouseStock;
import com.anabilim.purchase.entity.enums.MovementType;
import com.anabilim.purchase.entity.enums.StockTrackingType;
import com.anabilim.purchase.exception.ResourceAlreadyExistsException;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.repository.LocationRepository;
import com.anabilim.purchase.repository.ProductRepository;
import com.anabilim.purchase.repository.StockItemRepository;
import com.anabilim.purchase.repository.WarehouseRepository;
import com.anabilim.purchase.repository.WarehouseStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class ManualStockMovementService {

    private final WarehouseStockRepository warehouseStockRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final StockItemRepository stockItemRepository;
    private final LocationRepository locationRepository;
    private final AssetConditionSupport assetConditionSupport;

    public StockMovementDto createManualMovement(CreateStockMovementByWarehouseDto request) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Depo bulunamadı: " + request.getWarehouseId()));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + request.getProductId()));

        StockTrackingType tracking = product.getStockTrackingType();
        if (tracking == null && product.getProductType() != null) {
            tracking = product.getProductType().getStockTrackingType();
        }

        if (StockTrackingType.SERIAL_NUMBER.equals(tracking)) {
            return createSerialTrackedMovement(request, warehouse, product);
        }
        if (StockTrackingType.QUANTITY_REUSABLE.equals(tracking)) {
            return createSemiReusableMovement(request, warehouse, product);
        }
        return createQuantityMovement(request, warehouse, product);
    }

    private StockMovementDto createQuantityMovement(
            CreateStockMovementByWarehouseDto request, Warehouse warehouse, Product product) {
        validateQuantityMovement(request);
        WarehouseStock stock = findOrCreateWarehouseStock(warehouse, product);
        validateAvailableStock(stock, request);

        StockMovement movement = buildMovement(request);
        stock.addMovement(movement);
        warehouseStockRepository.save(stock);
        return toDto(movement);
    }

    private StockMovementDto createSemiReusableMovement(
            CreateStockMovementByWarehouseDto request, Warehouse warehouse, Product product) {
        if (MovementType.IN.equals(request.getMovementType())) {
            validateSemiInbound(request);
            List<String> serials = normalizeSerials(request);
            int quantity = request.getQuantity() != null ? request.getQuantity() : serials.size();
            if (quantity < 1) {
                throw new ValidationException("Miktar en az 1 olmalıdır");
            }

            StockMovement lastMovement = null;
            for (int i = 0; i < quantity; i++) {
                String serial = i < serials.size() ? serials.get(i) : null;
                String notes = appendSerialToNotes(request.getNotes(), serial);
                CreateStockMovementByWarehouseDto unitRequest = copyWith(request, 1, notes);
                lastMovement = persistMovement(unitRequest, warehouse, product);

                StockItem item = new StockItem();
                item.setProduct(product);
                item.setCurrentWarehouse(warehouse);
                if (serial != null && !serial.isBlank()) {
                    if (stockItemRepository.existsBySerialNumber(serial)) {
                        throw new ResourceAlreadyExistsException("Bu seri numarası zaten mevcut: " + serial);
                    }
                    item.setSerialNumber(serial);
                }
                item.setNotes(notes);
                assetConditionSupport.applyReadyState(item);
                stockItemRepository.save(item);
            }
            return toDto(lastMovement);
        }

        validateQuantityMovement(request);
        WarehouseStock stock = findOrCreateWarehouseStock(warehouse, product);
        validateAvailableStock(stock, request);
        releaseSemiReusableItems(product, warehouse, request.getQuantity());
        StockMovement movement = buildMovement(request);
        stock.addMovement(movement);
        warehouseStockRepository.save(stock);
        return toDto(movement);
    }

    private StockMovementDto createSerialTrackedMovement(
            CreateStockMovementByWarehouseDto request, Warehouse warehouse, Product product) {
        Location parentLocation = resolveParentLocation(request);
        Location childLocation = resolveChildLocation(request);
        requireDemirbasLocations(parentLocation);

        if (MovementType.IN.equals(request.getMovementType())) {
            if (request.getStockItemId() != null) {
                StockItem item = stockItemRepository.findById(request.getStockItemId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Cihaz bulunamadı: " + request.getStockItemId()));
                if (!item.getProduct().getId().equals(product.getId())) {
                    throw new ValidationException("Seçilen cihaz bu ürüne ait değil");
                }
                if (item.getCurrentWarehouse() != null) {
                    throw new ValidationException("Seçilen cihaz zaten bir depoda");
                }

                String serial = item.getSerialNumber() != null ? item.getSerialNumber() : ("#" + item.getId());
                CreateStockMovementByWarehouseDto unitRequest = copyWith(
                        request, 1, appendLocationNotes(
                                "Manuel giriş — SN: " + serial + suffixNotes(request.getNotes()),
                                parentLocation,
                                childLocation));
                StockMovement movement = persistMovement(
                        unitRequest, warehouse, product, item, parentLocation, childLocation);

                item.setCurrentWarehouse(warehouse);
                assetConditionSupport.applyReadyState(item);
                applyLocationsToStockItem(item, parentLocation, childLocation);
                stockItemRepository.save(item);
                return toDto(movement);
            }

            List<String> serials = normalizeSerials(request);
            if (serials.isEmpty()) {
                throw new ValidationException("Demirbaş girişi için en az bir seri numarası gerekli");
            }

            StockMovement lastMovement = null;
            for (String serial : serials) {
                if (serial == null || serial.isBlank()) {
                    throw new ValidationException("Tüm seri numaraları doldurulmalıdır");
                }
                if (stockItemRepository.existsBySerialNumber(serial)) {
                    throw new ResourceAlreadyExistsException("Bu seri numarası zaten mevcut: " + serial);
                }

                StockItem item = new StockItem();
                item.setProduct(product);
                item.setSerialNumber(serial);
                item.setCurrentWarehouse(warehouse);
                if (product.getCode() != null) {
                    item.setAssetLabel(product.getCode());
                }
                item.setNotes(request.getNotes());
                applyLocationsToStockItem(item, parentLocation, childLocation);
                assetConditionSupport.applyReadyState(item);
                stockItemRepository.save(item);

                CreateStockMovementByWarehouseDto unitRequest = copyWith(
                        request, 1, appendLocationNotes(
                                "Manuel giriş — SN: " + serial + suffixNotes(request.getNotes()),
                                parentLocation,
                                childLocation));
                lastMovement = persistMovement(unitRequest, warehouse, product, item, parentLocation, childLocation);
            }
            return toDto(lastMovement);
        }

        if (MovementType.OUT.equals(request.getMovementType())) {
            if (request.getStockItemId() == null) {
                throw new ValidationException("Demirbaş çıkışı için depodaki cihaz seçilmelidir");
            }
            StockItem item = stockItemRepository.findById(request.getStockItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cihaz bulunamadı: " + request.getStockItemId()));
            if (!item.getProduct().getId().equals(product.getId())) {
                throw new ValidationException("Seçilen cihaz bu ürüne ait değil");
            }
            if (item.getCurrentWarehouse() == null
                    || !item.getCurrentWarehouse().getId().equals(warehouse.getId())) {
                throw new ValidationException("Seçilen cihaz bu depoda değil");
            }
            assetConditionSupport.validateAssignable(item);

            String serial = item.getSerialNumber() != null ? item.getSerialNumber() : ("#" + item.getId());
            CreateStockMovementByWarehouseDto unitRequest = copyWith(
                    request, 1, appendLocationNotes(
                            "Manuel çıkış — SN: " + serial + suffixNotes(request.getNotes()),
                            parentLocation,
                            childLocation));
            StockMovement movement = persistMovement(
                    unitRequest, warehouse, product, item, parentLocation, childLocation);

            applyLocationsToStockItem(item, parentLocation, childLocation);
            item.setCurrentWarehouse(null);
            stockItemRepository.save(item);
            return toDto(movement);
        }

        throw new ValidationException("Demirbaş ürünlerde yalnızca giriş veya çıkış yapılabilir");
    }

    private void releaseSemiReusableItems(Product product, Warehouse warehouse, Integer quantity) {
        if (quantity == null || quantity < 1) {
            return;
        }
        List<StockItem> items = stockItemRepository.findByProductIdOrderByIdAsc(product.getId()).stream()
                .filter(StockItem::isActive)
                .filter(item -> item.getCurrentWarehouse() != null
                        && item.getCurrentWarehouse().getId().equals(warehouse.getId()))
                .filter(item -> assetConditionSupport.isAssignable(item))
                .limit(quantity)
                .toList();
        for (StockItem item : items) {
            item.setCurrentWarehouse(null);
            stockItemRepository.save(item);
        }
    }

    private StockMovement persistMovement(
            CreateStockMovementByWarehouseDto request, Warehouse warehouse, Product product) {
        return persistMovement(request, warehouse, product, null, null, null);
    }

    private StockMovement persistMovement(
            CreateStockMovementByWarehouseDto request,
            Warehouse warehouse,
            Product product,
            StockItem stockItem) {
        return persistMovement(request, warehouse, product, stockItem, null, null);
    }

    private StockMovement persistMovement(
            CreateStockMovementByWarehouseDto request,
            Warehouse warehouse,
            Product product,
            StockItem stockItem,
            Location parentLocation,
            Location childLocation) {
        WarehouseStock stock = findOrCreateWarehouseStock(warehouse, product);
        if (MovementType.OUT.equals(request.getMovementType())) {
            validateAvailableStock(stock, request);
        }
        StockMovement movement = buildMovement(request);
        movement.setStockItem(stockItem);
        movement.setParentLocation(parentLocation);
        movement.setChildLocation(childLocation);
        stock.addMovement(movement);
        warehouseStockRepository.save(stock);
        return movement;
    }

    private void requireDemirbasLocations(Location parentLocation) {
        if (parentLocation == null) {
            throw new ValidationException("Demirbaş giriş/çıkış için lokasyon seçilmelidir");
        }
    }

    private Location resolveParentLocation(CreateStockMovementByWarehouseDto request) {
        if (request.getParentLocationId() == null) {
            return null;
        }
        return locationRepository.findById(request.getParentLocationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Üst lokasyon bulunamadı: " + request.getParentLocationId()));
    }

    private Location resolveChildLocation(CreateStockMovementByWarehouseDto request) {
        if (request.getChildLocationId() == null) {
            return null;
        }
        return locationRepository.findById(request.getChildLocationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Alt lokasyon bulunamadı: " + request.getChildLocationId()));
    }

    private void applyLocationsToStockItem(StockItem item, Location parentLocation, Location childLocation) {
        if (parentLocation != null) {
            item.setDefaultParentLocation(parentLocation);
        }
        if (childLocation != null) {
            item.setDefaultChildLocation(childLocation);
        } else if (parentLocation != null) {
            item.setDefaultChildLocation(null);
        }
    }

    private String appendLocationNotes(String baseNotes, Location parentLocation, Location childLocation) {
        String locationLabel = formatLocationLabel(parentLocation, childLocation);
        if (locationLabel == null) {
            return baseNotes;
        }
        if (baseNotes == null || baseNotes.isBlank()) {
            return "Lokasyon: " + locationLabel;
        }
        return baseNotes + " — Lokasyon: " + locationLabel;
    }

    private String formatLocationLabel(Location parentLocation, Location childLocation) {
        if (parentLocation == null && childLocation == null) {
            return null;
        }
        if (parentLocation != null && childLocation != null) {
            return parentLocation.getName() + " / " + childLocation.getName();
        }
        if (childLocation != null) {
            return childLocation.getName();
        }
        return parentLocation.getName();
    }

    private WarehouseStock findOrCreateWarehouseStock(Warehouse warehouse, Product product) {
        return warehouseStockRepository.findByWarehouseAndProduct(warehouse, product)
                .orElseGet(() -> {
                    WarehouseStock newStock = new WarehouseStock();
                    newStock.setWarehouse(warehouse);
                    newStock.setProduct(product);
                    return warehouseStockRepository.save(newStock);
                });
    }

    private void validateQuantityMovement(CreateStockMovementByWarehouseDto request) {
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new ValidationException("Miktar en az 1 olmalıdır");
        }
    }

    private void validateSemiInbound(CreateStockMovementByWarehouseDto request) {
        List<String> serials = normalizeSerials(request);
        if ((request.getQuantity() == null || request.getQuantity() < 1) && serials.isEmpty()) {
            throw new ValidationException("Miktar en az 1 olmalıdır");
        }
    }

    private void validateAvailableStock(WarehouseStock stock, CreateStockMovementByWarehouseDto request) {
        if (!MovementType.OUT.equals(request.getMovementType())) {
            return;
        }
        int available = stock.getCurrentStock();
        int qty = request.getQuantity() != null ? request.getQuantity() : 0;
        if (qty > available) {
            throw new ValidationException("Bu depoda yalnızca " + available + " adet var");
        }
    }

    private List<String> normalizeSerials(CreateStockMovementByWarehouseDto request) {
        List<String> serials = new ArrayList<>();
        if (request.getSerialNumbers() != null) {
            request.getSerialNumbers().stream()
                    .map(s -> s != null ? s.trim() : "")
                    .filter(s -> !s.isEmpty())
                    .forEach(serials::add);
        }
        if (request.getSerialNumber() != null && !request.getSerialNumber().isBlank()) {
            serials.add(request.getSerialNumber().trim());
        }
        return serials;
    }

    private CreateStockMovementByWarehouseDto copyWith(
            CreateStockMovementByWarehouseDto source, int quantity, String notes) {
        CreateStockMovementByWarehouseDto copy = new CreateStockMovementByWarehouseDto();
        copy.setWarehouseId(source.getWarehouseId());
        copy.setProductId(source.getProductId());
        copy.setQuantity(quantity);
        copy.setMovementType(source.getMovementType());
        copy.setReferenceType(source.getReferenceType());
        copy.setReferenceId(source.getReferenceId());
        copy.setNotes(notes);
        copy.setStockItemId(source.getStockItemId());
        copy.setParentLocationId(source.getParentLocationId());
        copy.setChildLocationId(source.getChildLocationId());
        return copy;
    }

    private String appendSerialToNotes(String notes, String serial) {
        if (serial == null || serial.isBlank()) {
            return notes;
        }
        String prefix = "SN: " + serial;
        if (notes == null || notes.isBlank()) {
            return prefix;
        }
        return prefix + " — " + notes;
    }

    private String suffixNotes(String notes) {
        if (notes == null || notes.isBlank()) {
            return "";
        }
        return " — " + notes;
    }

    private StockMovement buildMovement(CreateStockMovementByWarehouseDto request) {
        StockMovement movement = new StockMovement();
        movement.setQuantity(request.getQuantity());
        movement.setMovementType(request.getMovementType());
        movement.setReferenceType(
                request.getReferenceType() != null ? request.getReferenceType().toUpperCase(Locale.ROOT) : "MANUAL");
        movement.setReferenceId(request.getReferenceId());
        movement.setNotes(request.getNotes());
        return movement;
    }

    private StockMovementDto toDto(StockMovement movement) {
        StockMovementDto dto = new StockMovementDto();
        dto.setId(movement.getId());
        dto.setQuantity(movement.getQuantity());
        dto.setMovementType(movement.getMovementType());
        dto.setReferenceType(movement.getReferenceType());
        dto.setReferenceId(movement.getReferenceId());
        dto.setNotes(movement.getNotes());
        dto.setStockItemId(movement.getStockItem() != null ? movement.getStockItem().getId() : null);
        dto.setStockItemSerialNumber(
                movement.getStockItem() != null ? movement.getStockItem().getSerialNumber() : null);
        if (movement.getParentLocation() != null) {
            dto.setParentLocationId(movement.getParentLocation().getId());
            dto.setParentLocationName(movement.getParentLocation().getName());
        }
        if (movement.getChildLocation() != null) {
            dto.setChildLocationId(movement.getChildLocation().getId());
            dto.setChildLocationName(movement.getChildLocation().getName());
        }
        dto.setCreatedAt(movement.getCreatedAt());
        dto.setUpdatedAt(movement.getUpdatedAt());
        return dto;
    }
}
