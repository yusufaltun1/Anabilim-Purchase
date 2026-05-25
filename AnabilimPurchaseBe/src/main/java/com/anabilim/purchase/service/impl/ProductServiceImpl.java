package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreateProductDto;
import com.anabilim.purchase.dto.request.UpdateProductDto;
import com.anabilim.purchase.dto.response.ProductDto;
import com.anabilim.purchase.entity.*;
import com.anabilim.purchase.entity.enums.StockTrackingType;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.mapper.ProductMapper;
import com.anabilim.purchase.repository.*;
import com.anabilim.purchase.service.ProductInventoryService;
import com.anabilim.purchase.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductMapper productMapper;
    private final ProductImageRepository productImageRepository;
    private final StockItemRepository stockItemRepository;
    private final DeviceModelRepository deviceModelRepository;
    private final AssetConditionRepository assetConditionRepository;
    private final LocationRepository locationRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final SchoolRepository schoolRepository;
    private final ProductInventoryService productInventoryService;

    @Override
    public ProductDto createProduct(CreateProductDto createDto) {
        Category category = categoryRepository.findById(createDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + createDto.getCategoryId()));

        Product product = productMapper.toEntity(createDto);
        product.setCategory(category);
        if (category.getProductType() != null) {
            product.setProductType(category.getProductType());
            product.updateStockTrackingTypeFromProductType();
        }

        if (createDto.getCode() == null || createDto.getCode().trim().isEmpty()) {
            product.setCode(generateProductCode(createDto.getName(), category));
        } else if (productRepository.existsByCode(createDto.getCode())) {
            throw new ValidationException("Bu kod ile zaten bir ürün mevcut: " + createDto.getCode());
        }

        applyProductRelations(product, createDto.getDeviceModelId(), createDto.getPurchaseRequestId());
        applySuppliers(product, createDto.getSupplierIds());

        product = productRepository.save(product);
        saveProductImages(product, createDto.getImageUrls(), createDto.getImageUrl());

        if (isSerialTracked(product)) {
            createStockItemFromDto(product, createDto);
        }

        ProductDto dto = productMapper.toDto(product);
        productInventoryService.enrichProductDto(dto, product);
        return dto;
    }

    @Override
    public ProductDto updateProduct(Long id, UpdateProductDto updateDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + id));

        Category category = categoryRepository.findById(updateDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + updateDto.getCategoryId()));

        productMapper.updateEntity(product, updateDto);
        product.setCategory(category);
        if (category.getProductType() != null) {
            product.setProductType(category.getProductType());
            product.updateStockTrackingTypeFromProductType();
        }

        applyProductRelations(product, updateDto.getDeviceModelId(), updateDto.getPurchaseRequestId());
        applySuppliers(product, updateDto.getSupplierIds());

        final Product savedProduct = productRepository.save(product);
        if (updateDto.getImageUrls() != null) {
            productImageRepository.deleteByProductId(savedProduct.getId());
            saveProductImages(savedProduct, updateDto.getImageUrls(), updateDto.getImageUrl());
        }

        if (isSerialTracked(savedProduct)) {
            StockItem item = stockItemRepository.findFirstByProductIdAndIsActiveTrueOrderByIdAsc(savedProduct.getId())
                    .orElseGet(() -> {
                        StockItem si = new StockItem();
                        si.setProduct(savedProduct);
                        return si;
                    });
            updateStockItemFromUpdateDto(item, updateDto);
            stockItemRepository.save(item);
        }

        ProductDto dto = productMapper.toDto(savedProduct); 
        productInventoryService.enrichProductDto(dto, savedProduct);
        return dto;
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + id));
        if (product.getPurchaseRequestItems() != null && !product.getPurchaseRequestItems().isEmpty()) {
            throw new ValidationException("Bu ürün satın alma taleplerinde kullanıldığı için silinemez");
        }
        productRepository.delete(product);
    }

    @Override
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + id));
        ProductDto dto = productMapper.toDto(product);
        productInventoryService.enrichProductDto(dto, product);
        return dto;
    }

    @Override
    public ProductDto getProductByCode(String code) {
        Product product = productRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + code));
        ProductDto dto = productMapper.toDto(product);
        productInventoryService.enrichProductDto(dto, product);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        List<Product> products = productRepository.findAll();
        List<ProductDto> dtos = productMapper.toDtoList(products);
        productInventoryService.enrichProductDtoList(dtos, products);
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> getActiveProducts() {
        List<Product> products = productRepository.findByIsActiveTrue();
        List<ProductDto> dtos = productMapper.toDtoList(products);
        productInventoryService.enrichProductDtoList(dtos, products);
        return dtos;
    }

    @Override
    public List<ProductDto> getProductsByCategory(Long categoryId) {
        List<Product> products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId);
        List<ProductDto> dtos = productMapper.toDtoList(products);
        productInventoryService.enrichProductDtoList(dtos, products);
        return dtos;
    }

    @Override
    public List<ProductDto> getProductsBySupplier(Long supplierId) {
        return productMapper.toDtoList(productRepository.findBySuppliersIdAndIsActiveTrue(supplierId));
    }

    @Override
    public List<ProductDto> searchProducts(String name) {
        List<Product> products = productRepository.findByIsActiveTrueAndNameContainingIgnoreCase(name);
        List<ProductDto> dtos = productMapper.toDtoList(products);
        productInventoryService.enrichProductDtoList(dtos, products);
        return dtos;
    }

    @Override
    public void addSupplier(Long productId, Long supplierId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + productId));
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı: " + supplierId));
        product.addSupplier(supplier);
        productRepository.save(product);
    }

    @Override
    public void removeSupplier(Long productId, Long supplierId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + productId));
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı: " + supplierId));
        product.removeSupplier(supplier);
        productRepository.save(product);
    }

    private void createStockItemFromDto(Product product, CreateProductDto dto) {
        StockItem item = new StockItem();
        item.setProduct(product);
        item.setSerialNumber(dto.getSerialNumber() != null ? dto.getSerialNumber() : product.getSerialNumber());
        item.setAssetLabel(dto.getAssetLabel());
        item.setDomainName(dto.getDomainName());
        item.setIpAddress(dto.getIpAddress());
        item.setMacAddress(dto.getMacAddress());
        applyStockItemProcurement(item, dto.getNotes(), dto.getPurchaseDate(), dto.getPurchasePrice(),
                dto.getOrderNumber(), dto.getByod(), dto.getWarrantyMonths(), dto.getLifespanEndDate(),
                dto.getWarrantyExpiryDate(), dto.getSchoolId());
        resolveStockItemRelations(item, dto.getDeviceModelId(), dto.getAssetConditionId(),
                dto.getDefaultParentLocationId(), dto.getDefaultChildLocationId());
        stockItemRepository.save(item);
    }

    private void updateStockItemFromUpdateDto(StockItem item, UpdateProductDto dto) {
        if (dto.getSerialnumber() != null) {
            item.setSerialNumber(dto.getSerialnumber());
        }
        item.setAssetLabel(dto.getAssetLabel());
        item.setDomainName(dto.getDomainName());
        item.setIpAddress(dto.getIpAddress());
        item.setMacAddress(dto.getMacAddress());
        applyStockItemProcurement(item, dto.getNotes(), dto.getPurchaseDate(), dto.getPurchasePrice(),
                dto.getOrderNumber(), dto.getByod(), dto.getWarrantyMonths(), dto.getLifespanEndDate(),
                dto.getWarrantyExpiryDate(), dto.getSchoolId());
        resolveStockItemRelations(item, dto.getDeviceModelId(), dto.getAssetConditionId(),
                dto.getDefaultParentLocationId(), dto.getDefaultChildLocationId());
    }

    private void applyStockItemProcurement(StockItem item, String notes, LocalDateTime purchaseDate,
                                           java.math.BigDecimal purchasePrice, String orderNumber, Boolean byod,
                                           Integer warrantyMonths, LocalDateTime lifespanEndDate,
                                           LocalDateTime warrantyExpiryDate, Long schoolId) {
        item.setNotes(notes);
        item.setPurchaseDate(purchaseDate);
        item.setPurchasePrice(purchasePrice);
        item.setOrderNumber(orderNumber);
        item.setByod(Boolean.TRUE.equals(byod));
        item.setWarrantyMonths(warrantyMonths);
        item.setLifespanEndDate(lifespanEndDate);
        if (warrantyMonths != null && purchaseDate != null) {
            item.setWarrantyExpiryDate(purchaseDate.plusMonths(warrantyMonths));
        } else if (warrantyExpiryDate != null) {
            item.setWarrantyExpiryDate(warrantyExpiryDate);
        }
        if (schoolId != null) {
            schoolRepository.findById(schoolId).ifPresent(item::setSchool);
        } else {
            item.setSchool(null);
        }
    }

    private void resolveStockItemRelations(StockItem item, Long deviceModelId, Long conditionId,
                                           Long parentLocId, Long childLocId) {
        if (deviceModelId != null) {
            deviceModelRepository.findById(deviceModelId).ifPresent(item::setDeviceModel);
        }
        if (conditionId != null) {
            assetConditionRepository.findById(conditionId).ifPresent(item::setAssetCondition);
        }
        if (parentLocId != null) {
            locationRepository.findById(parentLocId).ifPresent(item::setDefaultParentLocation);
        }
        if (childLocId != null) {
            locationRepository.findById(childLocId).ifPresent(item::setDefaultChildLocation);
        }
    }

    private void applyProductRelations(Product product, Long deviceModelId, Long purchaseRequestId) {
        if (deviceModelId != null) {
            deviceModelRepository.findById(deviceModelId).ifPresent(product::setDeviceModel);
        }
        if (purchaseRequestId != null) {
            purchaseRequestRepository.findById(purchaseRequestId).ifPresent(product::setPurchaseRequest);
        }
    }

    private void saveProductImages(Product product, List<String> imageUrls, String legacyImageUrl) {
        List<String> urls = new ArrayList<>();
        if (imageUrls != null) {
            urls.addAll(imageUrls.stream().filter(u -> u != null && !u.isBlank()).toList());
        }
        if (urls.isEmpty() && legacyImageUrl != null && !legacyImageUrl.isBlank()) {
            urls.add(legacyImageUrl);
        }
        int order = 0;
        for (String url : urls) {
            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setImageUrl(url);
            img.setDisplayOrder(order++);
            productImageRepository.save(img);
        }
        if (!urls.isEmpty()) {
            product.setImageUrl(urls.get(0));
        }
    }

    private void applySuppliers(Product product, Set<Long> supplierIds) {
        if (supplierIds == null || supplierIds.isEmpty()) {
            return;
        }
        Set<Supplier> suppliers = new HashSet<>();
        for (Long supplierId : supplierIds) {
            Supplier supplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı: " + supplierId));
            suppliers.add(supplier);
        }
        product.setSuppliers(suppliers);
    }

    private boolean isSerialTracked(Product product) {
        if (product.getProductType() == null) {
            return false;
        }
        StockTrackingType tracking = product.getProductType().getStockTrackingType();
        return StockTrackingType.SERIAL_NUMBER.equals(tracking)
                || StockTrackingType.QUANTITY_REUSABLE.equals(tracking);
    }

    private String generateProductCode(String productName, Category category) {
        String categoryCode = category.getCode() != null ? category.getCode().toUpperCase() : "PRD";
        String namePrefix = "PRD";
        if (productName != null && !productName.trim().isEmpty()) {
            String cleanedName = productName.trim().toUpperCase().replaceAll("[^A-Z0-9]", "");
            if (!cleanedName.isEmpty()) {
                namePrefix = cleanedName.substring(0, Math.min(5, cleanedName.length()));
            }
        }
        String baseCode = categoryCode + "-" + namePrefix;
        String finalCode = baseCode;
        int counter = 1;
        while (productRepository.existsByCode(finalCode)) {
            finalCode = baseCode + "-" + counter++;
            if (counter > 9999) {
                finalCode = baseCode + "-" + System.currentTimeMillis();
                break;
            }
        }
        return finalCode;
    }
}
