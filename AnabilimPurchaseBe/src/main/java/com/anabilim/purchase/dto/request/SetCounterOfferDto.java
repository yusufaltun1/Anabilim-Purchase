package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetCounterOfferDto {

    @NotNull(message = "Miktar boş olamaz")
    @Min(value = 1, message = "Miktar en az 1 olmalıdır")
    private Integer quantity;

    @NotNull(message = "Birim fiyat boş olamaz")
    @DecimalMin(value = "0.0", inclusive = false, message = "Birim fiyat 0'dan büyük olmalıdır")
    private BigDecimal unitPrice;
}
