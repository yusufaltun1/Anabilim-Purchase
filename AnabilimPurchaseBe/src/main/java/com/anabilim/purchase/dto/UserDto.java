package com.anabilim.purchase.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;

    @NotBlank(message = "Email adresi boş olamaz")
    @Email(message = "Geçerli bir email adresi giriniz")
    private String email;

    @NotBlank(message = "Ad boş olamaz")
    @Size(min = 2, max = 50, message = "Ad 2-50 karakter arasında olmalıdır")
    private String firstName;

    @NotBlank(message = "Soyad boş olamaz")
    @Size(min = 2, max = 50, message = "Soyad 2-50 karakter arasında olmalıdır")
    private String lastName;

    private String displayName;

    @NotBlank(message = "Departman boş olamaz")
    private String department;

    @NotBlank(message = "Pozisyon boş olamaz")
    private String position;

    private String phone;

    private UserManagerDto manager;
    private Set<UserManagerDto> subordinates;
    private Set<String> roles;
    private Boolean isActive = true;
    private String microsoft365Id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;

    @Data
    @NoArgsConstructor
    public static class UserBasicDto {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        
        public UserBasicDto(Long id, String email, String firstName, String lastName) {
            this.id = id;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
        }
    }
    
    @Data
    @NoArgsConstructor
    public static class UserManagerDto extends UserBasicDto {
        private String department;
        private String title;
        private UserBasicDto manager;
        
        public UserManagerDto(Long id, String email, String firstName, String lastName, String displayName, String position) {
            super(id, email, firstName, lastName);
            this.title = position;
        }
        
        public UserManagerDto(String department, String title, UserBasicDto manager) {
            this.department = department;
            this.title = title;
            this.manager = manager;
        }
    }
} 