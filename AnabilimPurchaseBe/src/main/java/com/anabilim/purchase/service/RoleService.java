package com.anabilim.purchase.service;

import com.anabilim.purchase.entity.Permission;
import com.anabilim.purchase.entity.Role;
import com.anabilim.purchase.repository.PermissionRepository;
import com.anabilim.purchase.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Rol yönetimi için service sınıfı
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RoleService {
    
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    
    /**
     * Tüm rolleri getir
     */
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
    
    /**
     * ID'ye göre rol getir
     */
    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol bulunamadı: " + id));
    }
    
    /**
     * İsme göre rol getir
     */
    public Role getRoleByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Rol bulunamadı: " + name));
    }
    
    /**
     * Aktif rolleri getir
     */
    public List<Role> getActiveRoles() {
        return roleRepository.findByIsActiveTrue();
    }
    
    /**
     * Sistem rollerini getir
     */
    public List<Role> getSystemRoles() {
        return roleRepository.findByIsSystemRoleTrue();
    }
    
    /**
     * Yeni rol oluştur
     */
    public Role createRole(Role role) {
        // Rol ismi benzersiz olmalı
        if (roleRepository.existsByName(role.getName())) {
            throw new RuntimeException("Bu isimde bir rol zaten mevcut: " + role.getName());
        }
        
        return roleRepository.save(role);
    }
    
    /**
     * Rol güncelle
     */
    public Role updateRole(Role role) {
        Role existingRole = getRoleById(role.getId());
        
        // İsim değişiyorsa benzersizlik kontrolü yap
        if (!existingRole.getName().equals(role.getName()) && 
            roleRepository.existsByName(role.getName())) {
            throw new RuntimeException("Bu isimde bir rol zaten mevcut: " + role.getName());
        }
        
        existingRole.setName(role.getName());
        existingRole.setDisplayName(role.getDisplayName());
        existingRole.setDescription(role.getDescription());
        existingRole.setIsActive(role.getIsActive());
        existingRole.setIsSystemRole(role.getIsSystemRole());
        
        return roleRepository.save(existingRole);
    }
    
    /**
     * Rol sil
     */
    public void deleteRole(Long id) {
        Role role = getRoleById(id);
        
        // Sistem rolü silinemez
        if (role.getIsSystemRole()) {
            throw new RuntimeException("Sistem rolleri silinemez: " + role.getName());
        }
        
        // Role sahip kullanıcılar varsa silinemez
        if (!role.getUsers().isEmpty()) {
            throw new RuntimeException("Bu role sahip kullanıcılar var, silinemez: " + role.getName());
        }
        
        roleRepository.delete(role);
    }
    
    /**
     * Role permission ekle
     */
    public Role addPermissionToRole(Long roleId, String permissionName) {
        Role role = getRoleById(roleId);
        Permission permission = permissionRepository.findByName(permissionName)
                .orElseThrow(() -> new RuntimeException("Permission bulunamadı: " + permissionName));
        
        role.getPermissions().add(permission);
        return roleRepository.save(role);
    }
    
    /**
     * Role'dan permission kaldır
     */
    public Role removePermissionFromRole(Long roleId, String permissionName) {
        Role role = getRoleById(roleId);
        Permission permission = permissionRepository.findByName(permissionName)
                .orElseThrow(() -> new RuntimeException("Permission bulunamadı: " + permissionName));
        
        role.getPermissions().remove(permission);
        return roleRepository.save(role);
    }
} 