package com.anabilim.purchase.service.impl;

import com.anabilim.purchase.dto.LoginResponse;
import com.anabilim.purchase.dto.request.MicrosoftCodeRequest;
import com.anabilim.purchase.entity.User;
import com.anabilim.purchase.repository.UserRepository;

import com.anabilim.purchase.security.JwtService;
import com.anabilim.purchase.service.AuthService;
import com.anabilim.purchase.service.MicrosoftAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MicrosoftAuthServiceImpl implements MicrosoftAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final AuthService authService;

    @Override
    public LoginResponse verifyTokenAndGenerateJwt(MicrosoftCodeRequest request) {
        try {
            log.info("Microsoft token verification request received for user: {}", request.getEmail());
            
            // 1. Microsoft Graph API'den kullanıcı bilgilerini al (opsiyonel - zaten frontend'den geliyor)
            Map<String, Object> userInfo = getUserInfoFromMicrosoft(request.getAccessToken());
            
            // 2. Manager bilgisini al
            String managerEmail = getManagerEmail(request.getAccessToken());
            
            // 3. Kullanıcıyı veritabanında bul veya oluştur
            User user = findOrCreateUser(request, (String) userInfo.get("mail"));
            
            // 4. JWT token oluştur
            String jwtToken = jwtService.generateToken(authService.loadUserByUsername(user.getEmail()));
            
            // 5. Response oluştur
            LoginResponse response = new LoginResponse();
            response.setToken(jwtToken);
            response.setUserInfo(createUserInfo(user));
            
            log.info("Microsoft login successful for user: {}", request.getEmail());
            return response;
            
        } catch (Exception e) {
            log.error("Microsoft token verification failed", e);
            throw new RuntimeException("Microsoft authentication failed: " + e.getMessage());
        }
    }

    // exchangeCodeForToken metodu artık gerekli değil - frontend'den direkt access token geliyor

    private Map<String, Object> getUserInfoFromMicrosoft(String accessToken) {
        String userInfoUrl = "https://graph.microsoft.com/v1.0/me";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            userInfoUrl, HttpMethod.GET, entity, Map.class);
        
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody();
        }
        
        throw new RuntimeException("Failed to get user info from Microsoft");
    }

    private String getManagerEmail(String accessToken) {
        try {
            String managerUrl = "https://graph.microsoft.com/v1.0/me/manager";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<?> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                managerUrl, HttpMethod.GET, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> managerInfo = response.getBody();
                return (String) managerInfo.get("mail");
            }
        } catch (Exception e) {
            log.warn("Manager bilgisi alınamadı: {}", e.getMessage());
        }
        return null;
    }

    private User findOrCreateUser(MicrosoftCodeRequest request, String managerEmail) {
        String email = request.getEmail();
        String microsoftId = request.getMicrosoftId();
        String displayName = request.getName();
        
        // Önce email ile ara
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setMicrosoftId(microsoftId);
            user.setMicrosoft365Id(microsoftId); // Microsoft365Id'yi de set et
            user.setFullName(displayName);
            
            // İsim ve soyisim ayırma
            String[] nameParts = displayName.split(" ");
            if (nameParts.length >= 2) {
                user.setFirstName(nameParts[0]);
                user.setLastName(nameParts[nameParts.length - 1]);
            } else {
                user.setFirstName(displayName);
                user.setLastName("");
            }
            
            user.setDisplayName(displayName);
            
            if (managerEmail != null) {
                updateManager(user, managerEmail);
            }
            return userRepository.save(user);
        }
        
        // Yeni kullanıcı oluştur
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(displayName);
        newUser.setMicrosoftId(microsoftId);
        newUser.setMicrosoft365Id(microsoftId); // Microsoft365Id'yi de set et
        
        // İsim ve soyisim ayırma
        String[] nameParts = displayName.split(" ");
        if (nameParts.length >= 2) {
            newUser.setFirstName(nameParts[0]);
            newUser.setLastName(nameParts[nameParts.length - 1]);
        } else {
            newUser.setFirstName(displayName);
            newUser.setLastName("");
        }
        
        // Varsayılan değerler
        newUser.setDisplayName(displayName);
        newUser.setDepartment("Unknown");
        newUser.setPosition("Unknown");
        
//        if (managerEmail != null) {
//            updateManager(newUser, managerEmail);
//        }
        
        return userRepository.save(newUser);
    }
    
    private void updateManager(User user, String managerEmail) {
        try {
            Optional<User> manager = userRepository.findByEmail(managerEmail);
            if (manager.isPresent()) {
                user.setManager(manager.get());
            } else {
                // Manager kullanıcısı yoksa oluştur
                User managerUser = new User();
                managerUser.setEmail(managerEmail);
                managerUser.setFullName(managerEmail.split("@")[0]);
                managerUser.setMicrosoft365Id(managerEmail); // Manager için email'i Microsoft365Id olarak kullan
                
                // Manager için isim ve soyisim ayırma
                String managerName = managerEmail.split("@")[0];
                String[] managerNameParts = managerName.split("\\.");
                if (managerNameParts.length >= 2) {
                    managerUser.setFirstName(managerNameParts[0]);
                    managerUser.setLastName(managerNameParts[managerNameParts.length - 1]);
                } else {
                    managerUser.setFirstName(managerName);
                    managerUser.setLastName("");
                }
                
                managerUser.setDisplayName(managerName);
                managerUser.setDepartment("Unknown");
                managerUser.setPosition("Manager");

                User savedManager = userRepository.save(managerUser);
                user.setManager(savedManager);
            }
        } catch (Exception e) {
            log.warn("Manager ataması yapılamadı: {}", e.getMessage());
        }
    }
    
    private LoginResponse.UserInfo createUserInfo(User user) {
        return LoginResponse.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getFullName())
                .build();
    }
}
