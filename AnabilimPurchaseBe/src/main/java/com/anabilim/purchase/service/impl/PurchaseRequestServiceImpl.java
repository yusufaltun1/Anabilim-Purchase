package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.ApprovePurchaseRequestDto;
import com.anabilim.purchase.dto.request.CreatePurchaseRequestDto;
import com.anabilim.purchase.dto.request.UpdatePurchaseRequestDto;
import com.anabilim.purchase.dto.request.UpdatePurchaseRequestItemsDto;
import com.anabilim.purchase.dto.response.PurchaseRequestDto;
import com.anabilim.purchase.entity.*;
import com.anabilim.purchase.entity.enums.ApprovalStatus;
import com.anabilim.purchase.entity.enums.RequestStatus;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.mapper.PurchaseRequestMapper;
import com.anabilim.purchase.repository.*;
import com.anabilim.purchase.service.NotificationService;
import com.anabilim.purchase.service.PurchaseRequestService;
import com.anabilim.purchase.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PurchaseRequestServiceImpl implements PurchaseRequestService {
    
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseRequestApprovalRepository approvalRepository;
    private final UserRepository userRepository;
    private final PurchaseRequestMapper purchaseRequestMapper;
    private final SupplierQuoteRepository supplierQuoteRepository;
    private final NotificationService notificationService;
    private final SupplierRepository supplierRepository; // Supplier'ı bulmak için eklendi
    private final PurchaseRequestApprovalRepository purchaseRequestApprovalRepository;
    private final ProductRepository productRepository;

    @Override
    public PurchaseRequestDto createPurchaseRequest(CreatePurchaseRequestDto createDto, String requesterEmail) {
        User requester = userRepository.findByEmailAndIsActiveTrue(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + requesterEmail));
        
        PurchaseRequest request = purchaseRequestMapper.toEntity(createDto, requester);
        
        createInitialApprovalStep(request, requester);
        
        final PurchaseRequest savedRequest = purchaseRequestRepository.save(request);
        
        savedRequest.getApprovals().stream()
            .filter(approval -> approval.getStatus() == ApprovalStatus.PENDING)
            .findFirst()
            .ifPresent(approval -> {
                String message = String.format("'%s' başlıklı yeni bir satın alma talebi onayınızı bekliyor.", savedRequest.getTitle());
                notificationService.createNotification(approval.getApprover(), message, savedRequest);
            });
            
        return purchaseRequestMapper.toDto(savedRequest);
    }
    
    private void createInitialApprovalStep(PurchaseRequest request, User requester) {
        User manager = requester.getManager();
        if (manager == null) {
            throw new ValidationException("Kullanıcının bir yöneticisi atanmamış. Talep oluşturulamaz.");
        }
        
        PurchaseRequestApproval approval = new PurchaseRequestApproval();
        approval.setPurchaseRequest(request);
        approval.setApprover(manager);
        approval.setRoleName("MANAGER");
        approval.setRequiredRole("MANAGER");
        approval.setStepOrder(1);
        approval.setStatus(ApprovalStatus.PENDING);
        
        // Mevcut collection'ı kullan (yeni ArrayList oluşturma - Hibernate referansını korumak için)
        if (request.getApprovals() == null) {
            request.setApprovals(new ArrayList<>());
        }
        request.getApprovals().add(approval);
        request.setStatus(RequestStatus.IN_APPROVAL);
    }

    @Override
    @Transactional
    public PurchaseRequestDto approvePurchaseRequest(Long id, String approverEmail, ApprovePurchaseRequestDto approveDto) {
        PurchaseRequest request = validateAndGetRequest(id);
        User approver = validateAndGetUser(approverEmail);

        PurchaseRequestApproval currentApproval = approvalRepository
                .findFirstByPurchaseRequestAndStatusOrderByStepOrderAsc(request, ApprovalStatus.PENDING)
                .orElseThrow(() -> new ValidationException("Onaylanacak aktif bir adım bulunamadı."));

        currentApproval.setStatus(ApprovalStatus.APPROVED);
        currentApproval.setComment(approveDto.getComment());
        currentApproval.setActionTakenAt(LocalDateTime.now());
        approvalRepository.save(currentApproval);
        
        String intermediateMessage = String.format("'%s' başlıklı talebiniz %s tarafından onaylandı ve bir sonraki adıma geçti.", request.getTitle(), approver.getFirstName());
        notificationService.createNotification(request.getRequester(), intermediateMessage, request);

        User nextApprover = currentApproval.getApprover().getManager();

        if (nextApprover != null) {
            PurchaseRequestApproval nextApproval = new PurchaseRequestApproval();
            nextApproval.setPurchaseRequest(request);
            nextApproval.setApprover(nextApprover);
            nextApproval.setRoleName("MANAGER");
            nextApproval.setRequiredRole("MANAGER");
            nextApproval.setStepOrder(currentApproval.getStepOrder() + 1);
            nextApproval.setStatus(ApprovalStatus.PENDING);
            approvalRepository.save(nextApproval);

            request.setStatus(RequestStatus.IN_APPROVAL);
            
            String nextApproverMessage = String.format("'%s' başlıklı satın alma talebi onayınızı bekliyor.", request.getTitle());
            notificationService.createNotification(nextApprover, nextApproverMessage, request);
            
        } else {
            request.setStatus(RequestStatus.APPROVED);
            request.setCompletedAt(LocalDateTime.now());
            
            String finalMessage = String.format("'%s' başlıklı talebiniz tamamen onaylandı.", request.getTitle());
            notificationService.createNotification(request.getRequester(), finalMessage, request);
        }

        PurchaseRequest updatedRequest = purchaseRequestRepository.save(request);
        return purchaseRequestMapper.toDto(updatedRequest);
    }
    
    @Override
    public PurchaseRequestDto rejectPurchaseRequest(Long id, String approverEmail, ApprovePurchaseRequestDto rejectDto) {
        PurchaseRequest request = validateAndGetRequest(id);
        User approver = validateAndGetUser(approverEmail);
        
        Optional<PurchaseRequestApproval> currentApprovalOpt = approvalRepository
                .findFirstByPurchaseRequestAndStatusOrderByStepOrderAsc(request, ApprovalStatus.PENDING);
        
        if (currentApprovalOpt.isEmpty()) {
            throw new ValidationException("Reddedilecek adım bulunamadı.");
        }
        
        PurchaseRequestApproval currentApproval = currentApprovalOpt.get();
        currentApproval.setStatus(ApprovalStatus.REJECTED);
        currentApproval.setComment(rejectDto.getComment());
        currentApproval.setActionTakenAt(LocalDateTime.now());
        approvalRepository.save(currentApproval);
        
        request.setStatus(RequestStatus.REJECTED);
        request.setRejectionReason(rejectDto.getRejectionReason());
        request = purchaseRequestRepository.save(request);
        
        String message = String.format("'%s' başlıklı talebiniz %s tarafından reddedildi. Sebep: %s", request.getTitle(), approver.getFirstName(), rejectDto.getRejectionReason());
        notificationService.createNotification(request.getRequester(), message, request);
        
        return purchaseRequestMapper.toDto(request);
    }
    
    @Override
    @Transactional
    public PurchaseRequestDto updatePurchaseRequestItems(Long id, UpdatePurchaseRequestItemsDto itemsDto) {
        PurchaseRequest request = validateAndGetRequest(id);

        request.getItems().forEach(item -> {
            supplierQuoteRepository.deleteAll(item.getSupplierQuotes());
            item.getSupplierQuotes().clear();
            item.getPotentialSuppliers().clear();
        });
        request.getItems().clear();
        
        List<PurchaseRequestItem> newItems = purchaseRequestMapper.toItemEntityList(itemsDto.getItems());
        for (PurchaseRequestItem item : newItems) {
            item.setPurchaseRequest(request);
            Product p = new Product();
            p.setId(item.getProduct().getId());
            item.setProduct(p);
            // Teklif seçimi bildirimi
            if (item.getSelectedSupplierId() != null) {
                Supplier selectedSupplier = supplierRepository.findById(item.getSelectedSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Seçilen tedarikçi bulunamadı: " + item.getSelectedSupplierId()));
                
                String message = String.format("'%s' talebinizdeki '%s' ürünü için '%s' firmasının teklifi seçildi.", 
                    request.getTitle(), item.getProductName(), selectedSupplier.getName());
                notificationService.createNotification(request.getRequester(), message, request);
            }
            
            request.getItems().add(item);
        }
        
        request.setStatus(RequestStatus.IN_PROGRESS);
        request = purchaseRequestRepository.save(request);
        
        return purchaseRequestMapper.toDto(request);
    }
    
    @Override
    public PurchaseRequestDto getPurchaseRequestById(Long id) {
        PurchaseRequest request = purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Satın alma talebi bulunamadı: " + id));
        return purchaseRequestMapper.toDto(request);
    }
    
    @Override
    public List<PurchaseRequestDto> getAllPurchaseRequests() {
        return purchaseRequestMapper.toDtoList(purchaseRequestRepository.findAll());
    }
    
    @Override
    public void deletePurchaseRequest(Long id) {
        if (!purchaseRequestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Satın alma talebi bulunamadı: " + id);
        }
        purchaseRequestRepository.deleteById(id);
    }
    
    @Override
    public List<PurchaseRequestDto> getPurchaseRequestsByStatus(RequestStatus status) {
        return purchaseRequestMapper.toDtoList(purchaseRequestRepository.findByStatus(status));
    }
    
    @Override
    public List<PurchaseRequestDto> getPurchaseRequestsByRequester(String requesterEmail) {
        User requester = userRepository.findByEmailAndIsActiveTrue(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + requesterEmail));
        return purchaseRequestMapper.toDtoList(purchaseRequestRepository.findByRequester(requester));
    }
    
    @Override
    public List<PurchaseRequestDto> getPurchaseRequestsByRequesterAndStatus(String requesterEmail, RequestStatus status) {
        User requester = userRepository.findByEmailAndIsActiveTrue(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + requesterEmail));
        return purchaseRequestMapper.toDtoList(purchaseRequestRepository.findByRequesterAndStatus(requester, status));
    }
    
    @Override
    public List<PurchaseRequestDto> getPendingApprovalsForUser(String approverEmail) {
        User approver = validateAndGetUser(approverEmail);

        List<PurchaseRequestApproval> approvals = purchaseRequestApprovalRepository.findByApproverAndStatus(approver, ApprovalStatus.PENDING);
        List<PurchaseRequest> requests = approvals.stream().map(PurchaseRequestApproval::getPurchaseRequest).collect(Collectors.toCollection(ArrayList::new));
        return purchaseRequestMapper.toDtoList(requests);
    }
    
    @Override
    public PurchaseRequestDto cancelPurchaseRequest(Long id, String requesterEmail, String reason) {
        PurchaseRequest request = validateAndGetRequest(id);
        
        if (!request.isActive()) {
            throw new ValidationException("Bu talep zaten tamamlanmış, reddedilmiş veya iptal edilmiş.");
        }
        
        request.setStatus(RequestStatus.CANCELLED);
        request.setCancelledAt(LocalDateTime.now());
        request = purchaseRequestRepository.save(request);
        
        return purchaseRequestMapper.toDto(request);
    }
    
    @Override
    public boolean canUserApprovePurchaseRequest(Long requestId, String userEmail) {
        PurchaseRequest request = validateAndGetRequest(requestId);
        User user = validateAndGetUser(userEmail);
        
        return request.getApprovals().stream()
                .anyMatch(approval -> approval.getStatus() == ApprovalStatus.PENDING &&
                        approval.getApprover().getId().equals(user.getId()));
    }
    
    @Override
    public boolean isUserRequester(Long requestId, String userEmail) {
        PurchaseRequest request = validateAndGetRequest(requestId);
        User user = validateAndGetUser(userEmail);
        
        return request.getRequester().getId().equals(user.getId());
    }
    
    @Override
    public void validatePurchaseRequest(Long id) {
        if (!purchaseRequestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Satın alma talebi bulunamadı: " + id);
        }
    }
    
    private PurchaseRequest validateAndGetRequest(Long id) {
        return purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Satın alma talebi bulunamadı: " + id));
    }
    
    @Override
    @Transactional
    public PurchaseRequestDto resubmitPurchaseRequest(Long id, String requesterEmail) {
        PurchaseRequest request = validateAndGetRequest(id);
        User requester = validateAndGetUser(requesterEmail);
        
        // Sadece talep sahibi tekrar gönderebilir
        if (!request.getRequester().getId().equals(requester.getId())) {
            throw new ValidationException("Bu talebi sadece talep sahibi tekrar gönderebilir.");
        }
        
        // Sadece reddedilmiş talepler tekrar gönderilebilir
        if (request.getStatus() != RequestStatus.REJECTED) {
            throw new ValidationException("Sadece reddedilmiş talepler tekrar gönderilebilir.");
        }
        
        // Eski approval'ları repository üzerinden sil (orphan removal sorununu önlemek için)
        List<PurchaseRequestApproval> existingApprovals = approvalRepository.findByPurchaseRequest(request);
        if (!existingApprovals.isEmpty()) {
            approvalRepository.deleteAll(existingApprovals);
        }
        
        // Entity'yi yeniden yükle ve collection'ı temizle
        purchaseRequestRepository.flush();
        request = purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Satın alma talebi bulunamadı: " + id));
        
        // Collection'ı temizle (artık boş olmalı)
        if (request.getApprovals() != null) {
            request.getApprovals().clear();
        }
        
        // Rejection reason'ı temizle
        request.setRejectionReason(null);
        
        // Yeni approval step'i oluştur
        createInitialApprovalStep(request, requester);
        
        PurchaseRequest savedRequest = purchaseRequestRepository.save(request);
        
        // İlk onaylayıcıya bildirim gönder
        savedRequest.getApprovals().stream()
            .filter(approval -> approval.getStatus() == ApprovalStatus.PENDING)
            .findFirst()
            .ifPresent(approval -> {
                String message = String.format("'%s' başlıklı satın alma talebi tekrar onayınızı bekliyor.", savedRequest.getTitle());
                notificationService.createNotification(approval.getApprover(), message, savedRequest);
            });
        
        // Talep sahibine bildirim gönder
        String requesterMessage = String.format("'%s' başlıklı talebiniz tekrar onay sürecine gönderildi.", savedRequest.getTitle());
        notificationService.createNotification(requester, requesterMessage, savedRequest);
        
        return purchaseRequestMapper.toDto(savedRequest);
    }
    
    @Override
    @Transactional
    public PurchaseRequestDto updatePurchaseRequest(Long id, UpdatePurchaseRequestDto updateDto, String requesterEmail) {
        PurchaseRequest request = validateAndGetRequest(id);
        User requester = validateAndGetUser(requesterEmail);
        
        // Sadece talep sahibi güncelleyebilir
        if (!request.getRequester().getId().equals(requester.getId())) {
            throw new ValidationException("Bu talebi sadece talep sahibi güncelleyebilir.");
        }
        
        // Sadece reddedilmiş talepler güncellenebilir
        if (request.getStatus() != RequestStatus.REJECTED) {
            throw new ValidationException("Sadece reddedilmiş talepler güncellenebilir.");
        }
        
        // Title ve description güncelle
        request.setTitle(updateDto.getTitle());
        request.setDescription(updateDto.getDescription());
        
        // Items'ı güncelle
        request.getItems().forEach(item -> {
            supplierQuoteRepository.deleteAll(item.getSupplierQuotes());
            item.getSupplierQuotes().clear();
            item.getPotentialSuppliers().clear();
        });
        request.getItems().clear();
        
        // Yeni items'ı ekle
        for (UpdatePurchaseRequestDto.UpdatePurchaseRequestItemDto itemDto : updateDto.getItems()) {
            PurchaseRequestItem item = new PurchaseRequestItem();
            item.setPurchaseRequest(request);
            item.setProductName(itemDto.getProductName());
            item.setDescription(itemDto.getDescription());
            item.setImageBase64(itemDto.getImageBase64());
            item.setProductLink(itemDto.getProductLink());
            item.setQuantity(itemDto.getQuantity());
            item.setNotes(itemDto.getNotes());
            item.setEstimatedDeliveryDate(itemDto.getEstimatedDeliveryDate());
            
            if (itemDto.getProductId() != null) {
                Product product = productRepository.findById(itemDto.getProductId())
                    .orElse(null);
                item.setProduct(product);
            }
            
            if (itemDto.getPotentialSupplierIds() != null && !itemDto.getPotentialSupplierIds().isEmpty()) {
                for (Long supplierId : itemDto.getPotentialSupplierIds()) {
                    Supplier supplier = supplierRepository.findById(supplierId)
                        .orElseThrow(() -> new ResourceNotFoundException("Tedarikçi bulunamadı: " + supplierId));
                    item.getPotentialSuppliers().add(supplier);
                }
            }
            
            request.getItems().add(item);
        }
        
        PurchaseRequest updatedRequest = purchaseRequestRepository.save(request);
        return purchaseRequestMapper.toDto(updatedRequest);
    }
    
    private User validateAndGetUser(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + email));
    }
}
