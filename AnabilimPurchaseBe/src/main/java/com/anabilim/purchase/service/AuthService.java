package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.LoginRequest;
import com.anabilim.purchase.dto.LoginResponse;
import com.anabilim.purchase.entity.Permission;
import com.anabilim.purchase.entity.Role;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.repository.UserRepository;
import com.anabilim.purchase.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Authentication service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService implements UserDetailsService {
    
    private final UserRepository userRepository;
    private final JwtService jwtService;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı: " + email));
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password("N/A") // Microsoft 365 ile doğrulama yapılacağı için
                .authorities(getAuthorities(user))
                .accountExpired(!user.getIsActive())
                .accountLocked(!user.getIsActive())
                .credentialsExpired(false)
                .disabled(!user.getIsActive())
                .build();
    }
    
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // Microsoft 365 doğrulaması burada yapılacak
            // Şimdilik basit email kontrolü
            User user = userRepository.findByEmailAndIsActiveTrue(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı veya aktif değil"));
            
            // Son giriş zamanını güncelle
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            
            // UserDetails oluştur
            UserDetails userDetails = loadUserByUsername(user.getEmail());
            
            // Token oluştur
            String token = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            
            // Kullanıcı bilgilerini hazırla
            LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
            userInfo.setId(user.getId());
            userInfo.setEmail(user.getEmail());
            userInfo.setFirstName(user.getFirstName());
            userInfo.setLastName(user.getLastName());
            userInfo.setDisplayName(user.getDisplayName());
            userInfo.setDepartment(user.getDepartment());
            userInfo.setPosition(user.getPosition());
            userInfo.setRoles(getRoleNames(user));
            userInfo.setPermissions(getPermissionNames(user));
            
            return new LoginResponse(token, refreshToken, "Bearer", 86400000L, userInfo);
            
        } catch (Exception e) {
            log.error("Login error for user: {}", loginRequest.getEmail(), e);
            throw new RuntimeException("Giriş sırasında hata oluştu: " + e.getMessage());
        }
    }
    
    private Collection<GrantedAuthority> getAuthorities(User user) {
        Set<GrantedAuthority> authorities = new java.util.HashSet<>();
        
        if (user.getRoles() != null) {
            // Add permissions
            authorities.addAll(user.getRoles().stream()
                    .filter(role -> role != null && role.getIsActive())
                    .flatMap(role -> {
                        if (role.getPermissions() != null) {
                            return role.getPermissions().stream()
                                    .filter(permission -> permission != null && permission.getIsActive())
                                    .map(Permission::getFullPermission)
                                    .map(SimpleGrantedAuthority::new);
                        }
                        return java.util.stream.Stream.empty();
                    })
                    .collect(Collectors.toSet()));
            
            // Add roles with ROLE_ prefix
            authorities.addAll(user.getRoles().stream()
                    .filter(role -> role != null && role.getIsActive())
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                    .collect(Collectors.toSet()));
            
            log.debug("Generated authorities for user {}: {}", user.getEmail(), authorities);
        }
        
        return authorities;
    }
    
    private Set<String> getRoleNames(User user) {
        if (user.getRoles() == null) {
            return new java.util.HashSet<>();
        }
        
        return user.getRoles().stream()
                .filter(role -> role != null && role.getIsActive())
                .map(Role::getName)
                .collect(Collectors.toSet());
    }
    
    private Set<String> getPermissionNames(User user) {
        if (user.getRoles() == null) {
            return new java.util.HashSet<>();
        }
        
        return user.getRoles().stream()
                .filter(role -> role != null && role.getIsActive())
                .flatMap(role -> {
                    if (role.getPermissions() != null) {
                        return role.getPermissions().stream()
                                .filter(permission -> permission != null && permission.getIsActive())
                                .map(Permission::getName);
                    }
                    return java.util.stream.Stream.empty();
                })
                .collect(Collectors.toSet());
    }
} 