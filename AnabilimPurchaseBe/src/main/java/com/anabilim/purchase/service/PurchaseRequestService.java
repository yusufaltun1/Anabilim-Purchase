package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.ApprovePurchaseRequestDto;
import com.anabilim.purchase.dto.request.CreatePurchaseRequestDto;
import com.anabilim.purchase.dto.request.UpdatePurchaseRequestItemsDto;
import com.anabilim.purchase.dto.response.PurchaseRequestDto;
import com.anabilim.purchase.entity.enums.RequestStatus;

import java.util.List;

public interface PurchaseRequestService {
    
    // Temel CRUD işlemleri
    PurchaseRequestDto createPurchaseRequest(CreatePurchaseRequestDto createDto, String requesterEmail);
    PurchaseRequestDto getPurchaseRequestById(Long id);
    List<PurchaseRequestDto> getAllPurchaseRequests();
    void deletePurchaseRequest(Long id);
    
    // Talep durumu ile ilgili işlemler
    List<PurchaseRequestDto> getPurchaseRequestsByStatus(RequestStatus status);
    List<PurchaseRequestDto> getPurchaseRequestsByRequester(String requesterEmail);
    List<PurchaseRequestDto> getPurchaseRequestsByRequesterAndStatus(String requesterEmail, RequestStatus status);
    
    // Onay işlemleri
    PurchaseRequestDto approvePurchaseRequest(Long id, String approverEmail, ApprovePurchaseRequestDto approveDto);
    PurchaseRequestDto rejectPurchaseRequest(Long id, String approverEmail, ApprovePurchaseRequestDto rejectDto);
    List<PurchaseRequestDto> getPendingApprovalsForUser(String approverEmail);
    
    // Ürün işlemleri
    PurchaseRequestDto updatePurchaseRequestItems(Long id, UpdatePurchaseRequestItemsDto itemsDto);
    
    // İptal işlemleri
    PurchaseRequestDto cancelPurchaseRequest(Long id, String requesterEmail, String reason);
    
    // Diğer işlemler
    boolean canUserApprovePurchaseRequest(Long requestId, String userEmail);
    boolean isUserRequester(Long requestId, String userEmail);
    void validatePurchaseRequest(Long id);
} 