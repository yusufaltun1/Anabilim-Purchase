package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreateAssetTransferDto;
import com.anabilim.purchase.dto.response.AssetTransferDto;
import com.anabilim.purchase.entity.*;
import com.anabilim.purchase.entity.enums.TransferStatus;
import com.anabilim.purchase.mapper.AssetTransferMapper;
import com.anabilim.purchase.repository.*;
import com.anabilim.purchase.service.AssetTransferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AssetTransferServiceImpl implements AssetTransferService {

    private final AssetTransferRepository assetTransferRepository;
    private final AssetTransferItemRepository assetTransferItemRepository;
    private final WarehouseRepository warehouseRepository;
    private final SchoolRepository schoolRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AssetTransferMapper assetTransferMapper;

    @Override
    public AssetTransferDto createTransfer(CreateAssetTransferDto createDto) {
        log.info("Creating new asset transfer from warehouse {} to warehouse {}", 
            createDto.getSourceWarehouseId(), createDto.getTargetWarehouseId());
        
        // Validation
        Warehouse sourceWarehouse = warehouseRepository.findById(createDto.getSourceWarehouseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Kaynak depo bulunamadı: " + createDto.getSourceWarehouseId()));

        Warehouse targetWarehouse = warehouseRepository.findById(createDto.getTargetWarehouseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Hedef depo bulunamadı: " + createDto.getTargetWarehouseId()));

        // Kendim yöneteceğim / alıcı kullanıcı kontrolü
        boolean selfManaged = Boolean.TRUE.equals(createDto.getSelfManaged());
        if (!selfManaged && createDto.getReceiverUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Alıcı kullanıcı seçilmelidir veya 'Kendim yöneteceğim' işaretlenmelidir");
        }

        User receiverUser = null;
        if (!selfManaged && createDto.getReceiverUserId() != null) {
            receiverUser = userRepository.findById(createDto.getReceiverUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Alıcı kullanıcı bulunamadı: " + createDto.getReceiverUserId()));
        }

        // Create transfer
        AssetTransfer transfer = assetTransferMapper.toEntity(createDto);
        transfer.setSourceWarehouse(sourceWarehouse);
        transfer.setTargetWarehouse(targetWarehouse);
        transfer.setSelfManaged(selfManaged);
        if (receiverUser != null) {
            transfer.setReceivedBy(receiverUser);
        }
        
        // Generate unique transfer code if needed
        String transferCode = transfer.getTransferCode();
        while (assetTransferRepository.existsByTransferCode(transferCode)) {
            transfer.setTransferCode(generateTransferCode());
            transferCode = transfer.getTransferCode();
        }
        
        transfer = assetTransferRepository.save(transfer);

        // Create transfer items
        for (CreateAssetTransferDto.TransferItemDto itemDto : createDto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                        "Ürün bulunamadı: " + itemDto.getProductId()));
            
            AssetTransferItem item = assetTransferMapper.toItemEntity(itemDto);
            item.setProduct(product);
            transfer.addTransferItem(item);
        }
        
        transfer = assetTransferRepository.save(transfer);
        
        log.info("Asset transfer created successfully with ID: {}", transfer.getId());
        return assetTransferMapper.toDto(transfer);
    }

    @Override
    public AssetTransferDto updateTransferStatus(Long id, TransferStatus status) {
        log.info("Updating transfer status for ID: {} to {}", id, status);
        
        AssetTransfer transfer = findTransferEntityById(id);
        transfer.setStatus(status);
        
        if (status == TransferStatus.IN_TRANSIT) {
            transfer.setActualTransferDate(LocalDateTime.now());
        } else if (status == TransferStatus.COMPLETED) {
            if (transfer.getActualTransferDate() == null) {
                transfer.setActualTransferDate(LocalDateTime.now());
            }
        }
        
        transfer = assetTransferRepository.save(transfer);
        
        log.info("Transfer status updated successfully for ID: {}", id);
        return assetTransferMapper.toDto(transfer);
    }

    @Override
    public AssetTransferDto approveTransfer(Long id, Long approvedByUserId) {
        log.info("Approving transfer ID: {} by user: {}", id, approvedByUserId);
        
        AssetTransfer transfer = findTransferEntityById(id);
        User approvedBy = userRepository.findById(approvedByUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Kullanıcı bulunamadı: " + approvedByUserId));
        
        transfer.setStatus(TransferStatus.APPROVED);
        transfer.setApprovedBy(approvedBy);
        
        transfer = assetTransferRepository.save(transfer);
        
        log.info("Transfer approved successfully for ID: {}", id);
        return assetTransferMapper.toDto(transfer);
    }

    @Override
    public AssetTransferDto startTransfer(Long id, Long deliveredByUserId) {
        log.info("Starting transfer ID: {} by user: {}", id, deliveredByUserId);
        
        AssetTransfer transfer = findTransferEntityById(id);
        User deliveredBy = userRepository.findById(deliveredByUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Kullanıcı bulunamadı: " + deliveredByUserId));
        
        transfer.setStatus(TransferStatus.IN_TRANSIT);
        transfer.setDeliveredBy(deliveredBy);
        transfer.setActualTransferDate(LocalDateTime.now());
        
        transfer = assetTransferRepository.save(transfer);
        
        log.info("Transfer started successfully for ID: {}", id);
        return assetTransferMapper.toDto(transfer);
    }

    @Override
    public AssetTransferDto completeTransfer(Long id, Long receivedByUserId) {
        log.info("Completing transfer ID: {} by user: {}", id, receivedByUserId);
        
        AssetTransfer transfer = findTransferEntityById(id);
        User receivedBy = userRepository.findById(receivedByUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Kullanıcı bulunamadı: " + receivedByUserId));
        
        transfer.setStatus(TransferStatus.COMPLETED);
        transfer.setReceivedBy(receivedBy);
        
        transfer = assetTransferRepository.save(transfer);
        
        log.info("Transfer completed successfully for ID: {}", id);
        return assetTransferMapper.toDto(transfer);
    }

    @Override
    public AssetTransferDto cancelTransfer(Long id, String reason) {
        log.info("Cancelling transfer ID: {} with reason: {}", id, reason);
        
        AssetTransfer transfer = findTransferEntityById(id);
        transfer.setStatus(TransferStatus.CANCELLED);
        transfer.setNotes(transfer.getNotes() + "\n\nİptal Nedeni: " + reason);
        
        transfer = assetTransferRepository.save(transfer);
        
        log.info("Transfer cancelled successfully for ID: {}", id);
        return assetTransferMapper.toDto(transfer);
    }

    @Override
    public void deleteTransfer(Long id) {
        log.info("Deleting transfer with ID: {}", id);
        
        AssetTransfer transfer = findTransferEntityById(id);
        assetTransferRepository.delete(transfer);
        
        log.info("Transfer deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetTransferDto getTransferById(Long id) {
        AssetTransfer transfer = findTransferEntityById(id);
        return assetTransferMapper.toDto(transfer);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetTransferDto getTransferByCode(String transferCode) {
        AssetTransfer transfer = findTransferEntityByCode(transferCode);
        return assetTransferMapper.toDto(transfer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetTransferDto> getAllTransfers(Pageable pageable) {
        Page<AssetTransfer> transfers = assetTransferRepository.findAll(pageable);
        return transfers.map(assetTransferMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetTransferDto> getTransfersByStatus(TransferStatus status, Pageable pageable) {
        Page<AssetTransfer> transfers = assetTransferRepository.findByStatus(status, pageable);
        return transfers.map(assetTransferMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetTransferDto> getTransfersByWarehouse(Long warehouseId, Pageable pageable) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Depo bulunamadı: " + warehouseId));
        
        Page<AssetTransfer> transfers = assetTransferRepository.findBySourceWarehouse(warehouse, pageable);
        return transfers.map(assetTransferMapper::toDto);
    }



    @Override
    @Transactional(readOnly = true)
    public Page<AssetTransferDto> searchTransfers(String search, Pageable pageable) {
        Page<AssetTransfer> transfers = assetTransferRepository.searchTransfers(search, pageable);
        return transfers.map(assetTransferMapper::toDto);
    }



    @Override
    @Transactional(readOnly = true)
    public List<AssetTransferDto> getPendingTransfers() {
        List<AssetTransfer> transfers = assetTransferRepository.findPendingTransfers();
        return assetTransferMapper.toDtoList(transfers);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetTransferDto> getOverdueTransfers() {
        List<AssetTransfer> transfers = assetTransferRepository.findOverdueTransfers(LocalDateTime.now());
        return assetTransferMapper.toDtoList(transfers);
    }

    @Override
    public AssetTransferDto updateTransferItem(Long transferId, Long itemId, Integer transferredQuantity) {
        log.info("Updating transfer item {} in transfer {} with quantity {}", 
            itemId, transferId, transferredQuantity);
        
        AssetTransferItem item = assetTransferItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Transfer kalemi bulunamadı: " + itemId));
        
        if (!item.getAssetTransfer().getId().equals(transferId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Transfer kalemi belirtilen transfere ait değil");
        }
        
        item.setTransferredQuantity(transferredQuantity);
        assetTransferItemRepository.save(item);
        
        AssetTransfer transfer = item.getAssetTransfer();
        log.info("Transfer item updated successfully");
        return assetTransferMapper.toDto(transfer);
    }

    @Override
    public AssetTransferDto updateTransferItemImages(Long transferId, Long itemId,
                                                     java.util.List<String> transferImagesBase64,
                                                     java.util.List<String> receiveImagesBase64) {
        log.info("Updating transfer item {} images in transfer {}", itemId, transferId);

        AssetTransferItem item = assetTransferItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Transfer kalemi bulunamadı: " + itemId));

        if (!item.getAssetTransfer().getId().equals(transferId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Transfer kalemi belirtilen transfere ait değil");
        }

        if (transferImagesBase64 != null) {
            item.setTransferImagesBase64(assetTransferMapper.toJsonList(transferImagesBase64));
        }
        if (receiveImagesBase64 != null) {
            item.setReceiveImagesBase64(assetTransferMapper.toJsonList(receiveImagesBase64));
        }

        assetTransferItemRepository.save(item);

        AssetTransfer transfer = item.getAssetTransfer();
        log.info("Transfer item images updated successfully");
        return assetTransferMapper.toDto(transfer);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetTransfer findTransferEntityById(Long id) {
        return assetTransferRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Transfer bulunamadı: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public AssetTransfer findTransferEntityByCode(String transferCode) {
        return assetTransferRepository.findByTransferCode(transferCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Transfer bulunamadı: " + transferCode));
    }

    @Override
    @Transactional(readOnly = true)
    public long getTransferCountByStatus(TransferStatus status) {
        return assetTransferRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object[]> getTransferCountsByStatus() {
        return assetTransferRepository.countTransfersByStatus();
    }


    @Override
    @Transactional(readOnly = true)
    public Page<AssetTransferDto> getAllTransfersSortedByDate(Pageable pageable) {
        Page<AssetTransfer> transfers = assetTransferRepository.findAllTransfersOrderByCreatedAtDesc(pageable);
        return transfers.map(assetTransferMapper::toDto);
    }
    
    private String generateTransferCode() {
        return "TR-" + LocalDateTime.now().getYear() + "-" + 
               String.format("%06d", (int)(Math.random() * 1000000));
    }
} 