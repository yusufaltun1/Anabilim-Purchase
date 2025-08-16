package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.PurchaseRequest;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.entity.enums.RequestStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {
    
    @EntityGraph(attributePaths = {"requester", "approvals", "approvals.approver", "items"})
    List<PurchaseRequest> findByRequester(User requester);
    
    @EntityGraph(attributePaths = {"requester", "approvals", "approvals.approver", "items"})
    List<PurchaseRequest> findByStatus(RequestStatus status);
    
    @EntityGraph(attributePaths = {"requester", "approvals", "approvals.approver", "items"})
    List<PurchaseRequest> findByRequesterAndStatus(User requester, RequestStatus status);
} 