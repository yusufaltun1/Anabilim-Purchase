package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.request.ApprovePurchaseRequestDto;
import com.anabilim.purchase.dto.request.CreatePurchaseRequestDto;
import com.anabilim.purchase.dto.request.UpdatePurchaseRequestDto;
import com.anabilim.purchase.dto.request.UpdatePurchaseRequestItemsDto;
import com.anabilim.purchase.dto.response.ParentApproverCandidateDto;
import com.anabilim.purchase.dto.response.PurchaseRequestDto;
import com.anabilim.purchase.entity.enums.RequestStatus;
import com.anabilim.purchase.service.PurchaseRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-requests")
@RequiredArgsConstructor
public class PurchaseRequestController {
    
    private final PurchaseRequestService purchaseRequestService;
    
    @GetMapping("/first-approver-candidates")
    public ResponseEntity<List<ParentApproverCandidateDto>> getFirstApproverCandidates(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseRequestService.getFirstApproverCandidatesForUser(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<PurchaseRequestDto> createPurchaseRequest(
            @Valid @RequestBody CreatePurchaseRequestDto createDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseRequestService.createPurchaseRequest(createDto, userDetails.getUsername()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseRequestDto> getPurchaseRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseRequestService.getPurchaseRequestById(id));
    }
    
    @GetMapping
    public ResponseEntity<List<PurchaseRequestDto>> getAllPurchaseRequests() {
        return ResponseEntity.ok(purchaseRequestService.getAllPurchaseRequests());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseRequest(@PathVariable Long id) {
        purchaseRequestService.deletePurchaseRequest(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseRequestDto>> getPurchaseRequestsByStatus(
            @PathVariable RequestStatus status) {
        return ResponseEntity.ok(purchaseRequestService.getPurchaseRequestsByStatus(status));
    }
    
    @GetMapping("/my-requests")
    public ResponseEntity<List<PurchaseRequestDto>> getMyPurchaseRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseRequestService.getPurchaseRequestsByRequester(userDetails.getUsername()));
    }
    
    @GetMapping("/my-requests/status/{status}")
    public ResponseEntity<List<PurchaseRequestDto>> getMyPurchaseRequestsByStatus(
            @PathVariable RequestStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseRequestService.getPurchaseRequestsByRequesterAndStatus(
                userDetails.getUsername(), status));
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<PurchaseRequestDto> approvePurchaseRequest(
            @PathVariable Long id,
            @Valid @RequestBody ApprovePurchaseRequestDto approveDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseRequestService.approvePurchaseRequest(
                id, userDetails.getUsername(), approveDto));
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<PurchaseRequestDto> rejectPurchaseRequest(
            @PathVariable Long id,
            @Valid @RequestBody ApprovePurchaseRequestDto rejectDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseRequestService.rejectPurchaseRequest(
                id, userDetails.getUsername(), rejectDto));
    }
    
    @GetMapping("/pending-approvals")
    public ResponseEntity<List<PurchaseRequestDto>> getPendingApprovalsForUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseRequestService.getPendingApprovalsForUser(userDetails.getUsername()));
    }
    
    @PutMapping("/{id}/items")
    public ResponseEntity<PurchaseRequestDto> updatePurchaseRequestItems(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePurchaseRequestItemsDto itemsDto) {
        return ResponseEntity.ok(purchaseRequestService.updatePurchaseRequestItems(id, itemsDto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PurchaseRequestDto> updatePurchaseRequest(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePurchaseRequestDto updateDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseRequestService.updatePurchaseRequest(
                id, updateDto, userDetails.getUsername()));
    }
    
    @PostMapping("/{id}/cancel")
    public ResponseEntity<PurchaseRequestDto> cancelPurchaseRequest(
            @PathVariable Long id,
            @RequestParam String reason,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseRequestService.cancelPurchaseRequest(
                id, userDetails.getUsername(), reason));
    }
    
    @PostMapping("/{id}/resubmit")
    public ResponseEntity<PurchaseRequestDto> resubmitPurchaseRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(purchaseRequestService.resubmitPurchaseRequest(
                id, userDetails.getUsername()));
    }
} 