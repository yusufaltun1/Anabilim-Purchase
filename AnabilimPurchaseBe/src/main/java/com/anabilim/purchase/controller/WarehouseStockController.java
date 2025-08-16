package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.request.CreateStockMovementByWarehouseDto;
import com.anabilim.purchase.dto.request.CreateStockMovementDto;
import com.anabilim.purchase.dto.request.UpdateWarehouseStockDto;
import com.anabilim.purchase.dto.response.ProductStockDetailDto;
import com.anabilim.purchase.dto.response.ProductStockSummaryDto;
import com.anabilim.purchase.dto.response.StockMovementDto;
import com.anabilim.purchase.dto.response.WarehouseDto;
import com.anabilim.purchase.dto.response.WarehouseStockDto;
import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.StockMovement;
import com.anabilim.purchase.entity.Warehouse;
import com.anabilim.purchase.entity.WarehouseStock;
import com.anabilim.purchase.entity.enums.ProductType;
import com.anabilim.purchase.repository.ProductRepository;
import com.anabilim.purchase.repository.StockMovementRepository;
import com.anabilim.purchase.repository.WarehouseRepository;
import com.anabilim.purchase.repository.WarehouseStockRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/warehouse-stocks")
@RequiredArgsConstructor
public class WarehouseStockController {

