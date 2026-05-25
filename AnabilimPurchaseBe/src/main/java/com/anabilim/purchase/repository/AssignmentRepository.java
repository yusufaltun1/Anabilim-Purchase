package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.Assignment;
import com.anabilim.purchase.entity.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    // Ürüne göre zimmetler
    List<Assignment> findByProductId(Long productId);
    
    // Ürün ve duruma göre zimmetler
    List<Assignment> findByProductIdAndStatus(Long productId, AssignmentStatus status);
    
    // Kullanıcıya zimmetler
    List<Assignment> findByAssignedUserId(Long userId);
    
    // Kullanıcı ve duruma göre zimmetler
    List<Assignment> findByAssignedUserIdAndStatus(Long userId, AssignmentStatus status);
    
    // Konuma zimmetler
    List<Assignment> findByAssignedLocationId(Long locationId);
    
    // Konuma zimmetler
    List<Assignment> findByLocationName(String locationName);
    
    // Aktif zimmetler
    List<Assignment> findByIsActiveTrue();
    
    // Duruma göre zimmetler
    List<Assignment> findByStatus(AssignmentStatus status);
    
    // StockItem'a zimmetler
    List<Assignment> findByStockItemId(Long stockItemId);
    
    // Aktif zimmetler (sadece aktif durumda olanlar)
    List<Assignment> findByStatusAndIsActiveTrue(AssignmentStatus status);
    
    // Süresi dolmuş zimmetler
    @Query("SELECT a FROM Assignment a WHERE a.expectedReturnDate < :now AND a.status = 'ACTIVE' AND a.isActive = true")
    List<Assignment> findExpiredAssignments(@Param("now") LocalDate now);
    
    // Kullanıcının aktif zimmetleri
    @Query("SELECT a FROM Assignment a WHERE a.assignedUser.id = :userId AND a.status = 'ACTIVE' AND a.isActive = true")
    List<Assignment> findActiveAssignmentsByUserId(@Param("userId") Long userId);
    
    // Ürünün aktif zimmetleri
    @Query("SELECT a FROM Assignment a WHERE a.product.id = :productId AND a.status = 'ACTIVE' AND a.isActive = true")
    List<Assignment> findActiveAssignmentsByProductId(@Param("productId") Long productId);
    
    // Konumun aktif zimmetleri
    @Query("SELECT a FROM Assignment a WHERE a.locationName = :locationName AND a.status = 'ACTIVE' AND a.isActive = true")
    List<Assignment> findActiveAssignmentsByLocation(@Param("locationName") String locationName);
    
    // Sayım metodları
    long countByProductId(Long productId);
    
    long countByProductIdAndStatus(Long productId, AssignmentStatus status);
    
    long countByAssignedUserId(Long userId);
    
    long countByAssignedUserIdAndStatus(Long userId, AssignmentStatus status);
    
    long countByAssignedLocationId(Long locationId);
    
    long countByLocationName(String locationName);
    
    long countByStatus(AssignmentStatus status);
    
    // Aktif zimmet sayısı
    @Query("SELECT COUNT(a) FROM Assignment a WHERE a.status = 'ACTIVE' AND a.isActive = true")
    long countActiveAssignments();

    @Query("SELECT COALESCE(SUM(a.quantity), 0) FROM Assignment a WHERE a.product.category.id = :categoryId AND a.status = 'ACTIVE' AND a.isActive = true")
    long sumActiveQuantityByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT a.product.category.id, COALESCE(SUM(a.quantity), 0) FROM Assignment a WHERE a.status = 'ACTIVE' AND a.isActive = true GROUP BY a.product.category.id")
    List<Object[]> sumActiveQuantityGroupByCategoryId();
}
