package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.request.CreatePurchaseOrderDto;
import com.anabilim.purchase.dto.response.PurchaseOrderDto;
import com.anabilim.purchase.dto.response.SupplierDto;
import com.anabilim.purchase.dto.response.SupplierQuoteDto;
import com.anabilim.purchase.dto.response.WarehouseDto;
import com.anabilim.purchase.entity.Product;
import com.anabilim.purchase.entity.PurchaseOrder;
import com.anabilim.purchase.entity.SupplierQuote;
import com.anabilim.purchase.entity.Warehouse;
import com.anabilim.purchase.entity.enums.OrderStatus;
import com.anabilim.purchase.entity.enums.QuoteStatus;
import com.anabilim.purchase.repository.PurchaseOrderRepository;
import com.anabilim.purchase.repository.SupplierQuoteRepository;
import com.anabilim.purchase.repository.WarehouseRepository;
import com.anabilim.purchase.service.PurchaseOrderService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierQuoteRepository supplierQuoteRepository;
    private final WarehouseRepository warehouseRepository;

    @Override
    public PurchaseOrderDto createPurchaseOrder(CreatePurchaseOrderDto dto) {
        SupplierQuote supplierQuote = supplierQuoteRepository.findById(dto.getSupplierQuoteId())
                .orElseThrow(() -> new EntityNotFoundException("Tedarikçi teklifi bulunamadı"));

        Warehouse warehouse = warehouseRepository.findById(dto.getDeliveryWarehouseId())
                .orElseThrow(() -> new EntityNotFoundException("Depo bulunamadı"));

        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setSupplierQuote(supplierQuote);
        purchaseOrder.setQuantity(dto.getQuantity());
        purchaseOrder.setUnitPrice(supplierQuote.getUnitPrice());
        purchaseOrder.setDeliveryWarehouse(warehouse);
        purchaseOrder.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        purchaseOrder.setNotes(dto.getNotes());
        purchaseOrder = purchaseOrderRepository.save(purchaseOrder);

        supplierQuote.setStatus(QuoteStatus.CONVERTED_TO_ORDER);

        supplierQuoteRepository.save(supplierQuote);
        return convertToDto(purchaseOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderDto getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new EntityNotFoundException("Satın alma siparişi bulunamadı"));
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderDto getPurchaseOrderByOrderCode(String orderCode) {
        return purchaseOrderRepository.findByOrderCode(orderCode)
                .map(this::convertToDto)
                .orElseThrow(() -> new EntityNotFoundException("Satın alma siparişi bulunamadı"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderDto> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderDto> getPurchaseOrdersByStatus(OrderStatus status) {
        return purchaseOrderRepository.findByStatus(status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderDto> getPurchaseOrdersByWarehouse(Long warehouseId) {
        return purchaseOrderRepository.findByDeliveryWarehouseId(warehouseId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PurchaseOrderDto updateOrderStatus(Long id, OrderStatus newStatus) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Satın alma siparişi bulunamadı"));

        purchaseOrder.setStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED) {
            purchaseOrder.setActualDeliveryDate(java.time.LocalDateTime.now());
        }

        purchaseOrder = purchaseOrderRepository.save(purchaseOrder);
        return convertToDto(purchaseOrder);
    }

    @Override
    public void deletePurchaseOrder(Long id) {
        if (!purchaseOrderRepository.existsById(id)) {
            throw new EntityNotFoundException("Satın alma siparişi bulunamadı");
        }
        purchaseOrderRepository.deleteById(id);
    }

    private PurchaseOrderDto convertToDto(PurchaseOrder purchaseOrder) {
        return new PurchaseOrderDto(
                purchaseOrder.getId(),
                purchaseOrder.getOrderCode(),
                convertSupplierQuoteToDto(purchaseOrder.getSupplierQuote()),
                purchaseOrder.getQuantity(),
                purchaseOrder.getUnitPrice(),
                purchaseOrder.getTotalPrice(),
                convertWarehouseToDto(purchaseOrder.getDeliveryWarehouse()),
                purchaseOrder.getExpectedDeliveryDate(),
                purchaseOrder.getActualDeliveryDate(),
                purchaseOrder.getStatus(),
                purchaseOrder.getNotes(),
                purchaseOrder.getCreatedAt(),
                purchaseOrder.getUpdatedAt()
        );
    }

    private SupplierQuoteDto convertSupplierQuoteToDto(SupplierQuote supplierQuote) {
        if (supplierQuote == null) return null;
        
        return new SupplierQuoteDto(
                supplierQuote.getId(),
                supplierQuote.getQuoteUid(),
                supplierQuote.getRequestItem() != null ? supplierQuote.getRequestItem().getId() : null,
                convertProductToDto(supplierQuote.getRequestItem() != null ? supplierQuote.getRequestItem().getProduct() : null),
                convertSupplierToSimpleDto(supplierQuote.getSupplier()),
                supplierQuote.getUnitPrice(),
                supplierQuote.getQuantity(),
                supplierQuote.getTotalPrice(),
                supplierQuote.getCurrency(),
                supplierQuote.getDeliveryDate(),
                supplierQuote.getValidityDate(),
                supplierQuote.getNotes(),
                supplierQuote.getSupplierReference(),
                supplierQuote.getStatus(),
                supplierQuote.getRejectionReason(),
                supplierQuote.getCreatedAt(),
                supplierQuote.getUpdatedAt(),
                supplierQuote.getRespondedAt()
        );
    }

    private SupplierQuoteDto.ProductDto convertProductToDto(Product product) {
        if (product == null) return null;
        
        return new SupplierQuoteDto.ProductDto(
                product.getId(),
                product.getName(),
                product.getCode(),
                product.getDescription(),
                product.getCategory() != null ? product.getCategory().getName() : null
        );
    }

    private SupplierQuoteDto.SupplierDto convertSupplierToSimpleDto(com.anabilim.purchase.entity.Supplier supplier) {
        if (supplier == null) return null;
        
        return new SupplierQuoteDto.SupplierDto(
                supplier.getId(),
                supplier.getName(),
                supplier.getTaxNumber(),
                supplier.getContactPerson(),
                supplier.getContactPhone(),
                supplier.getContactEmail()
        );
    }

    private WarehouseDto convertWarehouseToDto(Warehouse warehouse) {
        if (warehouse == null) return null;
        
        return new WarehouseDto(
                warehouse.getId(),
                warehouse.getName(),
                warehouse.getCode(),
                warehouse.getAddress(),
                warehouse.getPhone(),
                warehouse.getEmail(),
                warehouse.getManagerName(),
                warehouse.isActive(),
                warehouse.getCreatedAt(),
                warehouse.getUpdatedAt()
        );
    }
} 