package com.anabilim.purchase.dto.request;

import com.anabilim.purchase.entity.enums.MovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateStockMovementDto {
    
    @NotNull(message = "Miktar boş olamaz")
    @Min(value = 1, message = "Miktar en az 1 olmalıdır")
    private Integer quantity;
    
    @NotNull(message = "Hareket tipi boş olamaz")
    private MovementType movementType;
    
    private String referenceType;
    
    private Long referenceId;
    
    @Size(max = 500, message = "Notlar en fazla 500 karakter olabilir")
    private String notes;
} 