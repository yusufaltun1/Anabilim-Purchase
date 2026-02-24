package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.ApprovePurchaseRequestDto;
import com.anabilim.purchase.dto.request.CreatePurchaseRequestDto;
import com.anabilim.purchase.dto.request.UpdatePurchaseRequestDto;
import com.anabilim.purchase.dto.request.UpdatePurchaseRequestItemsDto;
import com.anabilim.purchase.dto.response.AttachmentDownloadResult;
import com.anabilim.purchase.dto.response.PurchaseRequestAttachmentDto;
import com.anabilim.purchase.dto.response.PurchaseRequestDto;
import com.anabilim.purchase.dto.response.ParentApproverCandidateDto;
import com.anabilim.purchase.dto.response.SendDownCandidateDto;
import com.anabilim.purchase.entity.*;
import com.anabilim.purchase.entity.enums.ApprovalStatus;
import com.anabilim.purchase.entity.enums.RequestStatus;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.exception.ValidationException;
import com.anabilim.purchase.mapper.PurchaseRequestMapper;
import com.anabilim.purchase.repository.*;
import com.anabilim.purchase.service.NotificationService;
import com.anabilim.purchase.service.PurchaseRequestService;
import com.anabilim.purchase.service.UserGroupService;
import com.anabilim.purchase.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;
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
    private final UserGroupService userGroupService;
    private final PurchaseRequestAttachmentRepository attachmentRepository;

    @Value("${app.upload-dir:uploads}")
    private String uploadBaseDir;

    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

    /** Mutlak path kullanarak Tomcat/servlet ortamında dizin tutarlılığını sağlar. */
    private Path getUploadBasePath() {
        return Paths.get(uploadBaseDir).toAbsolutePath().normalize();
    }

    @Override
    public PurchaseRequestDto createPurchaseRequest(CreatePurchaseRequestDto createDto, String requesterEmail) {
        User requester = userRepository.findByEmailAndIsActiveTrue(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + requesterEmail));
        
        PurchaseRequest request = purchaseRequestMapper.toEntity(createDto, requester);
        
        createInitialApprovalStep(request, requester, createDto.getFirstApproverUserId());
        
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
    
    private void createInitialApprovalStep(PurchaseRequest request, User requester, Long firstApproverUserIdFromDto) {
        List<ParentApproverCandidateDto> candidates = userGroupService.findParentApproverCandidatesForUser(requester);
        long selectableCount = candidates.stream().filter(c -> c.getUserId() != null).count();
        User firstApprover;
        if (selectableCount > 1) {
            if (firstApproverUserIdFromDto != null) {
                firstApprover = candidates.stream()
                        .filter(c -> c.getUserId() != null && c.getUserId().equals(firstApproverUserIdFromDto))
                        .findFirst()
                        .map(c -> userRepository.findById(c.getUserId()).orElseThrow())
                        .orElseThrow(() -> new ValidationException("Seçilen ilk onaycı geçerli değil."));
            } else {
                firstApprover = candidates.stream()
                        .filter(c -> c.getUserId() != null)
                        .findFirst()
                        .map(c -> userRepository.findById(c.getUserId()).orElseThrow())
                        .orElseThrow();
            }
        } else if (selectableCount == 1) {
            firstApprover = candidates.stream()
                    .filter(c -> c.getUserId() != null)
                    .findFirst()
                    .map(c -> userRepository.findById(c.getUserId()).orElse(null))
                    .orElse(null);
        } else {
            firstApprover = requester.getManager();
        }
        if (firstApprover == null) {
            throw new ValidationException("Ağaçta üst onaycı veya yönetici atanmamış. Talep oluşturulamaz.");
        }

        PurchaseRequestApproval approval = new PurchaseRequestApproval();
        approval.setPurchaseRequest(request);
        approval.setApprover(firstApprover);
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

        List<ParentApproverCandidateDto> candidates = userGroupService.findParentApproverCandidatesForUser(currentApproval.getApprover());
        long selectableCount = candidates.stream().filter(c -> c.getUserId() != null).count();
        User nextApprover;
        if (selectableCount > 1) {
            if (approveDto.getNextApproverUserId() == null) {
                throw new ValidationException("Birden fazla üst grubunuz var. Lütfen onayı hangi üst gruba ileteceğinizi seçin.");
            }
            nextApprover = candidates.stream()
                    .filter(c -> c.getUserId() != null && c.getUserId().equals(approveDto.getNextApproverUserId()))
                    .findFirst()
                    .map(c -> userRepository.findById(c.getUserId()).orElseThrow())
                    .orElseThrow(() -> new ValidationException("Seçilen üst onaycı geçerli değil."));
        } else if (selectableCount == 1) {
            nextApprover = candidates.stream()
                    .filter(c -> c.getUserId() != null)
                    .findFirst()
                    .map(c -> userRepository.findById(c.getUserId()).orElse(null))
                    .orElse(null);
        } else {
            nextApprover = currentApproval.getApprover().getManager();
        }

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
            if (approveDto.getSendToUserId() != null) {
                User sendToUser = userRepository.findById(approveDto.getSendToUserId())
                        .orElseThrow(() -> new ValidationException("İletilecek kullanıcı bulunamadı."));
                if (!isValidReturnToTarget(request, currentApproval.getStepOrder(), sendToUser.getId())) {
                    throw new ValidationException("Talebi sadece talep sahibine veya onay zincirinde sizden önceki kişilere iletebilirsiniz.");
                }
                int nextStepOrder = request.getApprovals().stream().mapToInt(PurchaseRequestApproval::getStepOrder).max().orElse(0) + 1;
                PurchaseRequestApproval nextApproval = new PurchaseRequestApproval();
                nextApproval.setPurchaseRequest(request);
                nextApproval.setApprover(sendToUser);
                nextApproval.setRoleName("MANAGER");
                nextApproval.setRequiredRole("MANAGER");
                nextApproval.setStepOrder(nextStepOrder);
                nextApproval.setStatus(ApprovalStatus.PENDING);
                approvalRepository.save(nextApproval);
                request.setStatus(RequestStatus.IN_APPROVAL);
                String message = String.format("'%s' başlıklı talep %s tarafından size iletildi.", request.getTitle(), approver.getFirstName());
                notificationService.createNotification(sendToUser, message, request);
            } else {
                request.setStatus(RequestStatus.APPROVED);
                request.setCompletedAt(LocalDateTime.now());
                String finalMessage = String.format("'%s' başlıklı talebiniz tamamen onaylandı.", request.getTitle());
                notificationService.createNotification(request.getRequester(), finalMessage, request);
            }
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
        String reason = rejectDto.getRejectionReason() != null ? rejectDto.getRejectionReason() : rejectDto.getComment();
        currentApproval.setStatus(ApprovalStatus.REJECTED);
        currentApproval.setComment(reason);
        currentApproval.setActionTakenAt(LocalDateTime.now());
        approvalRepository.save(currentApproval);

        if (rejectDto.getReturnToUserId() != null) {
            // Talebi alt kırılımdaki bir kişiye geri gönder; talep kapanmaz, IN_APPROVAL kalır
            User returnToUser = userRepository.findById(rejectDto.getReturnToUserId())
                    .orElseThrow(() -> new ValidationException("Geri gönderilecek kullanıcı bulunamadı."));
            if (!isValidReturnToTarget(request, currentApproval.getStepOrder(), returnToUser.getId())) {
                throw new ValidationException("Geri gönderilecek kişi sadece talep sahibi veya onay zincirinde sizden önceki kişilerden biri olabilir.");
            }
            request.setRejectionReason(reason);
            int nextStepOrder = request.getApprovals().stream().mapToInt(PurchaseRequestApproval::getStepOrder).max().orElse(0) + 1;
            PurchaseRequestApproval nextApproval = new PurchaseRequestApproval();
            nextApproval.setPurchaseRequest(request);
            nextApproval.setApprover(returnToUser);
            nextApproval.setRoleName("MANAGER");
            nextApproval.setRequiredRole("MANAGER");
            nextApproval.setStepOrder(nextStepOrder);
            nextApproval.setStatus(ApprovalStatus.PENDING);
            approvalRepository.save(nextApproval);
            request.setStatus(RequestStatus.IN_APPROVAL);
            request = purchaseRequestRepository.save(request);
            String message = String.format("'%s' başlıklı talep %s tarafından size geri gönderildi. Gerekçe: %s", request.getTitle(), approver.getFirstName(), reason);
            notificationService.createNotification(returnToUser, message, request);
            return purchaseRequestMapper.toDto(request);
        }

        // Tamamen reddet
        request.setStatus(RequestStatus.REJECTED);
        request.setRejectionReason(reason);
        request = purchaseRequestRepository.save(request);
        String message = String.format("'%s' başlıklı talebiniz %s tarafından reddedildi. Sebep: %s", request.getTitle(), approver.getFirstName(), reason);
        notificationService.createNotification(request.getRequester(), message, request);
        return purchaseRequestMapper.toDto(request);
    }

    /** returnToUserId'nin requester veya mevcut adımdan önceki onaycılardan biri olup olmadığını kontrol eder */
    private boolean isValidReturnToTarget(PurchaseRequest request, int currentStepOrder, Long returnToUserId) {
        if (request.getRequester() != null && request.getRequester().getId().equals(returnToUserId)) return true;
        return request.getApprovals().stream()
                .filter(a -> a.getStepOrder() < currentStepOrder)
                .anyMatch(a -> a.getApprover() != null && a.getApprover().getId().equals(returnToUserId));
    }

    /** Üst onaycı yokken talebi iletebileceği kişiler: talep sahibi + önceki onaycılar */
    private List<SendDownCandidateDto> buildSendDownCandidates(PurchaseRequest request, int currentStepOrder) {
        List<SendDownCandidateDto> list = new ArrayList<>();
        if (request.getRequester() != null) {
            User r = request.getRequester();
            String name = (r.getFirstName() != null ? r.getFirstName() + " " : "") + (r.getLastName() != null ? r.getLastName() : "").trim();
            if (name.isEmpty()) name = r.getEmail();
            list.add(new SendDownCandidateDto(r.getId(), name, "Talep sahibi"));
        }
        request.getApprovals().stream()
                .filter(a -> a.getStepOrder() < currentStepOrder && a.getApprover() != null)
                .forEach(a -> {
                    User u = a.getApprover();
                    String name = (u.getFirstName() != null ? u.getFirstName() + " " : "") + (u.getLastName() != null ? u.getLastName() : "").trim();
                    if (name.isEmpty()) name = u.getEmail();
                    list.add(new SendDownCandidateDto(u.getId(), name, "Onaycı - Adım " + a.getStepOrder()));
                });
        return list;
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
    @Transactional(readOnly = true)
    public List<ParentApproverCandidateDto> getFirstApproverCandidatesForUser(String userEmail) {
        User user = userRepository.findByEmailAndIsActiveTrue(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + userEmail));
        return userGroupService.findParentApproverCandidatesForUser(user);
    }

    @Override
    public PurchaseRequestDto getPurchaseRequestById(Long id) {
        PurchaseRequest request = purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Satın alma talebi bulunamadı: " + id));
        PurchaseRequestDto dto = purchaseRequestMapper.toDto(request);
        if (request.getStatus() == RequestStatus.IN_APPROVAL || request.getStatus() == RequestStatus.IN_PROGRESS) {
            Optional<PurchaseRequestApproval> pendingOpt = approvalRepository
                    .findFirstByPurchaseRequestAndStatusOrderByStepOrderAsc(request, ApprovalStatus.PENDING);
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication() != null
                    ? SecurityContextHolder.getContext().getAuthentication().getName()
                    : null;
            if (pendingOpt.isPresent() && currentUserEmail != null) {
                userRepository.findByEmailAndIsActiveTrue(currentUserEmail).ifPresent(currentUser -> {
                    if (currentUser.getId().equals(pendingOpt.get().getApprover().getId())) {
                        List<ParentApproverCandidateDto> candidates = userGroupService.findParentApproverCandidatesForUser(currentUser);
                        dto.setNextApproverCandidates(candidates);
                        long selectableCount = candidates.stream().filter(c -> c.getUserId() != null).count();
                        boolean hasNextByManager = pendingOpt.get().getApprover().getManager() != null;
                        if (selectableCount == 0 && !hasNextByManager) {
                            dto.setHasNoNextApprover(true);
                            dto.setSendDownCandidates(buildSendDownCandidates(request, pendingOpt.get().getStepOrder()));
                        }
                    }
                });
            }
        }
        List<PurchaseRequestAttachmentDto> attachmentDtos = attachmentRepository.findByPurchaseRequestIdOrderByCreatedAtAsc(request.getId())
                .stream()
                .map(a -> new PurchaseRequestAttachmentDto(a.getId(), a.getFileName(), a.getContentType(), a.getFileSize(), a.getCreatedAt()))
                .collect(Collectors.toList());
        dto.setAttachments(attachmentDtos);
        return dto;
    }

    @Override
    @Transactional
    public PurchaseRequestAttachmentDto uploadAttachment(Long requestId, MultipartFile file, String userEmail) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Dosya boş olamaz.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("Dosya boyutu 20 MB'dan büyük olamaz.");
        }
        String contentType = file.getContentType();
        boolean allowedType = contentType != null
                && ("application/pdf".equalsIgnoreCase(contentType) || contentType.toLowerCase().startsWith("image/"));
        if (!allowedType) {
            throw new ValidationException("Sadece PDF veya resim (JPEG, PNG, GIF, WebP) yüklenebilir.");
        }
        PurchaseRequest request = purchaseRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Satın alma talebi bulunamadı: " + requestId));
        User user = userRepository.findByEmailAndIsActiveTrue(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
        if (!request.getRequester().getId().equals(user.getId()) && !canUserApprovePurchaseRequest(requestId, userEmail)) {
            throw new ValidationException("Bu talebe belge ekleyemezsiniz.");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "file";
        }
        String ext = "";
        int dot = originalFilename.lastIndexOf('.');
        if (dot > 0) {
            ext = originalFilename.substring(dot);
        }
        String storedName = UUID.randomUUID().toString() + ext;
        Path base = getUploadBasePath();
        Path dir = base.resolve("purchase-requests").resolve(requestId.toString());
        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(storedName);
            file.transferTo(target.toFile());
        } catch (IOException e) {
            log.error("Attachment upload failed", e);
            throw new ValidationException("Dosya kaydedilemedi: " + e.getMessage());
        }
        String relativePath = "purchase-requests/" + requestId + "/" + storedName;
        PurchaseRequestAttachment att = new PurchaseRequestAttachment();
        att.setPurchaseRequest(request);
        att.setFileName(originalFilename);
        att.setContentType(contentType);
        att.setFileSize(file.getSize());
        att.setStoredPath(relativePath);
        att = attachmentRepository.save(att);
        return new PurchaseRequestAttachmentDto(att.getId(), att.getFileName(), att.getContentType(), att.getFileSize(), att.getCreatedAt());
    }

    @Override
    @Transactional(readOnly = true)
    public AttachmentDownloadResult downloadAttachment(Long requestId, Long attachmentId) {
        PurchaseRequestAttachment att = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Belge bulunamadı: " + attachmentId));
        if (!att.getPurchaseRequest().getId().equals(requestId)) {
            throw new ResourceNotFoundException("Belge bu talebe ait değil.");
        }
        Path path = getUploadBasePath().resolve(att.getStoredPath());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("Dosya bulunamadı.");
        }
        Resource resource = new FileSystemResource(path.toFile());
        return new AttachmentDownloadResult(resource, att.getFileName(), att.getContentType());
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
        
        // Yeni approval step'i oluştur (tekrar gönderimde ilk onaycı adaylarından biri otomatik seçilir veya manager kullanılır)
        createInitialApprovalStep(request, requester, null);
        
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
