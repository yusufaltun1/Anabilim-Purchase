package com.anabilim.purchase.repository;

import com.anabilim.purchase.entity.AssetTransfer;
import com.anabilim.purchase.entity.AssetTransferItem;
import com.anabilim.purchase.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetTransferItemRepository extends JpaRepository<AssetTransferItem, Long> {
    
    List<AssetTransferItem> findByAssetTransfer(AssetTransfer transfer);
    
    List<AssetTransferItem> findByProduct(Product product);
    
    List<AssetTransferItem> findByAssetTransferAndProduct(AssetTransfer transfer, Product product);
    
    // Transfer durumu sorgular
    @Query("SELECT ati FROM AssetTransferItem ati WHERE ati.transferredQuantity IS NULL OR ati.transferredQuantity = 0")
    List<AssetTransferItem> findNotTransferredItems();
    
    @Query("SELECT ati FROM AssetTransferItem ati WHERE ati.transferredQuantity IS NOT NULL AND ati.transferredQuantity > 0 " +
           "AND (ati.requestedQuantity IS NULL OR ati.transferredQuantity < ati.requestedQuantity)")
    List<AssetTransferItem> findPartiallyTransferredItems();
    
    @Query("SELECT ati FROM AssetTransferItem ati WHERE ati.transferredQuantity IS NOT NULL " +
           "AND ati.requestedQuantity IS NOT NULL AND ati.transferredQuantity >= ati.requestedQuantity")
    List<AssetTransferItem> findFullyTransferredItems();
    
    // İstatistik sorguları
    @Query("SELECT p.name, SUM(ati.requestedQuantity), SUM(COALESCE(ati.transferredQuantity, 0)) " +
           "FROM AssetTransferItem ati JOIN ati.product p " +
           "WHERE ati.assetTransfer.id = :transferId " +
           "GROUP BY p.id, p.name")
    List<Object[]> getTransferItemsSummary(@Param("transferId") Long transferId);
    
    @Query("SELECT p.name, COUNT(ati), SUM(ati.requestedQuantity), SUM(COALESCE(ati.transferredQuantity, 0)) " +
           "FROM AssetTransferItem ati JOIN ati.product p " +
           "GROUP BY p.id, p.name " +
           "ORDER BY COUNT(ati) DESC")
    List<Object[]> getMostTransferredProducts();
    
    // Belirli bir transfer için eksik kalan ürünler
    @Query("SELECT ati FROM AssetTransferItem ati WHERE ati.assetTransfer.id = :transferId " +
           "AND (ati.transferredQuantity IS NULL OR ati.transferredQuantity < ati.requestedQuantity)")
    List<AssetTransferItem> findIncompleteItemsByTransfer(@Param("transferId") Long transferId);
} 