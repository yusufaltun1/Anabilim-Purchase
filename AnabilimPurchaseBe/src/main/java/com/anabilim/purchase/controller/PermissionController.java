package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.PermissionDto;
import com.anabilim.purchase.entity.Permission;
import com.anabilim.purchase.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<List<PermissionDto>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions().stream().map(this::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/active")
    public ResponseEntity<List<PermissionDto>> getActivePermissions() {
        return ResponseEntity.ok(permissionService.getActivePermissions().stream().map(this::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/resource/{resource}")
    public ResponseEntity<List<PermissionDto>> getPermissionsByResource(@PathVariable String resource) {
        return ResponseEntity.ok(permissionService.getPermissionsByResource(resource).stream().map(this::toDto).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<PermissionDto> createPermission(@RequestBody PermissionDto dto) {
        Permission created = permissionService.createPermission(toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PermissionDto> updatePermission(@PathVariable Long id, @RequestBody PermissionDto dto) {
        return ResponseEntity.ok(toDto(permissionService.updatePermission(id, toEntity(dto))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }

    private PermissionDto toDto(Permission p) {
        return new PermissionDto(
                p.getId(),
                p.getName(),
                p.getDisplayName(),
                p.getDescription(),
                p.getResource(),
                p.getAction(),
                p.getIsActive(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    private Permission toEntity(PermissionDto dto) {
        Permission p = new Permission();
        p.setId(dto.getId());
        p.setName(dto.getName());
        p.setDisplayName(dto.getDisplayName());
        p.setDescription(dto.getDescription());
        p.setResource(dto.getResource());
        p.setAction(dto.getAction());
        p.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return p;
    }
}
