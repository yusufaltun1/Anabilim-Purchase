package com.anabilim.purchase.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignStockItemDto {
    
    @NotNull(message = "Kullanıcı ID'si zorunludur")
    private Long userId;
    
    @NotNull(message = "Okul ID'si zorunludur")
    private Long schoolId;
    
    private String locationDetails;
    
    private String notes;
}
