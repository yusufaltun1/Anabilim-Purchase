package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.UpdateSupplierQuoteDto;
import com.anabilim.purchase.dto.response.SupplierQuoteDto;
import com.anabilim.purchase.entity.PurchaseRequestItem;
import com.anabilim.purchase.entity.Supplier;
import com.anabilim.purchase.entity.SupplierQuote;
import com.anabilim.purchase.entity.enums.QuoteStatus;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.repository.PurchaseRequestItemRepository;
import com.anabilim.purchase.repository.SupplierQuoteRepository;
import com.anabilim.purchase.repository.SupplierRepository;
import com.anabilim.purchase.service.SupplierQuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierQuoteServiceImpl implements SupplierQuoteService {
    
    private final SupplierQuoteRepository supplierQuoteRepository;
    private final PurchaseRequestItemRepository requestItemRepository;
    private final SupplierRepository supplierRepository;
    
    @Override
    public SupplierQuoteDto getQuoteByUid(String quoteUid) {
        return toDto(getQuoteEntityByUid(quoteUid));
    }
    
    @Override
    @Transactional
    public SupplierQuoteDto updateQuote(String quoteUid, UpdateSupplierQuoteDto updateDto) {
        SupplierQuote quote = getQuoteEntityByUid(quoteUid);
        
        // Ensure quote_number is set
        if (quote.getQuoteNumber() == null) {
            String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            int randomNum = 1000 + (int)(Math.random() * 9000);
            quote.setQuoteNumber(String.format("QT-%s-%04d", datePart, randomNum));
        }
        
        quote.setUnitPrice(updateDto.getUnitPrice());
        quote.setQuantity(updateDto.getQuantity());
        quote.setTotalPrice(updateDto.getUnitPrice().multiply(BigDecimal.valueOf(updateDto.getQuantity())));
        quote.setCurrency(updateDto.getCurrency());
        quote.setDeliveryDate(updateDto.getDeliveryDate());
        quote.setValidityDate(updateDto.getValidityDate());
        quote.setNotes(updateDto.getNotes());
        quote.setSupplierReference(updateDto.getSupplierReference());
        quote.setStatus(QuoteStatus.RESPONDED);
        quote.setRespondedAt(LocalDateTime.now());
        
        return toDto(supplierQuoteRepository.save(quote));
    }
    
    @Override
    public List<SupplierQuoteDto> getQuotesByRequestItem(Long requestItemId) {
        PurchaseRequestItem requestItem = requestItemRepository.findById(requestItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Talep kalemi bulunamadı: " + requestItemId));
        
        return supplierQuoteRepository.findByRequestItem(requestItem).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<SupplierQuoteDto> getQuotesBySupplier(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı: " + supplierId));
        
        return supplierQuoteRepository.findBySupplier(supplier).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    private SupplierQuote getQuoteEntityByUid(String quoteUid) {
        return supplierQuoteRepository.findByQuoteUid(quoteUid)
                .orElseThrow(() -> new ResourceNotFoundException("Teklif bulunamadı: " + quoteUid));
    }
    
    private SupplierQuoteDto toDto(SupplierQuote quote) {
        SupplierQuoteDto dto = new SupplierQuoteDto();
        dto.setId(quote.getId());
        dto.setQuoteUid(quote.getQuoteUid());
        dto.setRequestItemId(quote.getRequestItem().getId());
        
        // Product bilgileri
        SupplierQuoteDto.ProductDto productDto = new SupplierQuoteDto.ProductDto(
                quote.getRequestItem().getProduct().getId(),
                quote.getRequestItem().getProduct().getName(),
                quote.getRequestItem().getProduct().getCode(),
                quote.getRequestItem().getProduct().getDescription(),
                quote.getRequestItem().getProduct().getCategory().getName()
        );
        dto.setProduct(productDto);
        
        // Supplier bilgileri
        SupplierQuoteDto.SupplierDto supplierDto = new SupplierQuoteDto.SupplierDto(
                quote.getSupplier().getId(),
                quote.getSupplier().getName(),
                quote.getSupplier().getTaxNumber(),
                quote.getSupplier().getContactPerson(),
                quote.getSupplier().getContactPhone(),
                quote.getSupplier().getContactEmail()
        );
        dto.setSupplier(supplierDto);
        
        dto.setUnitPrice(quote.getUnitPrice());
        dto.setQuantity(quote.getQuantity());
        dto.setTotalPrice(quote.getTotalPrice());
        dto.setCurrency(quote.getCurrency());
        dto.setDeliveryDate(quote.getDeliveryDate());
        dto.setValidityDate(quote.getValidityDate());
        dto.setNotes(quote.getNotes());
        dto.setSupplierReference(quote.getSupplierReference());
        dto.setStatus(quote.getStatus());
        dto.setRejectionReason(quote.getRejectionReason());
        dto.setCreatedAt(quote.getCreatedAt());
        dto.setUpdatedAt(quote.getUpdatedAt());
        dto.setRespondedAt(quote.getRespondedAt());
        
        return dto;
    }
} 