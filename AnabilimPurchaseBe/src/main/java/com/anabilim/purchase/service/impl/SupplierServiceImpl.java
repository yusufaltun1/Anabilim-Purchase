package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreateSupplierDto;
import com.anabilim.purchase.dto.request.UpdateSupplierDto;
import com.anabilim.purchase.dto.response.SupplierDto;
import com.anabilim.purchase.entity.Category;
import com.anabilim.purchase.entity.Supplier;
import com.anabilim.purchase.exception.ResourceAlreadyExistsException;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.mapper.SupplierMapper;
import com.anabilim.purchase.repository.CategoryRepository;
import com.anabilim.purchase.repository.SupplierRepository;
import com.anabilim.purchase.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierMapper supplierMapper;

    @Override
    public SupplierDto createSupplier(CreateSupplierDto createSupplierDto) {
        if (supplierRepository.existsByTaxNumber(createSupplierDto.getTaxNumber())) {
            throw new ResourceAlreadyExistsException("Bu vergi numarası ile kayıtlı tedarikçi bulunmaktadır");
        }

        Supplier supplier = supplierMapper.toEntity(createSupplierDto);
        supplier = supplierRepository.save(supplier);
        
        return supplierMapper.toDto(supplier);
    }

    @Override
    public SupplierDto updateSupplier(Long id, UpdateSupplierDto updateSupplierDto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı"));

        if (supplierRepository.existsByTaxNumberAndIdNot(supplier.getTaxNumber(), id)) {
            throw new ResourceAlreadyExistsException("Bu vergi numarası ile kayıtlı başka bir tedarikçi bulunmaktadır");
        }

        supplierMapper.updateEntity(updateSupplierDto, supplier);
        supplier = supplierRepository.save(supplier);
        
        return supplierMapper.toDto(supplier);
    }

    @Override
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı"));
                
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .map(supplierMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı"));
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierDto getSupplierByTaxNumber(String taxNumber) {
        return supplierRepository.findByTaxNumber(taxNumber)
                .map(supplierMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDto> getAllSuppliers() {
        return supplierMapper.toDtoList(supplierRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDto> getAllActiveSuppliers() {
        return supplierMapper.toDtoList(supplierRepository.findAllByIsActiveTrue());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDto> getSuppliersByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori bulunamadı: " + categoryId));
        
        List<Supplier> suppliers = supplierRepository.findByCategoriesContaining(category);
        return supplierMapper.toDtoList(suppliers);
    }
} 