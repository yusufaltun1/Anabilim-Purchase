package com.anabilim.purchase.config;

import com.anabilim.purchase.entity.Permission;
import com.anabilim.purchase.entity.Role;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.repository.PermissionRepository;
import com.anabilim.purchase.repository.RoleRepository;
import com.anabilim.purchase.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Test verileri için data initializer
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("Test verileri oluşturuluyor...");
        
        // Permissions oluştur
        createPermissions();
        
        // Roles oluştur
        createRoles();
        
        // Users oluştur
        createUsers();
        
        log.info("Test verileri başarıyla oluşturuldu!");
    }
    
    private void createPermissions() {
        if (permissionRepository.count() > 0) {
            log.info("Permissions zaten mevcut, atlanıyor...");
            return;
        }
        
        // Request permissions
        createPermission("REQUEST_CREATE", "Talep Oluştur", "REQUEST", "CREATE");
        createPermission("REQUEST_READ", "Talep Görüntüle", "REQUEST", "READ");
        createPermission("REQUEST_UPDATE", "Talep Güncelle", "REQUEST", "UPDATE");
        createPermission("REQUEST_DELETE", "Talep Sil", "REQUEST", "DELETE");
        
        // Approval permissions
        createPermission("APPROVAL_APPROVE", "Onay Ver", "APPROVAL", "APPROVE");
        createPermission("APPROVAL_REJECT", "Reddet", "APPROVAL", "REJECT");
        createPermission("APPROVAL_RETURN", "Geri Gönder", "APPROVAL", "RETURN");
        
        // Workflow permissions
        createPermission("WORKFLOW_CREATE", "Onay Akışı Oluştur", "WORKFLOW", "CREATE");
        createPermission("WORKFLOW_READ", "Onay Akışı Görüntüle", "WORKFLOW", "READ");
        createPermission("WORKFLOW_UPDATE", "Onay Akışı Güncelle", "WORKFLOW", "UPDATE");
        createPermission("WORKFLOW_DELETE", "Onay Akışı Sil", "WORKFLOW", "DELETE");
        
        // Inventory permissions
        createPermission("INVENTORY_READ", "Envanter Görüntüle", "INVENTORY", "READ");
        createPermission("INVENTORY_UPDATE", "Envanter Güncelle", "INVENTORY", "UPDATE");
        
        log.info("Permissions oluşturuldu");
    }
    
    private void createPermission(String name, String displayName, String resource, String action) {
        Permission permission = new Permission();
        permission.setName(name);
        permission.setDisplayName(displayName);
        permission.setResource(resource);
        permission.setAction(action);
        permission.setIsActive(true);
        permissionRepository.save(permission);
    }
    
    private void createRoles() {
        if (roleRepository.count() > 0) {
            log.info("Roles zaten mevcut, atlanıyor...");
            return;
        }
        
        // Employee role
        Role employeeRole = createRole("EMPLOYEE", "Çalışan", "Temel çalışan rolü");
        assignPermissionsToRole(employeeRole, 
            "REQUEST_CREATE", "REQUEST_READ", "INVENTORY_READ");
        
        // Manager role
        Role managerRole = createRole("MANAGER", "Yönetici", "Birim yöneticisi rolü");
        assignPermissionsToRole(managerRole, 
            "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE", "REQUEST_DELETE",
            "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN",
            "WORKFLOW_READ", "INVENTORY_READ", "INVENTORY_UPDATE");
        
        // Purchase Manager role
        Role purchaseManagerRole = createRole("PURCHASE_MANAGER", "Satınalma Müdürü", "Satınalma müdürü rolü");
        assignPermissionsToRole(purchaseManagerRole, 
            "REQUEST_READ", "REQUEST_UPDATE", "APPROVAL_APPROVE", "APPROVAL_REJECT",
            "WORKFLOW_CREATE", "WORKFLOW_READ", "WORKFLOW_UPDATE", "WORKFLOW_DELETE",
            "INVENTORY_READ", "INVENTORY_UPDATE");
        
        // System Admin role
        Role adminRole = createRole("SYSTEM_ADMIN", "Sistem Yöneticisi", "Sistem yöneticisi rolü");
        assignPermissionsToRole(adminRole, 
            "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE", "REQUEST_DELETE",
            "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN",
            "WORKFLOW_CREATE", "WORKFLOW_READ", "WORKFLOW_UPDATE", "WORKFLOW_DELETE",
            "INVENTORY_READ", "INVENTORY_UPDATE");
        
        log.info("Roles oluşturuldu");
    }
    
    private Role createRole(String name, String displayName, String description) {
        Role role = new Role();
        role.setName(name);
        role.setDisplayName(displayName);
        role.setDescription(description);
        role.setIsActive(true);
        role.setIsSystemRole(true);
        return roleRepository.save(role);
    }
    
    private void assignPermissionsToRole(Role role, String... permissionNames) {
        Set<Permission> permissions = new HashSet<>();
        for (String permissionName : permissionNames) {
            permissionRepository.findByName(permissionName).ifPresent(permissions::add);
        }
        role.setPermissions(permissions);
        roleRepository.save(role);
    }
    
    private void createUsers() {
        if (userRepository.count() > 0) {
            log.info("Users zaten mevcut, atlanıyor...");
            return;
        }
        
        // Admin user
        User adminUser = createUser("admin@anabilim.com", "Admin", "User", "Sistem Yöneticisi", "IT", "Sistem Yöneticisi");
        assignRoleToUser(adminUser, "SYSTEM_ADMIN");
        
        // Manager user
        User managerUser = createUser("manager@anabilim.com", "Manager", "User", "Birim Yöneticisi", "IT", "IT Müdürü");
        assignRoleToUser(managerUser, "MANAGER");
        
        // Employee user
        User employeeUser = createUser("employee@anabilim.com", "Employee", "User", "Çalışan", "IT", "Yazılım Geliştirici");
        assignRoleToUser(employeeUser, "EMPLOYEE");
        
        // Purchase Manager user
        User purchaseManagerUser = createUser("purchase@anabilim.com", "Purchase", "Manager", "Satınalma Müdürü", "Satınalma", "Satınalma Müdürü");
        assignRoleToUser(purchaseManagerUser, "PURCHASE_MANAGER");
        
        log.info("Users oluşturuldu");
    }
    
    private User createUser(String email, String firstName, String lastName, String displayName, String department, String position) {
        User user = new User();
        user.setMicrosoft365Id(email);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setDisplayName(displayName);
        user.setDepartment(department);
        user.setPosition(position);
        user.setIsActive(true);
        return userRepository.save(user);
    }
    
    private void assignRoleToUser(User user, String roleName) {
        roleRepository.findByName(roleName).ifPresent(role -> {
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
            userRepository.save(user);
        });
    }
} 