package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.request.CreateWarehouseDto;
import com.anabilim.purchase.dto.response.WarehouseDto;
import com.anabilim.purchase.entity.Warehouse;
import com.anabilim.purchase.repository.WarehouseRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseRepository warehouseRepository;

    @PostMapping
    public ResponseEntity<WarehouseDto> createWarehouse(@Valid @RequestBody CreateWarehouseDto request) {
        if (warehouseRepository.existsByCode(request.getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bu depo kodu zaten kullanılıyor");
        }

        Warehouse warehouse = new Warehouse();
        warehouse.setName(request.getName());
        warehouse.setCode(request.getCode());
        warehouse.setAddress(request.getAddress());
        warehouse.setPhone(request.getPhone());
        warehouse.setEmail(request.getEmail());
        warehouse.setManagerName(request.getManagerName());

        warehouse = warehouseRepository.save(warehouse);
        return ResponseEntity.ok(convertToDto(warehouse));
    }

    @GetMapping
    public ResponseEntity<List<WarehouseDto>> getAllWarehouses() {
        List<WarehouseDto> warehouses = warehouseRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(warehouses);
    }

    @GetMapping("/active")
    public ResponseEntity<List<WarehouseDto>> getActiveWarehouses() {
        List<WarehouseDto> warehouses = warehouseRepository.findAllByIsActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(warehouses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseDto> getWarehouse(@PathVariable Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Depo bulunamadı"));
        return ResponseEntity.ok(convertToDto(warehouse));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<WarehouseDto> toggleWarehouseStatus(@PathVariable Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Depo bulunamadı"));
        
        warehouse.setActive(!warehouse.isActive());
        warehouse = warehouseRepository.save(warehouse);
        return ResponseEntity.ok(convertToDto(warehouse));
    }

    private WarehouseDto convertToDto(Warehouse warehouse) {
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