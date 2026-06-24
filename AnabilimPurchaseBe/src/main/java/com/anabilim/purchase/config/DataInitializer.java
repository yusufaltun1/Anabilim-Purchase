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

        // Accounting permissions
        createPermission("ACCOUNTING_READ", "Muhasebe Görüntüle", "ACCOUNTING", "READ");
        
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
        // Tüm kullanıcılarda talep açma yetkisi bulunur.
        Role idariAsistan = createRole("IDARI_ASISTAN", "İdari Asistan", "Talep açabilir.");
        assignPermissionsToRole(idariAsistan, "REQUEST_CREATE", "REQUEST_READ");

        Role doktor = createRole("DOKTOR", "Doktor", "Talep açabilir.");
        assignPermissionsToRole(doktor, "REQUEST_CREATE", "REQUEST_READ");

        Role hemsire = createRole("HEMSIRE", "Hemşire", "Talep açabilir.");
        assignPermissionsToRole(hemsire, "REQUEST_CREATE", "REQUEST_READ");

        Role dizgici = createRole("DIZGICI", "Dizgici", "Talep açabilir.");
        assignPermissionsToRole(dizgici, "REQUEST_CREATE", "REQUEST_READ");

        Role uzman = createRole("UZMAN", "Uzman", "Talep açabilir.");
        assignPermissionsToRole(uzman, "REQUEST_CREATE", "REQUEST_READ");

        Role uzmanYard = createRole("UZMAN_YARDIMCISI", "Uzm Yard.", "Talep açabilir.");
        assignPermissionsToRole(uzmanYard, "REQUEST_CREATE", "REQUEST_READ");

        Role ogretmen = createRole("OGRETMEN", "Öğretmen", "Sadece talep açabilir.");
        assignPermissionsToRole(ogretmen, "REQUEST_CREATE", "REQUEST_READ");

        Role mudur = createRole("MUDUR", "Müdür", "Talep sahibi / düzenleme / onaylayıcı.");
        assignPermissionsToRole(mudur, "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN");

        Role mudurYard = createRole("MUDUR_YARDIMCISI", "Md Yard.", "Talep sahibi / düzenleme / onaylayıcı.");
        assignPermissionsToRole(mudurYard, "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN");

        Role idariYonetimMuduru = createRole("IDARI_YONETIM_MUDURU", "İdari Yönetim Müdürü", "Talep sahibi / onaylayıcı.");
        assignPermissionsToRole(idariYonetimMuduru, "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN");

        Role zumreBaskani = createRole("ZUMRE_BASKANI", "Zümre Başkanı", "Talep sahibi / düzenleme.");
        assignPermissionsToRole(zumreBaskani, "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE");

        Role bolumBaskani = createRole("BOLUM_BASKANI", "Bölüm Başkanı", "Talep sahibi / düzenleme / onaylayıcı.");
        assignPermissionsToRole(bolumBaskani, "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN");

        Role kampusMuduru = createRole("KAMPUS_MUDURU", "Kampüs Müdürü", "Talep sahibi / düzenleme / onaylayıcı.");
        assignPermissionsToRole(kampusMuduru, "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN");

        Role serkanBey = createRole("SERKAN_BEY", "Serkan Bey", "Talep sahibi / onaylayıcı.");
        assignPermissionsToRole(serkanBey, "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN");

        Role sedaHanim = createRole("SEDA_HANIM", "Seda Hanım", "Talep sahibi / onaylayıcı.");
        assignPermissionsToRole(sedaHanim, "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN");

        Role satinAlmaDepartmani = createRole("SATIN_ALMA_DEPARTMANI", "Satın Alma Departmanı",
                "Satın alma süreçlerini yönetir.");
        assignPermissionsToRole(satinAlmaDepartmani,
                "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN",
                "WORKFLOW_CREATE", "WORKFLOW_READ", "WORKFLOW_UPDATE", "WORKFLOW_DELETE",
                "INVENTORY_READ", "INVENTORY_UPDATE");

        Role bilgiIslem = createRole("BILGI_ISLEM_DEPARTMANI", "Bilgi İşlem Departmanı", "Sistem admin yetkileri.");
        assignPermissionsToRole(bilgiIslem,
                "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE", "REQUEST_DELETE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN",
                "WORKFLOW_CREATE", "WORKFLOW_READ", "WORKFLOW_UPDATE", "WORKFLOW_DELETE",
                "INVENTORY_READ", "INVENTORY_UPDATE");

        // Geriye dönük mevcut roller
        Role employeeRole = createRole("EMPLOYEE", "Çalışan", "Temel çalışan rolü");
        assignPermissionsToRole(employeeRole, "REQUEST_CREATE", "REQUEST_READ", "INVENTORY_READ");

        Role managerRole = createRole("MANAGER", "Yönetici", "Birim yöneticisi rolü");
        assignPermissionsToRole(managerRole,
                "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE", "REQUEST_DELETE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN",
                "WORKFLOW_READ", "INVENTORY_READ", "INVENTORY_UPDATE");

        Role purchaseManagerRole = createRole("PURCHASE_MANAGER", "Satınalma Müdürü", "Satınalma müdürü rolü");
        assignPermissionsToRole(purchaseManagerRole,
                "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN",
                "WORKFLOW_CREATE", "WORKFLOW_READ", "WORKFLOW_UPDATE", "WORKFLOW_DELETE",
                "INVENTORY_READ", "INVENTORY_UPDATE");

        Role adminRole = createRole("SYSTEM_ADMIN", "Sistem Yöneticisi", "Sistem yöneticisi rolü");
        assignPermissionsToRole(adminRole,
                "REQUEST_CREATE", "REQUEST_READ", "REQUEST_UPDATE", "REQUEST_DELETE",
                "APPROVAL_APPROVE", "APPROVAL_REJECT", "APPROVAL_RETURN",
                "WORKFLOW_CREATE", "WORKFLOW_READ", "WORKFLOW_UPDATE", "WORKFLOW_DELETE",
                "INVENTORY_READ", "INVENTORY_UPDATE", "ACCOUNTING_READ");

        Role muhasebeRole = createRole("MUHASEBE", "Muhasebe", "Muhasebe departmanı, sipariş ve finansal raporları görüntüler.");
        assignPermissionsToRole(muhasebeRole, "ACCOUNTING_READ", "REQUEST_READ");

        log.info("Roles oluşturuldu");
    }
    
    private Role createRole(String name, String displayName, String description) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role();
            role.setName(name);
            role.setDisplayName(displayName);
            role.setDescription(description);
            role.setIsActive(true);
            role.setIsSystemRole(true);
            return roleRepository.save(role);
        });
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