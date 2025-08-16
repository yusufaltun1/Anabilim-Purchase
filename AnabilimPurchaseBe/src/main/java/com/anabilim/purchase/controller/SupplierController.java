package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.request.CreateSupplierDto;
import com.anabilim.purchase.dto.request.UpdateSupplierDto;
import com.anabilim.purchase.dto.response.SupplierDto;
import com.anabilim.purchase.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<SupplierDto> createSupplier(@Valid @RequestBody CreateSupplierDto createSupplierDto) {
        return new ResponseEntity<>(supplierService.createSupplier(createSupplierDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierDto> updateSupplier(@PathVariable Long id, 
                                                     @Valid @RequestBody UpdateSupplierDto updateSupplierDto) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, updateSupplierDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDto> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @GetMapping("/tax-number/{taxNumber}")
    public ResponseEntity<SupplierDto> getSupplierByTaxNumber(@PathVariable String taxNumber) {
        return ResponseEntity.ok(supplierService.getSupplierByTaxNumber(taxNumber));
    }

    @GetMapping
    public ResponseEntity<List<SupplierDto>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SupplierDto>> getAllActiveSuppliers() {
        return ResponseEntity.ok(supplierService.getAllActiveSuppliers());
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<SupplierDto>> getSuppliersByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(supplierService.getSuppliersByCategory(categoryId));
    }
} 