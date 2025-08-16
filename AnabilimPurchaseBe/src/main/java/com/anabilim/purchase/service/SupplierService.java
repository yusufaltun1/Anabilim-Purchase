package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.CreateSupplierDto;
import com.anabilim.purchase.dto.request.UpdateSupplierDto;
import com.anabilim.purchase.dto.response.SupplierDto;

import java.util.List;

public interface SupplierService {
    SupplierDto createSupplier(CreateSupplierDto createSupplierDto);
    SupplierDto updateSupplier(Long id, UpdateSupplierDto updateSupplierDto);
    void deleteSupplier(Long id);
    SupplierDto getSupplierById(Long id);
    SupplierDto getSupplierByTaxNumber(String taxNumber);
    List<SupplierDto> getAllSuppliers();
    List<SupplierDto> getAllActiveSuppliers();
    List<SupplierDto> getSuppliersByCategory(Long categoryId);
} 