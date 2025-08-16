package com.anabilim.purchase.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSupplierQuoteDto {
    
    @NotNull(message = "Birim fiyat boş olamaz")
    @DecimalMin(value = "0.0", inclusive = false, message = "Birim fiyat 0'dan büyük olmalıdır")
    private BigDecimal unitPrice;
    
    @NotNull(message = "Miktar boş olamaz")
    @Min(value = 1, message = "Miktar en az 1 olmalıdır")
    private Integer quantity;
    
    @NotBlank(message = "Para birimi boş olamaz")
    @Pattern(regexp = "^(TRY|USD|EUR)$", message = "Geçersiz para birimi. TRY, USD veya EUR olmalıdır")
    private String currency;
    
    @NotNull(message = "Teslim tarihi boş olamaz")
    @Future(message = "Teslim tarihi gelecekte bir tarih olmalıdır")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deliveryDate;
    
    @Future(message = "Geçerlilik tarihi gelecekte bir tarih olmalıdır")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime validityDate;
    
    @Size(max = 1000, message = "Notlar en fazla 1000 karakter olabilir")
    private String notes;
    
    @Size(max = 100, message = "Tedarikçi referans numarası en fazla 100 karakter olabilir")
    private String supplierReference;
} 