package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateWarehouseDto {
    
    @NotBlank(message = "Depo adı boş olamaz")
    @Size(min = 3, max = 100, message = "Depo adı 3-100 karakter arasında olmalıdır")
    private String name;
    
    @NotBlank(message = "Depo kodu boş olamaz")
    @Pattern(regexp = "^[A-Z0-9]{2,10}$", message = "Depo kodu 2-10 karakter arasında, sadece büyük harf ve rakam içerebilir")
    private String code;
    
    @Size(max = 255, message = "Adres en fazla 255 karakter olabilir")
    private String address;
    
    @Pattern(regexp = "^$|^[0-9]{10}$", message = "Telefon numarası 10 haneli olmalıdır")
    private String phone;
    
    @Pattern(regexp = "^$|^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", message = "Geçerli bir e-posta adresi giriniz")
    private String email;
    
    @Size(max = 100, message = "Yönetici adı en fazla 100 karakter olabilir")
    private String managerName;
} 