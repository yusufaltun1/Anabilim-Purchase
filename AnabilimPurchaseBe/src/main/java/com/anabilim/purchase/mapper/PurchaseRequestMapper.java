package com.anabilim.purchase.mapper;

import com.anabilim.purchase.dto.request.CreatePurchaseRequestDto;
import com.anabilim.purchase.dto.request.UpdatePurchaseRequestItemsDto;
import com.anabilim.purchase.dto.response.PurchaseRequestApprovalDto;
import com.anabilim.purchase.dto.response.PurchaseRequestDto;
import com.anabilim.purchase.dto.response.PurchaseRequestItemDto;
import com.anabilim.purchase.entity.*;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.repository.ProductRepository;
import com.anabilim.purchase.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PurchaseRequestMapper {
    
    private final UserMapper userMapper;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    
    public PurchaseRequest toEntity(CreatePurchaseRequestDto createDto, User requester) {
        PurchaseRequest request = new PurchaseRequest();
        request.setTitle(createDto.getTitle());
        request.setDescription(createDto.getDescription());
        request.setRequester(requester);
        
        if (createDto.getItems() != null && !createDto.getItems().isEmpty()) {
            List<PurchaseRequestItem> items = createDto.getItems().stream()
                    .map(itemDto -> {
                        PurchaseRequestItem item = new PurchaseRequestItem();
                        item.setPurchaseRequest(request);
                        item.setQuantity(itemDto.getQuantity());
                        item.setEstimatedDeliveryDate(itemDto.getEstimatedDeliveryDate());
                        item.setNotes(itemDto.getNotes());
                        
                        // Ürün bilgileri
                        item.setProductName(itemDto.getProductName());
                        item.setDescription(itemDto.getDescription());
                        item.setImageBase64(itemDto.getImageBase64());
                        item.setProductLink(itemDto.getProductLink());
                        
                        if (itemDto.getPotentialSupplierIds() != null && !itemDto.getPotentialSupplierIds().isEmpty()) {
                            // Önce Set'i temizle
                            item.getPotentialSuppliers().clear();
                            item.getSupplierQuotes().clear();
                            
                            // Sonra tedarikçileri ekle
                            itemDto.getPotentialSupplierIds().stream()
                                    .map(id -> supplierRepository.findById(id)
                                            .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı: " + id)))
                                    .forEach(item::addPotentialSupplier);
                        }
                        
                        return item;
                    })
                    .collect(Collectors.toList());
            request.setItems(new HashSet<>(items));
        }
        
        return request;
    }
    
    public List<PurchaseRequestItem> toItemEntityList(List<UpdatePurchaseRequestItemsDto.PurchaseRequestItemDto> itemDtos) {
        return itemDtos.stream()
                .map(this::toItemEntity)
                .collect(Collectors.toList());
    }
    
    public PurchaseRequestItem toItemEntity(UpdatePurchaseRequestItemsDto.PurchaseRequestItemDto itemDto) {
        PurchaseRequestItem item = new PurchaseRequestItem();
        item.setQuantity(itemDto.getQuantity());
        item.setSelectedSupplierId(itemDto.getSelectedSupplierId());
        item.setEstimatedDeliveryDate(itemDto.getEstimatedDeliveryDate());
        item.setNotes(itemDto.getNotes());
        
        // Ürün bilgileri
        item.setProductName(itemDto.getProductName());
        item.setDescription(itemDto.getDescription());
        item.setImageBase64(itemDto.getImageBase64());
        item.setProductLink(itemDto.getProductLink());

        if(itemDto.getProductId() != null) {
            item.setProduct(productRepository.findById(itemDto.getProductId()).get());
        }

        if (itemDto.getPotentialSupplierIds() != null && !itemDto.getPotentialSupplierIds().isEmpty()) {
            // Önce Set'i temizle
            item.getPotentialSuppliers().clear();
            item.getSupplierQuotes().clear();


            for (Long potentialSupplierId : itemDto.getPotentialSupplierIds()) {
                Supplier s = supplierRepository.findById(potentialSupplierId).get();
                item.addPotentialSupplier(s);
            }
        }
        
        return item;
    }
    
    public PurchaseRequestDto toDto(PurchaseRequest request) {
        if (request == null) {
            return null;
        }
        
        PurchaseRequestDto dto = new PurchaseRequestDto();
        dto.setId(request.getId());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setRequester(userMapper.toUserManagerDto(request.getRequester()));
        dto.setStatus(request.getStatus());
        dto.setApprovals(toApprovalDtoList(request.getApprovals()));
        dto.setItems(toItemDtoList(request.getItems()));
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        dto.setCompletedAt(request.getCompletedAt());
        dto.setCancelledAt(request.getCancelledAt());
        dto.setRejectionReason(request.getRejectionReason());
        return dto;
    }
    
    public List<PurchaseRequestDto> toDtoList(List<PurchaseRequest> requests) {
        return requests.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public PurchaseRequestApprovalDto toApprovalDto(PurchaseRequestApproval approval) {
        if (approval == null) {
            return null;
        }
        
        PurchaseRequestApprovalDto dto = new PurchaseRequestApprovalDto();
        dto.setId(approval.getId());
        dto.setApprover(userMapper.toUserManagerDto(approval.getApprover()));
        dto.setRoleName(approval.getRoleName());
        dto.setStepOrder(approval.getStepOrder());
        dto.setStatus(approval.getStatus());
        dto.setComment(approval.getComment());
        dto.setCreatedAt(approval.getCreatedAt());
        dto.setUpdatedAt(approval.getUpdatedAt());
        dto.setActionTakenAt(approval.getActionTakenAt());
        return dto;
    }
    
    public List<PurchaseRequestApprovalDto> toApprovalDtoList(List<PurchaseRequestApproval> approvals) {
        return approvals.stream()
                .map(this::toApprovalDto)
                .collect(Collectors.toList());
    }
    
    public PurchaseRequestItemDto toItemDto(PurchaseRequestItem item) {
        if (item == null) {
            return null;
        }
        
        PurchaseRequestItemDto dto = new PurchaseRequestItemDto();
        dto.setId(item.getId());
        dto.setPotentialSuppliers(item.getPotentialSuppliers().stream()
                .map(this::toSupplierDto)
                .collect(Collectors.toSet()));
        dto.setSupplierQuotes(item.getSupplierQuotes().stream()
                .map(this::toSupplierQuoteDto)
                .collect(Collectors.toSet()));
        dto.setSelectedSupplierId(item.getSelectedSupplierId());
        dto.setQuantity(item.getQuantity());
        dto.setEstimatedDeliveryDate(item.getEstimatedDeliveryDate());
        dto.setNotes(item.getNotes());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        
        // Ürün bilgileri
        dto.setProductName(item.getProductName());
        dto.setDescription(item.getDescription());
        dto.setImageBase64(item.getImageBase64());
        dto.setProductLink(item.getProductLink());

        if(item.getProduct() != null)
        {
            dto.setProductId(item.getProduct().getId());
        }
        return dto;
    }
    
    public List<PurchaseRequestItemDto> toItemDtoList(Set<PurchaseRequestItem> items) {
        return items.stream()
                .map(this::toItemDto)
                .collect(Collectors.toList());
    }
    
    // ProductDto artık gerekli değil çünkü product bilgileri request içinde saklanıyor
    
    private PurchaseRequestItemDto.SupplierDto toSupplierDto(Supplier supplier) {
        return new PurchaseRequestItemDto.SupplierDto(
                supplier.getId(),
                supplier.getName(),
                supplier.getTaxNumber(),
                supplier.getContactPerson(),
                supplier.getContactPhone(),
                supplier.getContactEmail()
        );
    }
    
    private PurchaseRequestItemDto.SupplierQuoteDto toSupplierQuoteDto(SupplierQuote quote) {
        return new PurchaseRequestItemDto.SupplierQuoteDto(
            quote.getId(),
            quote.getQuoteUid(),
            quote.getQuoteNumber(),
            quote.getUnitPrice(),
            quote.getQuantity(),
            quote.getTotalPrice(),
            quote.getCurrency(),
            quote.getDeliveryDate(),
            quote.getQuoteDate(),
            quote.getValidityDate(),
            quote.getNotes(),
            quote.getSupplierReference(),
            quote.getStatus(),
            quote.getRejectionReason(),
            quote.getIsSelected(),
            quote.getCreatedAt(),
            quote.getUpdatedAt(),
            quote.getRespondedAt(),
            toSupplierDto(quote.getSupplier()),
            quote.getCounterOfferUnitPrice(),
            quote.getCounterOfferQuantity(),
            quote.getCounterOfferEnteredAt()
        );
    }
} 