package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.CreateProductDto;
import com.anabilim.purchase.dto.request.UpdateProductDto;
import com.anabilim.purchase.dto.response.ProductDto;

import java.util.List;

public interface ProductService {
    ProductDto createProduct(CreateProductDto createDto);
    ProductDto updateProduct(Long id, UpdateProductDto updateDto);
    void deleteProduct(Long id);
    ProductDto getProductById(Long id);
    ProductDto getProductByCode(String code);
    List<ProductDto> getAllProducts();
    List<ProductDto> getActiveProducts();
    List<ProductDto> getProductsByCategory(Long categoryId);
    List<ProductDto> getProductsBySupplier(Long supplierId);
    List<ProductDto> searchProducts(String name);
    void addSupplier(Long productId, Long supplierId);
    void removeSupplier(Long productId, Long supplierId);
} 