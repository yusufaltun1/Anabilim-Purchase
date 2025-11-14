package com.anabilim.purchase.controller;

import com.anabilim.purchase.dto.ApiResponse;
import com.anabilim.purchase.dto.LoginResponse;
import com.anabilim.purchase.dto.request.MicrosoftCodeRequest;

import com.anabilim.purchase.service.MicrosoftAuthService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/microsoft")
@RequiredArgsConstructor
@Slf4j
public class MicrosoftAuthController {

    private final MicrosoftAuthService microsoftAuthService;

    @PostMapping("/verify-token")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyMicrosoftToken(@RequestBody MicrosoftCodeRequest request) {
        try {
            log.info("Microsoft token verification request received for user: {}", request.getEmail());
            LoginResponse response = microsoftAuthService.verifyTokenAndGenerateJwt(request);
            return ResponseEntity.ok(ApiResponse.success("Microsoft login successful", response));
        } catch (Exception e) {
            log.error("Microsoft token verification failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Microsoft token verification failed: " + e.getMessage()));
        }
    }
}
