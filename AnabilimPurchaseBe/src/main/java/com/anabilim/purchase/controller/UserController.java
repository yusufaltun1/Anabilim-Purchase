package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.ApiResponse;
import com.anabilim.purchase.dto.UserDto;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    /**
     * Tüm kullanıcıları getir
     */
    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        log.info("Tüm kullanıcılar getiriliyor");
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Kullanıcılar başarıyla getirildi", users));
    }

    /**
     * Aktif kullanıcıları getir
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getActiveUsers() {
        log.info("Aktif kullanıcılar getiriliyor");
        List<UserDto> users = userService.getActiveUsers();
        return ResponseEntity.ok(ApiResponse.success("Aktif kullanıcılar başarıyla getirildi", users));
    }

    /**
     * ID'ye göre kullanıcı getir
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        log.info("Kullanıcı getiriliyor, ID: {}", id);
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Kullanıcı başarıyla getirildi", user));
    }

    /**
     * Email'e göre kullanıcı getir
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> getUserByEmail(@PathVariable String email) {
        log.info("Kullanıcı getiriliyor, email: {}", email);
        UserDto user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Kullanıcı başarıyla getirildi", user));
    }

    /**
     * Departmana göre kullanıcıları getir
     */
    @GetMapping("/department/{department}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsersByDepartment(@PathVariable String department) {
        log.info("Departmana göre kullanıcılar getiriliyor, departman: {}", department);
        List<UserDto> users = userService.getUsersByDepartment(department);
        return ResponseEntity.ok(ApiResponse.success("Kullanıcılar başarıyla getirildi", users));
    }

    /**
     * Role göre kullanıcıları getir
     */
    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsersByRole(@PathVariable String roleName) {
        log.info("Role göre kullanıcılar getiriliyor, rol: {}", roleName);
        List<UserDto> users = userService.getUsersByRole(roleName);
        return ResponseEntity.ok(ApiResponse.success("Kullanıcılar başarıyla getirildi", users));
    }

    /**
     * Yöneticiye göre kullanıcıları getir
     */
    @GetMapping("/manager/{managerId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsersByManager(@PathVariable Long managerId) {
        log.info("Yöneticiye göre kullanıcılar getiriliyor, yönetici ID: {}", managerId);
        List<UserDto> users = userService.getUsersByManager(managerId);
        return ResponseEntity.ok(ApiResponse.success("Kullanıcılar başarıyla getirildi", users));
    }

    /**
     * Yeni kullanıcı oluştur
     */
    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody UserDto userDto) {
        log.info("Yeni kullanıcı oluşturuluyor: {}", userDto.getEmail());
        UserDto createdUser = userService.createUser(userDto);
        return ResponseEntity.ok(ApiResponse.success("Kullanıcı başarıyla oluşturuldu", createdUser));
    }

    /**
     * Kullanıcı güncelle
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@PathVariable Long id, @Valid @RequestBody UserDto userDto) {
        log.info("Kullanıcı güncelleniyor, ID: {}", id);
        userDto.setId(id);
        UserDto updatedUser = userService.updateUser(userDto);
        return ResponseEntity.ok(ApiResponse.success("Kullanıcı başarıyla güncellendi", updatedUser));
    }

    /**
     * Kullanıcı sil (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        log.info("Kullanıcı siliniyor, ID: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Kullanıcı başarıyla silindi"));
    }

    /**
     * Kullanıcıya rol ekle
     */
    @PostMapping("/{id}/roles/{roleName}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> addRoleToUser(@PathVariable Long id, @PathVariable String roleName) {
        log.info("Kullanıcıya rol ekleniyor, ID: {}, Rol: {}", id, roleName);
        UserDto updatedUser = userService.addRoleToUser(id, roleName);
        return ResponseEntity.ok(ApiResponse.success("Rol başarıyla eklendi", updatedUser));
    }

    /**
     * Kullanıcıdan rol kaldır
     */
    @DeleteMapping("/{id}/roles/{roleName}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> removeRoleFromUser(@PathVariable Long id, @PathVariable String roleName) {
        log.info("Kullanıcıdan rol kaldırılıyor, ID: {}, Rol: {}", id, roleName);
        UserDto updatedUser = userService.removeRoleFromUser(id, roleName);
        return ResponseEntity.ok(ApiResponse.success("Rol başarıyla kaldırıldı", updatedUser));
    }
} 