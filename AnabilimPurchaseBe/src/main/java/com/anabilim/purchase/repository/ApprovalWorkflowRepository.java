package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.ApprovalWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * ApprovalWorkflow repository interface
 */
@Repository
public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, Long> {
    
    List<ApprovalWorkflow> findByIsActiveTrue();

    List<ApprovalWorkflow> findByIsActiveFalse();
    List<ApprovalWorkflow> findAll();



    List<ApprovalWorkflow> findByCategoryAndIsActiveTrue(String category);
    
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.isActive = true AND " +
           "(:amount IS NULL OR (w.minAmount IS NULL OR w.minAmount <= :amount) AND " +
           "(w.maxAmount IS NULL OR w.maxAmount >= :amount)) AND " +
           "(:category IS NULL OR w.category = :category)")
    List<ApprovalWorkflow> findMatchingWorkflows(@Param("amount") BigDecimal amount, 
                                                 @Param("category") String category);
    
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.isActive = true AND " +
           "w.minAmount <= :amount AND (w.maxAmount IS NULL OR w.maxAmount >= :amount)")
    List<ApprovalWorkflow> findByAmountRange(@Param("amount") BigDecimal amount);
    
    Optional<ApprovalWorkflow> findByNameAndIsActiveTrue(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT DISTINCT w.category FROM ApprovalWorkflow w WHERE w.isActive = true")
    List<String> findDistinctCategories();
} 