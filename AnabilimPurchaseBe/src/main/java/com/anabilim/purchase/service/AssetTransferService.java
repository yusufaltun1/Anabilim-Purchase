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

    
    Page<AssetTransferDto> searchTransfers(String search, Pageable pageable);
    
    List<AssetTransferDto> getPendingTransfers();
    
    List<AssetTransferDto> getOverdueTransfers();
    
    // Transfer item işlemleri
    AssetTransferDto updateTransferItem(Long transferId, Long itemId, Integer transferredQuantity);

    /**
     * Transfer kalemi için transfer / teslim alma resimlerini günceller
     */
    AssetTransferDto updateTransferItemImages(Long transferId, Long itemId,
                                              java.util.List<String> transferImagesBase64,
                                              java.util.List<String> receiveImagesBase64);
    
    // Entity dönüş metodları (internal kullanım için)
    AssetTransfer findTransferEntityById(Long id);
    
    AssetTransfer findTransferEntityByCode(String transferCode);
    
    // İstatistik metodları
    long getTransferCountByStatus(TransferStatus status);
    
    List<Object[]> getTransferCountsByStatus();

    Page<AssetTransferDto> getAllTransfersSortedByDate(Pageable pageable);
    
    // Kullanıcıya atanmış transferler
    List<AssetTransferDto> getAssignedTransfersByUserId(Long userId);
    
    long getAssignedTransferCountByUserId(Long userId);
} 