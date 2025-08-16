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
public class CreateCategoryDto {
    
    @NotBlank(message = "Kategori adı boş olamaz")
    @Size(min = 2, max = 100, message = "Kategori adı 2-100 karakter arasında olmalıdır")
    private String name;
    
    @NotBlank(message = "Kategori kodu boş olamaz")
    @Pattern(regexp = "^[A-Z0-9_]{2,20}$", message = "Kategori kodu sadece büyük harf, rakam ve alt çizgi içerebilir (2-20 karakter)")
    private String code;
    
    @Size(max = 500, message = "Açıklama en fazla 500 karakter olabilir")
    private String description;
    
    private Long parentId;
} 