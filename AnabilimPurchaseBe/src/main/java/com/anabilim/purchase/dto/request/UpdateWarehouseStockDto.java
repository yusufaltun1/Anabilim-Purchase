package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWarehouseStockDto {
    
    @Min(value = 0, message = "Minimum stok miktarı 0'dan küçük olamaz")
    private Integer minStock;
    
    @Min(value = 0, message = "Maksimum stok miktarı 0'dan küçük olamaz")
    private Integer maxStock;
} 