package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.response.ProductProcurementSummaryDto;
import com.anabilim.purchase.entity.PurchaseOrder;
import com.anabilim.purchase.entity.PurchaseRequestItem;
import com.anabilim.purchase.exception.ResourceNotFoundException;
import com.anabilim.purchase.repository.ProductRepository;
import com.anabilim.purchase.repository.PurchaseOrderRepository;
import com.anabilim.purchase.repository.PurchaseRequestItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductProcurementService {

    private final ProductRepository productRepository;
    private final PurchaseRequestItemRepository purchaseRequestItemRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public ProductProcurementSummaryDto getProcurementSummary(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Ürün bulunamadı: " + productId);
        }

        ProductProcurementSummaryDto summary = new ProductProcurementSummaryDto();

        List<PurchaseRequestItem> items = purchaseRequestItemRepository.findByProductId(productId);
        List<ProductProcurementSummaryDto.RelatedPurchaseRequestRowDto> requestRows = new ArrayList<>();
        for (PurchaseRequestItem item : items) {
            if (item.getPurchaseRequest() == null) {
                continue;
            }
            ProductProcurementSummaryDto.RelatedPurchaseRequestRowDto row =
                    new ProductProcurementSummaryDto.RelatedPurchaseRequestRowDto();
            row.setRequestId(item.getPurchaseRequest().getId());
            row.setTitle(item.getPurchaseRequest().getTitle());
            row.setStatus(item.getPurchaseRequest().getStatus() != null
                    ? item.getPurchaseRequest().getStatus().name() : null);
            row.setRequestItemId(item.getId());
            row.setQuantity(item.getQuantity());
            row.setRequestCreatedAt(item.getPurchaseRequest().getCreatedAt());
            requestRows.add(row);
        }
        summary.setPurchaseRequests(requestRows);

        List<PurchaseOrder> orders = purchaseOrderRepository.findByProductId(productId);
        List<ProductProcurementSummaryDto.RelatedPurchaseOrderRowDto> orderRows = new ArrayList<>();
        for (PurchaseOrder order : orders) {
            ProductProcurementSummaryDto.RelatedPurchaseOrderRowDto row =
                    new ProductProcurementSummaryDto.RelatedPurchaseOrderRowDto();
            row.setOrderId(order.getId());
            row.setOrderCode(order.getOrderCode());
            row.setStatus(order.getStatus() != null ? order.getStatus().name() : null);
            row.setQuantity(order.getQuantity());
            row.setUnitPrice(order.getUnitPrice());
            row.setTotalPrice(order.getTotalPrice());
            row.setCurrency("TRY");
            row.setCreatedAt(order.getCreatedAt());
            orderRows.add(row);
        }
        summary.setPurchaseOrders(orderRows);

        return summary;
    }
}
