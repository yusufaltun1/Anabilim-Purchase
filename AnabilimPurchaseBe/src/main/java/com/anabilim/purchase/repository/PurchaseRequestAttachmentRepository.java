package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.PurchaseRequestAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseRequestAttachmentRepository extends JpaRepository<PurchaseRequestAttachment, Long> {

    List<PurchaseRequestAttachment> findByPurchaseRequestIdOrderByCreatedAtAsc(Long purchaseRequestId);

    long deleteByPurchaseRequestId(Long purchaseRequestId);
}
