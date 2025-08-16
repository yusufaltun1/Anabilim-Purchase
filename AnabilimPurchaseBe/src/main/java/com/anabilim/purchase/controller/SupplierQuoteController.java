package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.request.UpdateSupplierQuoteDto;
import com.anabilim.purchase.dto.response.SupplierQuoteDto;
import com.anabilim.purchase.service.SupplierQuoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier-quotes")
@RequiredArgsConstructor
public class SupplierQuoteController {
    
    private final SupplierQuoteService supplierQuoteService;
    
    @GetMapping("/{quoteUid}")
    public ResponseEntity<SupplierQuoteDto> getQuoteByUid(@PathVariable String quoteUid) {
        return ResponseEntity.ok(supplierQuoteService.getQuoteByUid(quoteUid));
    }
    
    @PutMapping("/{quoteUid}")
    public ResponseEntity<SupplierQuoteDto> updateQuote(
            @PathVariable String quoteUid,
            @Valid @RequestBody UpdateSupplierQuoteDto updateDto) {
        return ResponseEntity.ok(supplierQuoteService.updateQuote(quoteUid, updateDto));
    }
    
    @GetMapping("/request-item/{requestItemId}")
    public ResponseEntity<List<SupplierQuoteDto>> getQuotesByRequestItem(@PathVariable Long requestItemId) {
        return ResponseEntity.ok(supplierQuoteService.getQuotesByRequestItem(requestItemId));
    }
    
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<SupplierQuoteDto>> getQuotesBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(supplierQuoteService.getQuotesBySupplier(supplierId));
    }
} 