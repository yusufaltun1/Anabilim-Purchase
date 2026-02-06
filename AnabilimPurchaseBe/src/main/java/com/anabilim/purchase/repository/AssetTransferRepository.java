package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.AssetTransfer;
import com.anabilim.purchase.entity.School;
import com.anabilim.purchase.entity.Warehouse;
import com.anabilim.purchase.entity.enums.TransferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetTransferRepository extends JpaRepository<AssetTransfer, Long> {
    
    Optional<AssetTransfer> findByTransferCode(String transferCode);
    
    boolean existsByTransferCode(String transferCode);
    
    List<AssetTransfer> findByStatus(TransferStatus status);
    
    List<AssetTransfer> findBySourceWarehouse(Warehouse warehouse);

    
    // Pageable versiyonlar
    Page<AssetTransfer> findByStatus(TransferStatus status, Pageable pageable);
    
    Page<AssetTransfer> findBySourceWarehouse(Warehouse warehouse, Pageable pageable);

    
    // Tarih aralığı sorguları
    List<AssetTransfer> findByTransferDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    List<AssetTransfer> findByActualTransferDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Kullanıcı bazlı sorgular
    List<AssetTransfer> findByRequestedById(Long userId);
    
    List<AssetTransfer> findByApprovedById(Long userId);
    
    // Kullanıcıya atanmış transferler (teslim alması gerekenler)
    @Query("SELECT at FROM AssetTransfer at WHERE " +
           "(at.receivedBy.id = :userId OR at.deliveredBy.id = :userId) " +
           "AND at.status IN ('IN_TRANSIT', 'DELIVERED', 'PREPARING', 'APPROVED', 'PENDING') " +
           "ORDER BY at.transferDate ASC")
    List<AssetTransfer> findAssignedTransfersByUserId(@Param("userId") Long userId);
    
    // Kullanıcıya atanmış transferler sayısı
    @Query("SELECT COUNT(at) FROM AssetTransfer at WHERE " +
           "(at.receivedBy.id = :userId OR at.deliveredBy.id = :userId) " +
           "AND at.status IN ('IN_TRANSIT', 'DELIVERED', 'PREPARING', 'APPROVED', 'PENDING')")
    long countAssignedTransfersByUserId(@Param("userId") Long userId);
    
    // Kompleks sorgular

    
    // Arama sorguları
    @Query("SELECT at FROM AssetTransfer at WHERE " +
           "LOWER(at.transferCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(at.sourceWarehouse.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(at.notes) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<AssetTransfer> searchTransfers(@Param("search") String search, Pageable pageable);
    
    // İstatistik sorguları
    @Query("SELECT COUNT(at) FROM AssetTransfer at WHERE at.status = :status")
    long countByStatus(@Param("status") TransferStatus status);
    
    @Query("SELECT at.status, COUNT(at) FROM AssetTransfer at GROUP BY at.status")
    List<Object[]> countTransfersByStatus();
    

    
    // Bekleyen transferler
    @Query("SELECT at FROM AssetTransfer at WHERE at.status IN ('PENDING', 'APPROVED', 'PREPARING') " +
           "ORDER BY at.transferDate ASC")
    List<AssetTransfer> findPendingTransfers();
    
    // Geciken transferler
    @Query("SELECT at FROM AssetTransfer at WHERE at.status IN ('PENDING', 'APPROVED', 'PREPARING', 'IN_TRANSIT') " +
           "AND at.transferDate < :currentDate")
    List<AssetTransfer> findOverdueTransfers(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT at FROM AssetTransfer at ORDER BY at.createdAt DESC")
    Page<AssetTransfer> findAllTransfersOrderByCreatedAtDesc(Pageable pageable);
} 