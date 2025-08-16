package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.request.CreateAssetTransferDto;
import com.anabilim.purchase.dto.response.AssetTransferDto;
import com.anabilim.purchase.entity.enums.TransferStatus;
import com.anabilim.purchase.service.AssetTransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/asset-transfers")
@RequiredArgsConstructor
public class AssetTransferController {

    private final AssetTransferService assetTransferService;

    @PostMapping
    public ResponseEntity<AssetTransferDto> createTransfer(@Valid @RequestBody CreateAssetTransferDto createDto) {
        AssetTransferDto transfer = assetTransferService.createTransfer(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(transfer);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AssetTransferDto> updateTransferStatus(
            @PathVariable Long id,
            @RequestParam TransferStatus status) {
        AssetTransferDto transfer = assetTransferService.updateTransferStatus(id, status);
        return ResponseEntity.ok(transfer);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<AssetTransferDto> approveTransfer(
            @PathVariable Long id,
            @RequestParam Long approvedByUserId) {
        AssetTransferDto transfer = assetTransferService.approveTransfer(id, approvedByUserId);
        return ResponseEntity.ok(transfer);
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<AssetTransferDto> startTransfer(
            @PathVariable Long id,
            @RequestParam Long deliveredByUserId) {
        AssetTransferDto transfer = assetTransferService.startTransfer(id, deliveredByUserId);
        return ResponseEntity.ok(transfer);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<AssetTransferDto> completeTransfer(
            @PathVariable Long id,
            @RequestParam Long receivedByUserId) {
        AssetTransferDto transfer = assetTransferService.completeTransfer(id, receivedByUserId);
        return ResponseEntity.ok(transfer);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AssetTransferDto> cancelTransfer(
            @PathVariable Long id,
            @RequestParam String reason) {
        AssetTransferDto transfer = assetTransferService.cancelTransfer(id, reason);
        return ResponseEntity.ok(transfer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransfer(@PathVariable Long id) {
        assetTransferService.deleteTransfer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetTransferDto> getTransferById(@PathVariable Long id) {
        AssetTransferDto transfer = assetTransferService.getTransferById(id);
        return ResponseEntity.ok(transfer);
    }

    @GetMapping("/code/{transferCode}")
    public ResponseEntity<AssetTransferDto> getTransferByCode(@PathVariable String transferCode) {
        AssetTransferDto transfer = assetTransferService.getTransferByCode(transferCode);
        return ResponseEntity.ok(transfer);
    }

    @GetMapping
    public ResponseEntity<Page<AssetTransferDto>> getAllTransfers(Pageable pageable) {
        Page<AssetTransferDto> transfers = assetTransferService.getAllTransfers(pageable);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<AssetTransferDto>> getTransfersByStatus(
            @PathVariable TransferStatus status,
            Pageable pageable) {
        Page<AssetTransferDto> transfers = assetTransferService.getTransfersByStatus(status, pageable);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<Page<AssetTransferDto>> getTransfersByWarehouse(
            @PathVariable Long warehouseId,
            Pageable pageable) {
        Page<AssetTransferDto> transfers = assetTransferService.getTransfersByWarehouse(warehouseId, pageable);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/school/{schoolId}")
    public ResponseEntity<Page<AssetTransferDto>> getTransfersBySchool(
            @PathVariable Long schoolId,
            Pageable pageable) {
        Page<AssetTransferDto> transfers = assetTransferService.getTransfersBySchool(schoolId, pageable);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AssetTransferDto>> searchTransfers(
            @RequestParam String query,
            Pageable pageable) {
        Page<AssetTransferDto> transfers = assetTransferService.searchTransfers(query, pageable);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<AssetTransferDto>> getTransfersWithFilters(
            @RequestParam(required = false) TransferStatus status,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long schoolId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime endDate,
            Pageable pageable) {
        
        Page<AssetTransferDto> transfers = assetTransferService.getTransfersWithFilters(
                status, warehouseId, schoolId, startDate, endDate, pageable);
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AssetTransferDto>> getPendingTransfers() {
        List<AssetTransferDto> transfers = assetTransferService.getPendingTransfers();
        return ResponseEntity.ok(transfers);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<AssetTransferDto>> getOverdueTransfers() {
        List<AssetTransferDto> transfers = assetTransferService.getOverdueTransfers();
        return ResponseEntity.ok(transfers);
    }

    @PutMapping("/{transferId}/items/{itemId}")
    public ResponseEntity<AssetTransferDto> updateTransferItem(
            @PathVariable Long transferId,
            @PathVariable Long itemId,
            @RequestParam Integer transferredQuantity) {
        AssetTransferDto transfer = assetTransferService.updateTransferItem(transferId, itemId, transferredQuantity);
        return ResponseEntity.ok(transfer);
    }

    @GetMapping("/statistics/count-by-status")
    public ResponseEntity<List<Object[]>> getTransferCountsByStatus() {
        List<Object[]> statistics = assetTransferService.getTransferCountsByStatus();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/statistics/top-schools")
    public ResponseEntity<List<Object[]>> getTopSchoolsByTransferCount(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate) {
        List<Object[]> statistics = assetTransferService.getTopSchoolsByTransferCount(startDate);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/statistics/count/{status}")
    public ResponseEntity<Long> getTransferCountByStatus(@PathVariable TransferStatus status) {
        long count = assetTransferService.getTransferCountByStatus(status);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/all")
    public ResponseEntity<Page<AssetTransferDto>> getAllTransfersSorted(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AssetTransferDto> transfers = assetTransferService.getAllTransfersSortedByDate(pageable);
        return ResponseEntity.ok(transfers);
    }
} 