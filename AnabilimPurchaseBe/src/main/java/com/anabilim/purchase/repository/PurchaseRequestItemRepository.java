package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.PurchaseRequest;
import com.anabilim.purchase.entity.PurchaseRequestItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRequestItemRepository extends JpaRepository<PurchaseRequestItem, Long> {
    
    @EntityGraph(attributePaths = {"purchaseRequest"})
    List<PurchaseRequestItem> findByPurchaseRequest(PurchaseRequest purchaseRequest);
} 