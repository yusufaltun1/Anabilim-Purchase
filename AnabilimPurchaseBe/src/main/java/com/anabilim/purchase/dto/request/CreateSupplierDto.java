package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSupplierDto {
    
    @NotBlank(message = "Tedarikçi adı boş olamaz")
    @Size(min = 2, max = 100, message = "Tedarikçi adı 2-100 karakter arasında olmalıdır")
    private String name;
    
    @NotBlank(message = "Vergi numarası boş olamaz")
    @Pattern(regexp = "^[0-9]{10}$", message = "Vergi numarası 10 haneli olmalıdır")
    private String taxNumber;
    
    @NotBlank(message = "Vergi dairesi boş olamaz")
    private String taxOffice;
    
    @Size(max = 500, message = "Adres en fazla 500 karakter olabilir")
    private String address;
    
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Telefon numarası 10-11 haneli olmalıdır")
    private String phone;
    
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;
    
    private String website;
    
    private String contactPerson;
    
    @Pattern(regexp = "^[0-9]{10,11}$", message = "İletişim telefonu 10-11 haneli olmalıdır")
    private String contactPhone;
    
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String contactEmail;
    
    private String bankAccount;
    
    @Pattern(regexp = "^TR[0-9]{24}$", message = "Geçerli bir IBAN numarası giriniz")
    private String iban;
    
    private boolean isPreferred = false;
    
    private Set<Long> categoryIds;
} 