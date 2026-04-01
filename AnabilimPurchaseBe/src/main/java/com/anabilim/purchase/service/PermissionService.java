package com.anabilim.purchase.service;

import com.anabilim.purchase.entity.Permission;
import com.anabilim.purchase.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    public List<Permission> getActivePermissions() {
        return permissionRepository.findByIsActiveTrue();
    }

    public List<Permission> getPermissionsByResource(String resource) {
        return permissionRepository.findByResource(resource);
    }

    public Permission getPermissionById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission bulunamadı: " + id));
    }

    public Permission createPermission(Permission permission) {
        if (permissionRepository.existsByName(permission.getName())) {
            throw new RuntimeException("Bu isimde permission zaten mevcut: " + permission.getName());
        }
        return permissionRepository.save(permission);
    }

    public Permission updatePermission(Long id, Permission permission) {
        Permission existing = getPermissionById(id);
        if (!existing.getName().equals(permission.getName()) && permissionRepository.existsByName(permission.getName())) {
            throw new RuntimeException("Bu isimde permission zaten mevcut: " + permission.getName());
        }
        existing.setName(permission.getName());
        existing.setDisplayName(permission.getDisplayName());
        existing.setDescription(permission.getDescription());
        existing.setResource(permission.getResource());
        existing.setAction(permission.getAction());
        existing.setIsActive(permission.getIsActive());
        return permissionRepository.save(existing);
    }

    public void deletePermission(Long id) {
        Permission permission = getPermissionById(id);
        permissionRepository.delete(permission);
    }
}
