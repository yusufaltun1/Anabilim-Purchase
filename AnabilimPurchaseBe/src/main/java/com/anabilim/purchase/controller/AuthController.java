package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.ApiResponse;
import com.anabilim.purchase.dto.LoginRequest;
import com.anabilim.purchase.dto.LoginResponse;
import com.anabilim.purchase.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * Kullanıcı girişi
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            log.info("Login attempt for user: {}", loginRequest.getEmail());
            
            LoginResponse response = authService.login(loginRequest);
            
            log.info("Login successful for user: {}", loginRequest.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Giriş başarılı", response));
            
        } catch (Exception e) {
            log.error("Login failed for user: {}", loginRequest.getEmail(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Giriş başarısız: " + e.getMessage()));
        }
    }
    
    /**
     * Token yenileme
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(@RequestParam String refreshToken) {
        try {
            log.info("Token refresh attempt");
            
            // TODO: Refresh token işlemi implement edilecek
            // LoginResponse response = authService.refreshToken(refreshToken);
            
            return ResponseEntity.ok(ApiResponse.success("Token yenilendi", null));
            
        } catch (Exception e) {
            log.error("Token refresh failed", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Token yenileme başarısız: " + e.getMessage()));
        }
    }
    
    /**
     * Kullanıcı çıkışı
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String token) {
        try {
            log.info("Logout attempt");
            
            // TODO: Logout işlemi implement edilecek (token blacklist)
            // authService.logout(token);
            
            return ResponseEntity.ok(ApiResponse.success("Çıkış başarılı", null));
            
        } catch (Exception e) {
            log.error("Logout failed", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Çıkış başarısız: " + e.getMessage()));
        }
    }
    
    /**
     * Kullanıcı bilgilerini getir
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse.UserInfo>> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            log.info("Get current user info");
            
            // TODO: Token'dan kullanıcı bilgilerini çıkar
            // LoginResponse.UserInfo userInfo = authService.getCurrentUser(token);
            
            return ResponseEntity.ok(ApiResponse.success("Kullanıcı bilgileri alındı", null));
            
        } catch (Exception e) {
            log.error("Get current user failed", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Kullanıcı bilgileri alınamadı: " + e.getMessage()));
        }
    }
} 