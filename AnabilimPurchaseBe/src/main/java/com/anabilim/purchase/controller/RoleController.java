package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.RoleDto;
import com.anabilim.purchase.entity.Role;
import com.anabilim.purchase.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Rol yönetimi için REST controller
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {
    
    private final RoleService roleService;
    
    /**
     * Tüm rolleri getir
     */
    @GetMapping
    @PreAuthorize("hasAuthority('WORKFLOW_READ') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<RoleDto>> getAllRoles() {
        log.info("Tüm roller getiriliyor");
        List<Role> roles = roleService.getAllRoles();
        List<RoleDto> roleDtos = roles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roleDtos);
    }
    
    /**
     * ID'ye göre rol getir
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('WORKFLOW_READ') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<RoleDto> getRoleById(@PathVariable Long id) {
        log.info("Rol getiriliyor, ID: {}", id);
        Role role = roleService.getRoleById(id);
        return ResponseEntity.ok(convertToDto(role));
    }
    
    /**
     * İsme göre rol getir
     */
    @GetMapping("/name/{name}")
    @PreAuthorize("hasAuthority('WORKFLOW_READ') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<RoleDto> getRoleByName(@PathVariable String name) {
        log.info("Rol getiriliyor, isim: {}", name);
        Role role = roleService.getRoleByName(name);
        return ResponseEntity.ok(convertToDto(role));
    }
    
    /**
     * Aktif rolleri getir
     */
    @GetMapping("/active")
    @PreAuthorize("hasAuthority('WORKFLOW_READ') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<RoleDto>> getActiveRoles() {
        log.info("Aktif roller getiriliyor");
        List<Role> roles = roleService.getActiveRoles();
        List<RoleDto> roleDtos = roles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roleDtos);
    }
    
    /**
     * Sistem rollerini getir
     */
    @GetMapping("/system")
    @PreAuthorize("hasAuthority('WORKFLOW_READ') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<RoleDto>> getSystemRoles() {
        log.info("Sistem rolleri getiriliyor");
        List<Role> roles = roleService.getSystemRoles();
        List<RoleDto> roleDtos = roles.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roleDtos);
    }
    
    /**
     * Yeni rol oluştur
     */
    @PostMapping
    @PreAuthorize("hasAuthority('WORKFLOW_CREATE') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<RoleDto> createRole(@RequestBody RoleDto roleDto) {
        log.info("Yeni rol oluşturuluyor: {}", roleDto.getName());
        Role role = convertToEntity(roleDto);
        Role createdRole = roleService.createRole(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(createdRole));
    }
    
    /**
     * Rol güncelle
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WORKFLOW_UPDATE') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<RoleDto> updateRole(@PathVariable Long id, @RequestBody RoleDto roleDto) {
        log.info("Rol güncelleniyor, ID: {}", id);
        Role role = convertToEntity(roleDto);
        role.setId(id);
        Role updatedRole = roleService.updateRole(role);
        return ResponseEntity.ok(convertToDto(updatedRole));
    }
    
    /**
     * Rol sil
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('WORKFLOW_DELETE') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        log.info("Rol siliniyor, ID: {}", id);
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Role permission ekle
     */
    @PostMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('WORKFLOW_UPDATE') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<RoleDto> addPermissionToRole(@PathVariable Long id, @RequestParam String permissionName) {
        log.info("Role permission ekleniyor, Role ID: {}, Permission: {}", id, permissionName);
        Role updatedRole = roleService.addPermissionToRole(id, permissionName);
        return ResponseEntity.ok(convertToDto(updatedRole));
    }
    
    /**
     * Role'dan permission kaldır
     */
    @DeleteMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('WORKFLOW_UPDATE') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<RoleDto> removePermissionFromRole(@PathVariable Long id, @RequestParam String permissionName) {
        log.info("Role'dan permission kaldırılıyor, Role ID: {}, Permission: {}", id, permissionName);
        Role updatedRole = roleService.removePermissionFromRole(id, permissionName);
        return ResponseEntity.ok(convertToDto(updatedRole));
    }
    
    // DTO dönüşüm metodları
    private RoleDto convertToDto(Role role) {
        RoleDto dto = new RoleDto();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDisplayName(role.getDisplayName());
        dto.setDescription(role.getDescription());
        dto.setIsActive(role.getIsActive());
        dto.setIsSystemRole(role.getIsSystemRole());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setUpdatedAt(role.getUpdatedAt());
        
        // Permission isimlerini ekle
        if (role.getPermissions() != null) {
            dto.setPermissionNames(role.getPermissions().stream()
                    .map(permission -> permission.getName())
                    .collect(Collectors.toSet()));
        }
        
        return dto;
    }
    
    private Role convertToEntity(RoleDto dto) {
        Role role = new Role();
        role.setId(dto.getId());
        role.setName(dto.getName());
        role.setDisplayName(dto.getDisplayName());
        role.setDescription(dto.getDescription());
        role.setIsActive(dto.getIsActive());
        role.setIsSystemRole(dto.getIsSystemRole());
        return role;
    }
} 