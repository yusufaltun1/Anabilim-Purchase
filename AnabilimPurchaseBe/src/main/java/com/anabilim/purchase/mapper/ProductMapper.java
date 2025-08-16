package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreateProductDto;
import com.anabilim.purchase.dto.request.UpdateProductDto;
import com.anabilim.purchase.dto.response.CategoryDto;
import com.anabilim.purchase.dto.response.ProductDto;
import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.Supplier;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {
    
    public Product toEntity(CreateProductDto createDto) {
        Product product = new Product();
        product.setName(createDto.getName());
        product.setCode(createDto.getCode());
        product.setDescription(createDto.getDescription());
        product.setProductType(createDto.getProductType());
        product.setUnitOfMeasure(createDto.getUnitOfMeasure());
        product.setMinQuantity(createDto.getMinQuantity());
        product.setMaxQuantity(createDto.getMaxQuantity());
        product.setEstimatedUnitPrice(createDto.getEstimatedUnitPrice());
        product.setCurrency(createDto.getCurrency());
        return product;
    }
    
    public void updateEntity(Product product, UpdateProductDto updateDto) {
        product.setName(updateDto.getName());
        product.setDescription(updateDto.getDescription());
        product.setProductType(updateDto.getProductType());
        product.setUnitOfMeasure(updateDto.getUnitOfMeasure());
        product.setMinQuantity(updateDto.getMinQuantity());
        product.setMaxQuantity(updateDto.getMaxQuantity());
        product.setEstimatedUnitPrice(updateDto.getEstimatedUnitPrice());
        product.setCurrency(updateDto.getCurrency());
        product.setActive(updateDto.isActive());
    }
    
    public ProductDto toDto(Product product) {
        if (product == null) {
            return null;
        }
        
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setCode(product.getCode());
        dto.setDescription(product.getDescription());
        
        if (product.getCategory() != null) {
            dto.setCategory(new CategoryDto.CategoryBasicDto(
                    product.getCategory().getId(),
                    product.getCategory().getName(),
                    product.getCategory().getCode()
            ));
        }
        
        dto.setProductType(product.getProductType() != null ? product.getProductType().getDisplayName() : null);
        dto.setUnit(product.getUnitOfMeasure().getDisplayName());
        dto.setMinQuantity(product.getMinQuantity());
        dto.setMaxQuantity(product.getMaxQuantity());
        dto.setEstimatedUnitPrice(product.getEstimatedUnitPrice());
        
        if (product.getSuppliers() != null) {
            dto.setSuppliers(product.getSuppliers().stream()
                    .map(this::toSupplierBasicDto)
                    .collect(Collectors.toSet()));
        }
        
        dto.setActive(product.isActive());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        
        return dto;
    }
    
    public List<ProductDto> toDtoList(List<Product> products) {
        return products.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    private ProductDto.SupplierBasicDto toSupplierBasicDto(Supplier supplier) {
        return new ProductDto.SupplierBasicDto(
                supplier.getId(),
                supplier.getName(),
                supplier.getTaxNumber()
        );
    }
} 