package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.ApprovePurchaseRequestDto;
import com.anabilim.purchase.dto.request.CreatePurchaseRequestDto;
import com.anabilim.purchase.dto.request.UpdatePurchaseRequestItemsDto;
import com.anabilim.purchase.dto.response.PurchaseRequestDto;
import com.anabilim.purchase.entity.PurchaseRequest;
import com.anabilim.purchase.entity.PurchaseRequestApproval;
import com.anabilim.purchase.entity.PurchaseRequestItem;
import com.anabilim.purchase.entity.Supplier;
import com.anabilim.purchase.entity.SupplierQuote;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.entity.enums.ApprovalStatus;
import com.anabilim.purchase.entity.enums.QuoteStatus;
import com.anabilim.purchase.entity.enums.RequestStatus;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.mapper.PurchaseRequestMapper;
import com.anabilim.purchase.repository.*;
import com.anabilim.purchase.service.PurchaseRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PurchaseRequestServiceImpl implements PurchaseRequestService {
    
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseRequestApprovalRepository approvalRepository;
    private final PurchaseRequestItemRepository itemRepository;
    private final UserRepository userRepository;
    private final PurchaseRequestMapper purchaseRequestMapper;
    private final SupplierQuoteRepository supplierQuoteRepository;

    @Override
    public PurchaseRequestDto createPurchaseRequest(CreatePurchaseRequestDto createDto, String requesterEmail) {
        User requester = userRepository.findByEmailAndIsActiveTrue(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + requesterEmail));
        
        PurchaseRequest request = purchaseRequestMapper.toEntity(createDto, requester);
        request = purchaseRequestRepository.save(request);
        
        // Onay adımlarını oluştur
        createApprovalSteps(request, requester);
        
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
    public PurchaseRequestDto approvePurchaseRequest(Long id, String approverEmail, ApprovePurchaseRequestDto approveDto) {
        PurchaseRequest request = validateAndGetRequest(id);
        User approver = validateAndGetUser(approverEmail);
        
        if (!canUserApprovePurchaseRequest(id, approverEmail)) {
            throw new ValidationException("Bu talebi onaylama yetkiniz bulunmamaktadır.");
        }
        
        Optional<PurchaseRequestApproval> currentApprovalOpt = approvalRepository
                .findFirstByPurchaseRequestAndStatusOrderByStepOrderAsc(request, ApprovalStatus.PENDING);
        
        if (currentApprovalOpt.isEmpty()) {
            throw new ValidationException("Onaylanacak adım bulunamadı.");
        }
        
        PurchaseRequestApproval currentApproval = currentApprovalOpt.get();
        if (!currentApproval.getApprover().getId().equals(approver.getId())) {
            throw new ValidationException("Bu adımı onaylama sırası sizde değil.");
        }
        
        // Onayı güncelle
        currentApproval.setStatus(ApprovalStatus.APPROVED);
        currentApproval.setComment(approveDto.getComment());
        currentApproval.setActionTakenAt(LocalDateTime.now());
        approvalRepository.save(currentApproval);
        
        // Sonraki onay adımını kontrol et
        Optional<PurchaseRequestApproval> nextApprovalOpt = approvalRepository
                .findFirstByPurchaseRequestAndStatusOrderByStepOrderAsc(request, ApprovalStatus.PENDING);
        
        if (nextApprovalOpt.isEmpty()) {
            // Tüm onaylar tamamlandı
            request.setStatus(RequestStatus.APPROVED);
            request.setCompletedAt(LocalDateTime.now());
        } else {
            request.setStatus(RequestStatus.IN_APPROVAL);
        }
        
        request = purchaseRequestRepository.save(request);
        return purchaseRequestMapper.toDto(request);
    }
    
    @Override
    public PurchaseRequestDto rejectPurchaseRequest(Long id, String approverEmail, ApprovePurchaseRequestDto rejectDto) {
        PurchaseRequest request = validateAndGetRequest(id);
        User approver = validateAndGetUser(approverEmail);
        
        if (!canUserApprovePurchaseRequest(id, approverEmail)) {
            throw new ValidationException("Bu talebi reddetme yetkiniz bulunmamaktadır.");
        }
        
        Optional<PurchaseRequestApproval> currentApprovalOpt = approvalRepository
                .findFirstByPurchaseRequestAndStatusOrderByStepOrderAsc(request, ApprovalStatus.PENDING);
        
        if (currentApprovalOpt.isEmpty()) {
            throw new ValidationException("Reddedilecek adım bulunamadı.");
        }
        
        PurchaseRequestApproval currentApproval = currentApprovalOpt.get();
        if (!currentApproval.getApprover().getId().equals(approver.getId())) {
            throw new ValidationException("Bu adımı reddetme sırası sizde değil.");
        }
        
        // Onayı güncelle
        currentApproval.setStatus(ApprovalStatus.REJECTED);
        currentApproval.setComment(rejectDto.getComment());
        currentApproval.setActionTakenAt(LocalDateTime.now());
        approvalRepository.save(currentApproval);
        
        // Talebi reddet
        request.setStatus(RequestStatus.REJECTED);
        request.setRejectionReason(rejectDto.getRejectionReason());
        request = purchaseRequestRepository.save(request);
        
        return purchaseRequestMapper.toDto(request);
    }
    
    @Override
    public List<PurchaseRequestDto> getPendingApprovalsForUser(String approverEmail) {
        User approver = validateAndGetUser(approverEmail);
        return purchaseRequestMapper.toDtoList(
                purchaseRequestRepository.findAll().stream()
                        .filter(request -> request.getApprovals().stream()
                                .anyMatch(approval -> approval.getStatus() == ApprovalStatus.PENDING &&
                                        approval.getApprover().getId().equals(approver.getId())))
                        .toList()
        );
    }
    
    @Override
    @Transactional
    public PurchaseRequestDto updatePurchaseRequestItems(Long id, UpdatePurchaseRequestItemsDto itemsDto) {
        PurchaseRequest request = validateAndGetRequest(id);

        // Mevcut ürünleri ve ilişkili teklifleri temizle
        request.getItems().forEach(item -> {
            supplierQuoteRepository.deleteAll(item.getSupplierQuotes());
            item.getSupplierQuotes().clear();
            item.getPotentialSuppliers().clear();
        });
        request.getItems().clear();
        
        // Yeni ürünleri ekle
        List<PurchaseRequestItem> newItems = purchaseRequestMapper.toItemEntityList(itemsDto.getItems());
        for (PurchaseRequestItem item : newItems) {
            item.setPurchaseRequest(request);
            request.getItems().add(item);
        }
        
        request.setStatus(RequestStatus.IN_PROGRESS);
        request = purchaseRequestRepository.save(request);
        
        return purchaseRequestMapper.toDto(request);
    }
    
    @Override
    public PurchaseRequestDto cancelPurchaseRequest(Long id, String requesterEmail, String reason) {
        PurchaseRequest request = validateAndGetRequest(id);
        
        if (!isUserRequester(id, requesterEmail)) {
            throw new ValidationException("Bu talebi iptal etme yetkiniz bulunmamaktadır.");
        }
        
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
    
    private User validateAndGetUser(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + email));
    }
    
    private void createApprovalSteps(PurchaseRequest request, User requester) {
        List<PurchaseRequestApproval> approvals = new ArrayList<>();
        
        // Kullanıcının yöneticisini bul
        User manager = requester.getManager();
        if (manager == null) {
            throw new ValidationException("Kullanıcının yöneticisi bulunamadı.");
        }
        
        // Onay adımlarını oluştur
        if (hasRole(requester, "ROLE_TEACHER")) {
            // Öğretmen onay süreci: ZUMRE_BASKANI -> OKUL_MUDURU -> SATIN_ALMA -> GENEL_MUDUR -> CEO
            approvals.add(createApprovalStep(request, findUserByRole("ROLE_ZUMRE_BASKANI"), "ZUMRE_BASKANI", 1));
            approvals.add(createApprovalStep(request, findUserByRole("ROLE_OKUL_MUDURU"), "OKUL_MUDURU", 2));
            approvals.add(createApprovalStep(request, findUserByRole("ROLE_SATIN_ALMA"), "SATIN_ALMA", 3));
            approvals.add(createApprovalStep(request, findUserByRole("ROLE_GENEL_MUDUR"), "GENEL_MUDUR", 4));
            approvals.add(createApprovalStep(request, findUserByRole("ROLE_CEO"), "CEO", 5));
        } else {
            // Bölüm başkanı onay süreci: OKUL_MUDURU -> SATIN_ALMA -> GENEL_MUDUR -> CEO
            approvals.add(createApprovalStep(request, findUserByRole("ROLE_OKUL_MUDURU"), "OKUL_MUDURU", 1));
            approvals.add(createApprovalStep(request, findUserByRole("ROLE_SATIN_ALMA"), "SATIN_ALMA", 2));
            approvals.add(createApprovalStep(request, findUserByRole("ROLE_GENEL_MUDUR"), "GENEL_MUDUR", 3));
            approvals.add(createApprovalStep(request, findUserByRole("ROLE_CEO"), "CEO", 4));
        }
        
        request.setApprovals(approvals);
        request.setStatus(RequestStatus.IN_APPROVAL);
    }
    
    private PurchaseRequestApproval createApprovalStep(PurchaseRequest request, User approver, String roleName, int stepOrder) {
        PurchaseRequestApproval approval = new PurchaseRequestApproval();
        approval.setPurchaseRequest(request);
        approval.setApprover(approver);
        approval.setRoleName(roleName);
        approval.setRequiredRole(roleName);
        approval.setStepOrder(stepOrder);
        approval.setStatus(ApprovalStatus.PENDING);
        return approval;
    }
    
    private boolean hasRole(User user, String roleName) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(roleName));
    }
    
    private User findUserByRole(String roleName) {
        List<User> users = userRepository.findByRoleName(roleName.replace("ROLE_", ""));
        if (users.isEmpty()) {
            throw new ValidationException("Bu role sahip kullanıcı bulunamadı: " + roleName);
        }
        return users.get(0); // İlk bulunan kullanıcıyı döndür
    }
} 