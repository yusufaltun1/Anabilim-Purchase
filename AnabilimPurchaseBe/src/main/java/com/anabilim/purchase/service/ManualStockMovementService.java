package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.CreateStockMovementByWarehouseDto;
import com.anabilim.purchase.dto.response.StockMovementDto;
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
        if (MovementType.IN.equals(request.getMovementType())) {
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
                assetConditionSupport.applyReadyState(item);
                stockItemRepository.save(item);

                CreateStockMovementByWarehouseDto unitRequest = copyWith(
                        request, 1, "Manuel giriş — SN: " + serial + suffixNotes(request.getNotes()));
                lastMovement = persistMovement(unitRequest, warehouse, product, item);
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
                    request, 1, "Manuel çıkış — SN: " + serial + suffixNotes(request.getNotes()));
            StockMovement movement = persistMovement(unitRequest, warehouse, product, item);

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
        return persistMovement(request, warehouse, product, null);
    }

    private StockMovement persistMovement(
            CreateStockMovementByWarehouseDto request,
            Warehouse warehouse,
            Product product,
            StockItem stockItem) {
        WarehouseStock stock = findOrCreateWarehouseStock(warehouse, product);
        if (MovementType.OUT.equals(request.getMovementType())) {
            validateAvailableStock(stock, request);
        }
        StockMovement movement = buildMovement(request);
        movement.setStockItem(stockItem);
        stock.addMovement(movement);
        warehouseStockRepository.save(stock);
        return movement;
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
        return new StockMovementDto(
                movement.getId(),
                null,
                movement.getQuantity(),
                movement.getMovementType(),
                movement.getReferenceType(),
                movement.getReferenceId(),
                movement.getNotes(),
                movement.getStockItem() != null ? movement.getStockItem().getId() : null,
                movement.getStockItem() != null ? movement.getStockItem().getSerialNumber() : null,
                movement.getCreatedAt(),
                movement.getUpdatedAt()
        );
    }
}
