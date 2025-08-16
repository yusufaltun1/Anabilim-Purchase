package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.PurchaseRequestItem;
import com.anabilim.purchase.entity.Supplier;
import com.anabilim.purchase.entity.SupplierQuote;
import com.anabilim.purchase.entity.enums.QuoteStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierQuoteRepository extends JpaRepository<SupplierQuote, Long> {
    
    Optional<SupplierQuote> findByQuoteUid(String quoteUid);
    
    @EntityGraph(attributePaths = {"supplier", "requestItem"})
    List<SupplierQuote> findByRequestItem(PurchaseRequestItem requestItem);
    
    @EntityGraph(attributePaths = {"supplier", "requestItem"})
    List<SupplierQuote> findBySupplier(Supplier supplier);
    
    @EntityGraph(attributePaths = {"supplier", "requestItem"})
    List<SupplierQuote> findByStatus(QuoteStatus status);
    
    @EntityGraph(attributePaths = {"supplier", "requestItem"})
    List<SupplierQuote> findByRequestItemAndStatus(PurchaseRequestItem requestItem, QuoteStatus status);
    
    @EntityGraph(attributePaths = {"supplier", "requestItem"})
    Optional<SupplierQuote> findByRequestItemAndSupplier(PurchaseRequestItem requestItem, Supplier supplier);
    
    boolean existsByQuoteUid(String quoteUid);
} 