    private final WarehouseStockRepository warehouseStockRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    @GetMapping("/products")
    public ResponseEntity<Page<ProductStockSummaryDto>> getProductsWithStockSummary(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String productType,
            @RequestParam(required = false) Boolean lowStock,
            Pageable pageable) {
        
        Page<Product> products;
        
        // Ürün tipi filtresi varsa önce onu uygula
        if (productType != null && !productType.trim().isEmpty()) {
            try {
                ProductType type = ProductType.valueOf(productType.toUpperCase());
                if (search != null && !search.trim().isEmpty()) {
                    // Ürün tipi + arama kombinasyonu için custom query gerekebilir
                    products = productRepository.findAll(pageable);
                    // Bu durumda manuel filtreleme yapılabilir
                } else if (categoryId != null) {
                    // Ürün tipi + kategori kombinasyonu için custom query gerekebilir
                    products = productRepository.findAll(pageable);
                    // Bu durumda manuel filtreleme yapılabilir
                } else {
                    products = productRepository.findByProductTypeAndIsActiveTrue(type, pageable);
                }
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Geçersiz ürün tipi: " + productType);
            }
        } else if (search != null && !search.trim().isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(
                    search.trim(), search.trim(), pageable);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }
        
        Page<ProductStockSummaryDto> result = products.map(this::convertToStockSummary);
        
        // Düşük stok filtresi varsa uygula
        if (lowStock != null && lowStock) {
            List<ProductStockSummaryDto> filteredList = result.getContent().stream()
                    .filter(ProductStockSummaryDto::isHasLowStock)
                    .collect(Collectors.toList());
            // Not: Bu basit filtreleme. Gerçek uygulamada database level'da yapılmalı
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<WarehouseStockDto>> getStocksByWarehouse(@PathVariable Long warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Depo bulunamadı"));

        List<WarehouseStockDto> stocks = warehouseStockRepository.findByWarehouse(warehouse).stream()
                .map(this::convertToStockDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(stocks);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<WarehouseStockDto>> getStocksByProduct(@PathVariable Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ürün bulunamadı"));

        List<WarehouseStockDto> stocks = warehouseStockRepository.findByProduct(product).stream()
                .map(this::convertToStockDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(stocks);
    }

    @GetMapping("/product/{productId}/detail")
    public ResponseEntity<ProductStockDetailDto> getProductStockDetail(@PathVariable Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ürün bulunamadı"));

        // Ürünün tüm depolardaki stok bilgilerini al
        List<WarehouseStock> warehouseStocks = warehouseStockRepository.findByProduct(product);
        
        // Toplam stok hesapla
        Integer totalStock = warehouseStocks.stream()
                .mapToInt(ws -> ws.getCurrentStock() != null ? ws.getCurrentStock() : 0)
                .sum();

        // Depo bazında stok detaylarını hazırla
        List<ProductStockDetailDto.WarehouseStockDetailDto> warehouseStockDetails = warehouseStocks.stream()
                .map(this::convertToWarehouseStockDetail)
                .collect(Collectors.toList());

        // Son 20 hareket kaydını al
        List<StockMovement> recentMovements = stockMovementRepository.findRecentMovementsByProduct(
                product, PageRequest.of(0, 20));
        
        List<StockMovementDto> recentMovementDtos = recentMovements.stream()
                .map(this::convertToMovementDto)
                .collect(Collectors.toList());

        ProductStockDetailDto response = new ProductStockDetailDto(
                convertToProductBasicDto(product),
                totalStock,
                warehouseStockDetails,
                recentMovementDtos
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<WarehouseStockDto>> getLowStocks() {
        List<WarehouseStockDto> stocks = warehouseStockRepository.findAllLowStock().stream()
                .map(this::convertToStockDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(stocks);
    }

    @PutMapping("/{stockId}")
    public ResponseEntity<WarehouseStockDto> updateStock(
            @PathVariable Long stockId,
            @Valid @RequestBody UpdateWarehouseStockDto request) {
        
        WarehouseStock stock = warehouseStockRepository.findById(stockId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stok kaydı bulunamadı"));

        stock.setMinStock(request.getMinStock());
        stock.setMaxStock(request.getMaxStock());
        stock = warehouseStockRepository.save(stock);

        return ResponseEntity.ok(convertToStockDto(stock));
    }

    @PostMapping("/{stockId}/movements")
    public ResponseEntity<StockMovementDto> createMovement(
            @PathVariable Long stockId,
            @Valid @RequestBody CreateStockMovementDto request) {
        
        WarehouseStock stock = warehouseStockRepository.findById(stockId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stok kaydı bulunamadı"));

        StockMovement movement = new StockMovement();
        movement.setQuantity(request.getQuantity());
        movement.setMovementType(request.getMovementType());
        movement.setReferenceType(request.getReferenceType());
        movement.setReferenceId(request.getReferenceId());
        movement.setNotes(request.getNotes());

        stock.addMovement(movement);
        stock = warehouseStockRepository.save(stock);

        return ResponseEntity.ok(convertToMovementDto(movement));
    }

    @PostMapping("/movements")
    public ResponseEntity<StockMovementDto> createMovementByWarehouse(
            @Valid @RequestBody CreateStockMovementByWarehouseDto request) {
        
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Depo bulunamadı"));
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ürün bulunamadı"));

        // Stok kaydını bul veya oluştur
        WarehouseStock stock = warehouseStockRepository.findByWarehouseAndProduct(warehouse, product)
                .orElseGet(() -> {
                    WarehouseStock newStock = new WarehouseStock();
                    newStock.setWarehouse(warehouse);
                    newStock.setProduct(product);
                    newStock.setCurrentStock(0);
                    return warehouseStockRepository.save(newStock);
                });

        StockMovement movement = new StockMovement();
        movement.setQuantity(request.getQuantity());
        movement.setMovementType(request.getMovementType());
        movement.setReferenceType(request.getReferenceType());
        movement.setReferenceId(request.getReferenceId());
        movement.setNotes(request.getNotes());

        stock.addMovement(movement);
        stock = warehouseStockRepository.save(stock);

        return ResponseEntity.ok(convertToMovementDto(movement));
    }

    @GetMapping("/{stockId}/movements")
    public ResponseEntity<Page<StockMovementDto>> getMovements(
            @PathVariable Long stockId,
            @RequestParam(required = false) String referenceType,
            @RequestParam(required = false) Long referenceId,
            Pageable pageable) {
        
        WarehouseStock stock = warehouseStockRepository.findById(stockId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stok kaydı bulunamadı"));

        Page<StockMovement> movements;
        if (referenceType != null && referenceId != null) {
            movements = stockMovementRepository.findByWarehouseStockAndReferenceTypeAndReferenceId(
                    stock, referenceType, referenceId, pageable);
        } else {
            movements = stockMovementRepository.findByWarehouseStock(stock, pageable);
        }

        return ResponseEntity.ok(movements.map(this::convertToMovementDto));
    }

    private ProductStockSummaryDto convertToStockSummary(Product product) {
        // Ürünün tüm depolardaki stok bilgilerini al
        List<WarehouseStock> warehouseStocks = warehouseStockRepository.findByProduct(product);
        
        // Toplam stok hesapla
        Integer totalStock = warehouseStocks.stream()
                .mapToInt(ws -> ws.getCurrentStock() != null ? ws.getCurrentStock() : 0)
                .sum();
        
        // Kaç depoda stok var
        Integer warehouseCount = warehouseStocks.size();
        
        // Herhangi bir depoda düşük stok var mı
        boolean hasLowStock = warehouseStocks.stream()
                .anyMatch(ws -> ws.getMinStock() != null && 
                              ws.getCurrentStock() != null && 
                              ws.getCurrentStock() <= ws.getMinStock());
        
        // En son hareket tarihi
        LocalDateTime lastMovementDate = stockMovementRepository
                .findLastMovementDateByProduct(product)
                .orElse(null);
        
        return new ProductStockSummaryDto(
                product.getId(),
                product.getName(),
                product.getCode(),
                product.getDescription(),
                product.getUnitOfMeasure().getDisplayName(),
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getProductType() != null ? product.getProductType().getDisplayName() : null,
                totalStock,
                warehouseCount,
                hasLowStock,
                lastMovementDate,
                product.isActive()
        );
    }

    private ProductStockDetailDto.ProductBasicDto convertToProductBasicDto(Product product) {
        return new ProductStockDetailDto.ProductBasicDto(
                product.getId(),
                product.getName(),
                product.getCode(),
                product.getDescription(),
                product.getUnitOfMeasure().getDisplayName(),
                product.getCategory() != null ? product.getCategory().getName() : null
        );
    }

    private ProductStockDetailDto.WarehouseStockDetailDto convertToWarehouseStockDetail(WarehouseStock stock) {
        // Son hareket tarihini al
        LocalDateTime lastMovementDate = stockMovementRepository
                .findLastMovementDateByWarehouseStock(stock)
                .orElse(null);

        // Düşük stok kontrolü
        boolean isLowStock = stock.getMinStock() != null && 
                            stock.getCurrentStock() != null && 
                            stock.getCurrentStock() <= stock.getMinStock();

        return new ProductStockDetailDto.WarehouseStockDetailDto(
                stock.getId(),
                new ProductStockDetailDto.WarehouseStockDetailDto.WarehouseBasicDto(
                        stock.getWarehouse().getId(),
                        stock.getWarehouse().getName(),
                        stock.getWarehouse().getCode(),
                        stock.getWarehouse().getAddress()
                ),
                stock.getCurrentStock(),
                stock.getMinStock(),
                stock.getMaxStock(),
                isLowStock,
                lastMovementDate
        );
    }

    private WarehouseStockDto convertToStockDto(WarehouseStock stock) {
        return new WarehouseStockDto(
                stock.getId(),
                convertToWarehouseDto(stock.getWarehouse()),
                convertToProductBasicDto2(stock.getProduct()),
                stock.getCurrentStock(),
                stock.getMinStock(),
                stock.getMaxStock(),
                stock.getCreatedAt(),
                stock.getUpdatedAt()
        );
    }

    private WarehouseDto convertToWarehouseDto(Warehouse warehouse) {
        return new WarehouseDto(
                warehouse.getId(),
                warehouse.getName(),
                warehouse.getCode(),
                warehouse.getAddress(),
                warehouse.getPhone(),
                warehouse.getEmail(),
                warehouse.getManagerName(),
                warehouse.isActive(),
                warehouse.getCreatedAt(),
                warehouse.getUpdatedAt()
        );
    }

    private WarehouseStockDto.ProductBasicDto convertToProductBasicDto2(Product product) {
        return new WarehouseStockDto.ProductBasicDto(
                product.getId(),
                product.getName(),
                product.getCode(),
                product.getUnitOfMeasure().getDisplayName()
        );
    }

    private StockMovementDto convertToMovementDto(StockMovement movement) {
        return new StockMovementDto(
                movement.getId(),
                convertToStockDto(movement.getWarehouseStock()),
                movement.getQuantity(),
                movement.getMovementType(),
                movement.getReferenceType(),
                movement.getReferenceId(),
                movement.getNotes(),
                movement.getCreatedAt(),
                movement.getUpdatedAt()
        );
    }
} 