package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSchoolDto {
    
    @NotBlank(message = "Okul adı boş olamaz")
    @Size(min = 2, max = 255, message = "Okul adı 2-255 karakter arasında olmalıdır")
    private String name;
    
    @NotBlank(message = "Okul kodu boş olamaz")
    @Pattern(regexp = "^[A-Z0-9_]{2,20}$", message = "Okul kodu sadece büyük harf, rakam ve alt çizgi içerebilir (2-20 karakter)")
    private String code;
    
    @Size(max = 500, message = "Adres en fazla 500 karakter olabilir")
    private String address;
    
    @Pattern(regexp = "^[0-9\\s\\-\\+\\(\\)]{10,20}$", message = "Geçerli bir telefon numarası giriniz")
    private String phone;
    
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;
    
    @Size(max = 100, message = "Müdür adı en fazla 100 karakter olabilir")
    private String principalName;
    
    @Size(max = 100, message = "İlçe adı en fazla 100 karakter olabilir")
    private String district;
    
    @Size(max = 100, message = "Şehir adı en fazla 100 karakter olabilir")
    private String city;
    
    @Size(max = 50, message = "Okul türü en fazla 50 karakter olabilir")
    private String schoolType; // İlkokul, Ortaokul, Lise, Anaokulu vb.
    
    @Min(value = 1, message = "Öğrenci kapasitesi en az 1 olmalıdır")
    @Max(value = 10000, message = "Öğrenci kapasitesi en fazla 10000 olabilir")
    private Integer studentCapacity;
} 