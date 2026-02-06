package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreateProductDto;
import com.anabilim.purchase.dto.request.UpdateProductDto;
import com.anabilim.purchase.dto.response.ProductDto;
import com.anabilim.purchase.entity.Category;
import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.Supplier;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.mapper.ProductMapper;
import com.anabilim.purchase.repository.CategoryRepository;
import com.anabilim.purchase.repository.ProductRepository;
import com.anabilim.purchase.repository.SupplierRepository;
import com.anabilim.purchase.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductMapper productMapper;
    
    @Override
    public ProductDto createProduct(CreateProductDto createDto) {
        Category category = categoryRepository.findById(createDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + createDto.getCategoryId()));
        
        Product product = productMapper.toEntity(createDto);
        product.setCategory(category);
        
        // Ürün kodu otomatik oluştur (eğer boşsa)
        if (createDto.getCode() == null || createDto.getCode().trim().isEmpty()) {
            String generatedCode = generateProductCode(createDto.getName(), category);
            product.setCode(generatedCode);
        } else {
            // Manuel kod girilmişse kontrol et
            if (productRepository.existsByCode(createDto.getCode())) {
                throw new ValidationException("Bu kod ile zaten bir ürün mevcut: " + createDto.getCode());
            }
        }
        
        if (createDto.getSupplierIds() != null && !createDto.getSupplierIds().isEmpty()) {
            Set<Supplier> suppliers = new HashSet<>();
            for (Long supplierId : createDto.getSupplierIds()) {
                Supplier supplier = supplierRepository.findById(supplierId)
                        .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı: " + supplierId));
                suppliers.add(supplier);
            }
            product.setSuppliers(suppliers);
        }
        
        product = productRepository.save(product);
        return productMapper.toDto(product);
    }
    
    /**
     * Ürün kodu otomatik oluşturma metodu
     * Format: KATEGORI_KODU-URUN_ADI_BAS_HARFLERI-SAYI
     */
    private String generateProductCode(String productName, Category category) {
        String categoryCode = category.getCode() != null ? category.getCode().toUpperCase() : "PRD";
        
        // Ürün adından ilk harfleri al (maksimum 5 karakter)
        String namePrefix = "PRD";
        if (productName != null && !productName.trim().isEmpty()) {
            String cleanedName = productName.trim().toUpperCase().replaceAll("[^A-Z0-9]", "");
            if (!cleanedName.isEmpty()) {
                int length = Math.min(5, cleanedName.length());
                namePrefix = cleanedName.substring(0, length);
            }
        }
        
        // Benzersiz kod oluştur
        String baseCode = categoryCode + "-" + namePrefix;
        String finalCode = baseCode;
        int counter = 1;
        
        while (productRepository.existsByCode(finalCode)) {
            finalCode = baseCode + "-" + counter;
            counter++;
            // Sonsuz döngüyü önlemek için maksimum deneme sayısı
            if (counter > 9999) {
                finalCode = baseCode + "-" + System.currentTimeMillis();
                break;
            }
        }
        
        return finalCode;
    }
    
    @Override
    public ProductDto updateProduct(Long id, UpdateProductDto updateDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + id));
        
        Category category = categoryRepository.findById(updateDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + updateDto.getCategoryId()));
        
        productMapper.updateEntity(product, updateDto);
        product.setCategory(category);
        
        if (updateDto.getSupplierIds() != null) {
            Set<Supplier> suppliers = new HashSet<>();
            for (Long supplierId : updateDto.getSupplierIds()) {
                Supplier supplier = supplierRepository.findById(supplierId)
                        .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı: " + supplierId));
                suppliers.add(supplier);
            }
            product.setSuppliers(suppliers);
        }
        
        product = productRepository.save(product);
        return productMapper.toDto(product);
    }
    
    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + id));
        
        // Ürünün kullanımda olup olmadığını kontrol et
        if (product.getPurchaseRequestItems() != null && !product.getPurchaseRequestItems().isEmpty()) {
            throw new ValidationException("Bu ürün satın alma taleplerinde kullanıldığı için silinemez");
        }
        
        productRepository.delete(product);
    }
    
    @Override
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + id));
        return productMapper.toDto(product);
    }
    
    @Override
    public ProductDto getProductByCode(String code) {
        Product product = productRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Ürün bulunamadı: " + code));
        return productMapper.toDto(product);
    }
    
    @Override
    public List<ProductDto> getAllProducts() {
        return productMapper.toDtoList(productRepository.findAll());
    }
    
    @Override
    public List<ProductDto> getActiveProducts() {
        return productMapper.toDtoList(productRepository.findByIsActiveTrue());
    }
    
    @Override
    public List<ProductDto> getProductsByCategory(Long categoryId) {
        return productMapper.toDtoList(productRepository.findByCategoryIdAndIsActiveTrue(categoryId));
    }
    
    @Override
    public List<ProductDto> getProductsBySupplier(Long supplierId) {
        return productMapper.toDtoList(productRepository.findBySuppliersIdAndIsActiveTrue(supplierId));
    }
    
    @Override
    public List<ProductDto> searchProducts(String name) {
        return productMapper.toDtoList(productRepository.findByIsActiveTrueAndNameContainingIgnoreCase(name));
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
} 