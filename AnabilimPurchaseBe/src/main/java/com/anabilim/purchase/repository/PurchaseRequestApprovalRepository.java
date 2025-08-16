package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.PurchaseRequest;
import com.anabilim.purchase.entity.PurchaseRequestApproval;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.entity.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRequestApprovalRepository extends JpaRepository<PurchaseRequestApproval, Long> {
    
    @EntityGraph(attributePaths = {"purchaseRequest", "approver"})
    List<PurchaseRequestApproval> findByPurchaseRequest(PurchaseRequest purchaseRequest);
    
    @EntityGraph(attributePaths = {"purchaseRequest", "approver"})
    List<PurchaseRequestApproval> findByApprover(User approver);
    
    @EntityGraph(attributePaths = {"purchaseRequest", "approver"})
    List<PurchaseRequestApproval> findByApproverAndStatus(User approver, ApprovalStatus status);
    
    @EntityGraph(attributePaths = {"purchaseRequest", "approver"})
    Optional<PurchaseRequestApproval> findByPurchaseRequestAndStepOrder(PurchaseRequest purchaseRequest, Integer stepOrder);
    
    @EntityGraph(attributePaths = {"purchaseRequest", "approver"})
    Optional<PurchaseRequestApproval> findFirstByPurchaseRequestAndStatusOrderByStepOrderAsc(
            PurchaseRequest purchaseRequest, ApprovalStatus status);
} 