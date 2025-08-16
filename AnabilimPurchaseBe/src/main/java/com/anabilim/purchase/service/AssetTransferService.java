package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.request.CreateAssetTransferDto;
import com.anabilim.purchase.dto.response.AssetTransferDto;
import com.anabilim.purchase.entity.AssetTransfer;
import com.anabilim.purchase.entity.enums.TransferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface AssetTransferService {
    
    AssetTransferDto createTransfer(CreateAssetTransferDto createDto);
    
    AssetTransferDto updateTransferStatus(Long id, TransferStatus status);
    
    AssetTransferDto approveTransfer(Long id, Long approvedByUserId);
    
    AssetTransferDto startTransfer(Long id, Long deliveredByUserId);
    
    AssetTransferDto completeTransfer(Long id, Long receivedByUserId);
    
    AssetTransferDto cancelTransfer(Long id, String reason);
    
    void deleteTransfer(Long id);
    
    AssetTransferDto getTransferById(Long id);
    
    AssetTransferDto getTransferByCode(String transferCode);
    
    Page<AssetTransferDto> getAllTransfers(Pageable pageable);
    
    Page<AssetTransferDto> getTransfersByStatus(TransferStatus status, Pageable pageable);
    
    Page<AssetTransferDto> getTransfersByWarehouse(Long warehouseId, Pageable pageable);
    
    Page<AssetTransferDto> getTransfersBySchool(Long schoolId, Pageable pageable);
    
    Page<AssetTransferDto> searchTransfers(String search, Pageable pageable);
    
    Page<AssetTransferDto> getTransfersWithFilters(
            TransferStatus status, 
            Long warehouseId, 
            Long schoolId, 
            LocalDateTime startDate, 
            LocalDateTime endDate, 
            Pageable pageable);
    
    List<AssetTransferDto> getPendingTransfers();
    
    List<AssetTransferDto> getOverdueTransfers();
    
    // Transfer item işlemleri
    AssetTransferDto updateTransferItem(Long transferId, Long itemId, Integer transferredQuantity);
    
    // Entity dönüş metodları (internal kullanım için)
    AssetTransfer findTransferEntityById(Long id);
    
    AssetTransfer findTransferEntityByCode(String transferCode);
    
    // İstatistik metodları
    long getTransferCountByStatus(TransferStatus status);
    
    List<Object[]> getTransferCountsByStatus();
    
    List<Object[]> getTopSchoolsByTransferCount(LocalDateTime startDate);
    
    Page<AssetTransferDto> getAllTransfersSortedByDate(Pageable pageable);
} 