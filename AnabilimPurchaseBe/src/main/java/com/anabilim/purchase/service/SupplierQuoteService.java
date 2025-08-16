package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.UpdateSupplierQuoteDto;
import com.anabilim.purchase.dto.response.SupplierQuoteDto;

import java.util.List;

public interface SupplierQuoteService {
    
    SupplierQuoteDto getQuoteByUid(String quoteUid);
    
    SupplierQuoteDto updateQuote(String quoteUid, UpdateSupplierQuoteDto updateDto);
    
    List<SupplierQuoteDto> getQuotesByRequestItem(Long requestItemId);
    
    List<SupplierQuoteDto> getQuotesBySupplier(Long supplierId);
} 